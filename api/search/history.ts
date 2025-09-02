import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

// Validation schemas
const getHistorySchema = z.object({
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
  type: z.enum(['all', 'users', 'posts', 'conversations']).optional()
});

const deleteHistorySchema = z.object({
  id: z.string().optional(),
  all: z.string().optional().transform(val => val === 'true')
});

const updateHistorySchema = z.object({
  id: z.string(),
  favorite: z.boolean().optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const currentUserId = session.user.id;

    switch (req.method) {
      case 'GET':
        return await getSearchHistory(req, res, currentUserId);
      case 'DELETE':
        return await deleteSearchHistory(req, res, currentUserId);
      case 'PUT':
        return await updateSearchHistory(req, res, currentUserId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Search history error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to manage search history'
    });
  }
}

// Get search history
async function getSearchHistory(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const validation = getHistorySchema.safeParse(req.query);
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Invalid parameters',
      details: validation.error.errors
    });
  }

  const { limit, offset, type } = validation.data;

  const whereClause: any = {
    userId
  };

  if (type && type !== 'all') {
    whereClause.type = type;
  }

  const [history, total] = await Promise.all([
    prisma.searchHistory.findMany({
      where: whereClause,
      select: {
        id: true,
        query: true,
        type: true,
        filters: true,
        resultsCount: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { isFavorite: 'desc' },
        { updatedAt: 'desc' }
      ],
      take: limit,
      skip: offset
    }),
    prisma.searchHistory.count({ where: whereClause })
  ]);

  // Parse filters for each history item
  const formattedHistory = history.map(item => ({
    ...item,
    filters: item.filters ? JSON.parse(item.filters) : null
  }));

  return res.status(200).json({
    history: formattedHistory,
    pagination: {
      limit,
      offset,
      total,
      hasMore: offset + limit < total
    }
  });
}

// Delete search history
async function deleteSearchHistory(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const validation = deleteHistorySchema.safeParse(req.query);
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Invalid parameters',
      details: validation.error.errors
    });
  }

  const { id, all } = validation.data;

  if (all) {
    // Delete all search history for user
    const result = await prisma.searchHistory.deleteMany({
      where: { userId }
    });

    return res.status(200).json({
      message: 'All search history deleted',
      deletedCount: result.count
    });
  } else if (id) {
    // Delete specific search history item
    const historyItem = await prisma.searchHistory.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!historyItem) {
      return res.status(404).json({ error: 'Search history item not found' });
    }

    await prisma.searchHistory.delete({
      where: { id }
    });

    return res.status(200).json({
      message: 'Search history item deleted'
    });
  } else {
    return res.status(400).json({ 
      error: 'Either id or all parameter is required' 
    });
  }
}

// Update search history (e.g., mark as favorite)
async function updateSearchHistory(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const validation = updateHistorySchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Invalid request body',
      details: validation.error.errors
    });
  }

  const { id, favorite } = validation.data;

  // Check if history item exists and belongs to user
  const historyItem = await prisma.searchHistory.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!historyItem) {
    return res.status(404).json({ error: 'Search history item not found' });
  }

  // Update the history item
  const updatedItem = await prisma.searchHistory.update({
    where: { id },
    data: {
      ...(favorite !== undefined && { isFavorite: favorite }),
      updatedAt: new Date()
    },
    select: {
      id: true,
      query: true,
      type: true,
      filters: true,
      resultsCount: true,
      isFavorite: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return res.status(200).json({
    message: 'Search history updated',
    history: {
      ...updatedItem,
      filters: updatedItem.filters ? JSON.parse(updatedItem.filters) : null
    }
  });
}

// Export types for frontend use
export interface SearchHistoryItem {
  id: string;
  query: string;
  type: string;
  filters: any;
  resultsCount: number;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchHistoryResponse {
  history: SearchHistoryItem[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}