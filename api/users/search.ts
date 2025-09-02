import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

// Validation schema
const searchSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
  type: z.enum(['all', 'following', 'followers']).optional().default('all')
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate query parameters
    const validation = searchSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid parameters',
        details: validation.error.errors
      });
    }

    const { q, limit, offset, type } = validation.data;
    const currentUserId = session.user.id;

    // Build search conditions
    const searchConditions = {
      OR: [
        {
          name: {
            contains: q,
            mode: 'insensitive' as const
          }
        },
        {
          username: {
            contains: q,
            mode: 'insensitive' as const
          }
        },
        {
          email: {
            contains: q,
            mode: 'insensitive' as const
          }
        }
      ],
      // Exclude current user
      NOT: {
        id: currentUserId
      }
    };

    // Add type-specific filters
    let additionalWhere = {};
    if (type === 'following') {
      additionalWhere = {
        followers: {
          some: {
            followerId: currentUserId
          }
        }
      };
    } else if (type === 'followers') {
      additionalWhere = {
        following: {
          some: {
            followingId: currentUserId
          }
        }
      };
    }

    // Search users
    const users = await prisma.user.findMany({
      where: {
        ...searchConditions,
        ...additionalWhere
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        },
        // Check if current user follows this user
        followers: {
          where: {
            followerId: currentUserId
          },
          select: {
            id: true
          }
        },
        // Check if this user follows current user
        following: {
          where: {
            followingId: currentUserId
          },
          select: {
            id: true
          }
        }
      },
      orderBy: [
        // Prioritize verified users
        { isVerified: 'desc' },
        // Then by follower count
        { followers: { _count: 'desc' } },
        // Then by creation date
        { createdAt: 'desc' }
      ],
      take: Math.min(limit, 50), // Max 50 results
      skip: offset
    });

    // Transform results
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      image: user.image,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      stats: {
        followers: user._count.followers,
        following: user._count.following,
        posts: user._count.posts
      },
      // Relationship status with current user
      isFollowing: user.followers.length > 0,
      isFollower: user.following.length > 0
    }));

    // Get total count for pagination
    const totalCount = await prisma.user.count({
      where: {
        ...searchConditions,
        ...additionalWhere
      }
    });

    return res.status(200).json({
      users: transformedUsers,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      query: q,
      type
    });

  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to search users'
    });
  }
}

// Export types for frontend use
export interface SearchUsersResponse {
  users: Array<{
    id: string;
    name: string;
    username: string;
    email: string;
    image?: string;
    isVerified: boolean;
    createdAt: string;
    stats: {
      followers: number;
      following: number;
      posts: number;
    };
    isFollowing: boolean;
    isFollower: boolean;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  query: string;
  type: string