import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

// Validation schemas
const createSavedSearchSchema = z.object({
  name: z.string().min(1).max(100),
  query: z.string().min(1).max(200),
  type: z.enum(['all', 'users', 'posts', 'conversations']),
  filters: z.object({
    sortBy: z.enum(['relevance', 'date', 'popularity']).optional(),
    dateRange: z.enum(['all', 'day', 'week', 'month', 'year']).optional(),
    verified: z.boolean().optional()
  }).optional(),
  notifications: z.boolean().optional().default(false)
});

const updateSavedSearchSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  query: z.string().min(1).max(200).optional(),
  type: z.enum(['all', 'users', 'posts', 'conversations']).optional(),
  filters: z.object({
    sortBy: z.enum(['relevance', 'date', 'popularity']).optional(),
    dateRange: z.enum(['all', 'day', 'week', 'month', 'year']).optional(),
    verified: z.boolean().optional()
  }).optional(),
  notifications: z.boolean().optional(),
  isActive: z.boolean().optional()
});

const getSavedSearchesSchema = z.object({
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
  active: z.string().optional().transform(val => val === 'true')
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
        return await getSavedSearches(req, res, currentUserId);
      case 'POST':
        return await createSavedSearch(req, res, currentUserId);
      case 'PUT':
        return await updateSavedSearch(req, res, currentUserId);
      case 'DELETE':
        return await deleteSavedSearch(req, res, currentUserId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Saved search error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to manage saved searches'
    });
  }
}

// Get saved searches
async function getSavedSearches(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const validation = getSavedSearchesSchema.safeParse(req.query);
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Invalid parameters',
      details: validation.error.errors
    });
  }

  const { limit, offset, active } = validation.data;

  const whereClause: any = {
    userId
  };

  if (active !== undefined) {
    whereClause.isActive = active;
  }

  const [savedSearches, total] = await Promise.all([
    prisma.savedSearch.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        query: true,
        type: true,
        filters: true,
        notifications: true,
        isActive: true,
        lastUsed: true,
        useCount: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { isActive: 'desc' },
        { lastUsed: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    }),
    prisma.savedSearch.count({ where: whereClause })
  ]);

  // Parse filters for each saved search
  const formattedSearches = savedSearches.map(search => ({
    ...search,
    filters: search.filters ? JSON.parse(search.filters) : null
  }));

  return res.status(200).json({
    savedSearches: formattedSearches,
    pagination: {
      limit,
      offset,
      total,
      hasMore: offset + limit < total
    }
  });
}

// Create saved search
async function createSavedSearch(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const validation = createSavedSearchSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Invalid request body',
      details: validation.error.errors
    });
  }

  const { name, query, type, filters, notifications } = validation.data;

  // Check if user already has a saved search with this name
  const existingSearch = await prisma.savedSearch.findFirst({
    where: {
      userId,
      name
    }
  });

  if (existingSearch) {
    return res.status(409).json({ 
      error: 'A saved search with this name already exists' 
    });
  }

  // Check user's saved search limit (e.g., 50 saved searches)
  const savedSearchCount = await prisma.savedSearch.count({
    where: { userId }
  });

  if (savedSearchCount >= 50) {
    return res.status(400).json({ 
      error: 'Maximum number of saved searches reached (50)' 
    });
  }

  // Create the saved search
  const savedSearch = await prisma.savedSearch.create({
    data: {
      userId,
      name,
      query,
      type,
      filters: filters ? JSON.stringify(filters) : null,
      notifications: notifications || false,
      isActive: true,
      useCount: 0
    },
    select: {
      id: true,
      name: true,
      query: true,
      type: true,
      filters: true,
      notifications: true,
      isActive: true,
      lastUsed: true,
      useCount: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return res.status(201).json({
    message: 'Saved search created successfully',
    savedSearch: {
      ...savedSearch,
      filters: savedSearch.filters ? JSON.parse(savedSearch.filters) : null
    }
  });
}

// Update saved search
async function updateSavedSearch(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const validation = updateSavedSearchSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Invalid request body',
      details: validation.error.errors
    });
  }

  const { id, name, query, type, filters, notifications, isActive } = validation.data;

  // Check if saved search exists and belongs to user
  const existingSearch = await prisma.savedSearch.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingSearch) {
    return res.status(404).json({ error: 'Saved search not found' });
  }

  // If updating name, check for duplicates
  if (name && name !== existingSearch.name) {
    const duplicateSearch = await prisma.savedSearch.findFirst({
      where: {
        userId,
        name,
        NOT: { id }
      }
    });

    if (duplicateSearch) {
      return res.status(409).json({ 
        error: 'A saved search with this name already exists' 
      });
    }
  }

  // Update the saved search
  const updatedSearch = await prisma.savedSearch.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(query && { query }),
      ...(type && { type }),
      ...(filters && { filters: JSON.stringify(filters) }),
      ...(notifications !== undefined && { notifications }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date()
    },
    select: {
      id: true,
      name: true,
      query: true,
      type: true,
      filters: true,
      notifications: true,
      isActive: true,
      lastUsed: true,
      useCount: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return res.status(200).json({
    message: 'Saved search updated successfully',
    savedSearch: {
      ...updatedSearch,
      filters: updatedSearch.filters ? JSON.parse(updatedSearch.filters) : null
    }
  });
}

// Delete saved search
async function deleteSavedSearch(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Search ID is required' });
  }

  // Check if saved search exists and belongs to user
  const existingSearch = await prisma.savedSearch.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingSearch) {
    return res.status(404).json({ error: 'Saved search not found' });
  }

  // Delete the saved search
  await prisma.savedSearch.delete({
    where: { id }
  });

  return res.status(200).json({
    message: 'Saved search deleted successfully'
  });
}

// Export types for frontend use
export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  type: string;
  filters: any;
  notifications: boolean;
  isActive: boolean;
  lastUsed: Date | null;
  useCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedSearchResponse {
  savedSearches: SavedSearch[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}