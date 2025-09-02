import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

// Validation schema
const searchSchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(['all', 'users', 'posts', 'conversations']).optional().default('all'),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
  sortBy: z.enum(['relevance', 'date', 'popularity']).optional().default('relevance'),
  dateRange: z.enum(['all', 'day', 'week', 'month', 'year']).optional().default('all'),
  verified: z.string().optional().transform(val => val === 'true')
});

// Helper function to get date filter
const getDateFilter = (dateRange: string) => {
  const now = new Date();
  switch (dateRange) {
    case 'day':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
};

// Search users
const searchUsers = async (query: string, options: any, currentUserId: string) => {
  const { limit, offset, verified, dateRange, sortBy } = options;
  const dateFilter = getDateFilter(dateRange);

  const whereClause: any = {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { username: { contains: query, mode: 'insensitive' } },
      { bio: { contains: query, mode: 'insensitive' } }
    ],
    NOT: { id: currentUserId }
  };

  if (verified) {
    whereClause.isVerified = true;
  }

  if (dateFilter) {
    whereClause.createdAt = { gte: dateFilter };
  }

  // Define order by clause
  let orderBy: any = [];
  switch (sortBy) {
    case 'popularity':
      orderBy = [{ followers: { _count: 'desc' } }, { createdAt: 'desc' }];
      break;
    case 'date':
      orderBy = [{ createdAt: 'desc' }];
      break;
    default: // relevance
      orderBy = [
        { isVerified: 'desc' },
        { followers: { _count: 'desc' } },
        { createdAt: 'desc' }
      ];
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      isVerified: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true
        }
      },
      followers: {
        where: { followerId: currentUserId },
        select: { id: true }
      }
    },
    orderBy,
    take: limit,
    skip: offset
  });

  return users.map(user => ({
    id: user.id,
    name: user.name,
    username: user.username,
    image: user.image,
    bio: user.bio,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    stats: {
      followers: user._count.followers,
      following: user._count.following,
      posts: user._count.posts
    },
    isFollowing: user.followers.length > 0,
    type: 'user' as const
  }));
};

// Search posts
const searchPosts = async (query: string, options: any, currentUserId: string) => {
  const { limit, offset, dateRange, sortBy } = options;
  const dateFilter = getDateFilter(dateRange);

  const whereClause: any = {
    OR: [
      { content: { contains: query, mode: 'insensitive' } },
      { title: { contains: query, mode: 'insensitive' } }
    ],
    // Only show public posts or posts from followed users
    OR: [
      { privacy: 'PUBLIC' },
      {
        AND: [
          { privacy: 'FOLLOWERS' },
          {
            author: {
              followers: {
                some: { followerId: currentUserId }
              }
            }
          }
        ]
      },
      { authorId: currentUserId } // User's own posts
    ]
  };

  if (dateFilter) {
    whereClause.createdAt = { gte: dateFilter };
  }

  let orderBy: any = [];
  switch (sortBy) {
    case 'popularity':
      orderBy = [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }];
      break;
    case 'date':
      orderBy = [{ createdAt: 'desc' }];
      break;
    default: // relevance
      orderBy = [
        { likes: { _count: 'desc' } },
        { comments: { _count: 'desc' } },
        { createdAt: 'desc' }
      ];
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      privacy: true,
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          isVerified: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true,
          shares: true
        }
      },
      likes: {
        where: { userId: currentUserId },
        select: { id: true }
      }
    },
    orderBy,
    take: limit,
    skip: offset
  });

  return posts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
    createdAt: post.createdAt,
    privacy: post.privacy,
    author: post.author,
    stats: {
      likes: post._count.likes,
      comments: post._count.comments,
      shares: post._count.shares
    },
    isLiked: post.likes.length > 0,
    type: 'post' as const
  }));
};

// Search conversations
const searchConversations = async (query: string, options: any, currentUserId: string) => {
  const { limit, offset, dateRange } = options;
  const dateFilter = getDateFilter(dateRange);

  const whereClause: any = {
    participants: {
      some: { userId: currentUserId }
    },
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      {
        participants: {
          some: {
            user: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { username: { contains: query, mode: 'insensitive' } }
              ]
            }
          }
        }
      }
    ]
  };

  if (dateFilter) {
    whereClause.createdAt = { gte: dateFilter };
  }

  const conversations = await prisma.conversation.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      type: true,
      createdAt: true,
      participants: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          }
        }
      },
      _count: {
        select: {
          messages: true
        }
      }
    },
    orderBy: [{ updatedAt: 'desc' }],
    take: limit,
    skip: offset
  });

  return conversations.map(conversation => ({
    id: conversation.id,
    title: conversation.title,
    type: conversation.type,
    createdAt: conversation.createdAt,
    participants: conversation.participants.map(p => p.user),
    messageCount: conversation._count.messages,
    type: 'conversation' as const
  }));
};

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

    const { q, type, limit, offset, sortBy, dateRange, verified } = validation.data;
    const currentUserId = session.user.id;

    let results: any = {
      query: q,
      type,
      results: [],
      pagination: {
        limit,
        offset,
        total: 0,
        hasMore: false
      }
    };

    // Perform search based on type
    switch (type) {
      case 'users':
        const users = await searchUsers(q, { limit, offset, verified, dateRange, sortBy }, currentUserId);
        const userCount = await prisma.user.count({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { username: { contains: q, mode: 'insensitive' } },
              { bio: { contains: q, mode: 'insensitive' } }
            ],
            NOT: { id: currentUserId },
            ...(verified ? { isVerified: true } : {}),
            ...(getDateFilter(dateRange) ? { createdAt: { gte: getDateFilter(dateRange) } } : {})
          }
        });
        results.results = users;
        results.pagination.total = userCount;
        break;

      case 'posts':
        const posts = await searchPosts(q, { limit, offset, dateRange, sortBy }, currentUserId);
        const postCount = await prisma.post.count({
          where: {
            OR: [
              { content: { contains: q, mode: 'insensitive' } },
              { title: { contains: q, mode: 'insensitive' } }
            ],
            OR: [
              { privacy: 'PUBLIC' },
              {
                AND: [
                  { privacy: 'FOLLOWERS' },
                  {
                    author: {
                      followers: {
                        some: { followerId: currentUserId }
                      }
                    }
                  }
                ]
              },
              { authorId: currentUserId }
            ],
            ...(getDateFilter(dateRange) ? { createdAt: { gte: getDateFilter(dateRange) } } : {})
          }
        });
        results.results = posts;
        results.pagination.total = postCount;
        break;

      case 'conversations':
        const conversations = await searchConversations(q, { limit, offset, dateRange }, currentUserId);
        results.results = conversations;
        results.pagination.total = conversations.length;
        break;

      default: // 'all'
        // Search all types with smaller limits
        const allLimit = Math.ceil(limit / 3);
        const [allUsers, allPosts, allConversations] = await Promise.all([
          searchUsers(q, { limit: allLimit, offset: 0, verified, dateRange, sortBy }, currentUserId),
          searchPosts(q, { limit: allLimit, offset: 0, dateRange, sortBy }, currentUserId),
          searchConversations(q, { limit: allLimit, offset: 0, dateRange }, currentUserId)
        ]);
        
        results.results = {
          users: allUsers,
          posts: allPosts,
          conversations: allConversations
        };
        results.pagination.total = allUsers.length + allPosts.length + allConversations.length;
        break;
    }

    results.pagination.hasMore = offset + limit < results.pagination.total;

    // Save search history
    try {
      await prisma.searchHistory.create({
        data: {
          userId: currentUserId,
          query: q,
          type,
          filters: JSON.stringify({ sortBy, dateRange, verified }),
          resultsCount: results.pagination.total
        }
      });
    } catch (error) {
      // Don't fail the search if history saving fails
      console.error('Failed to save search history:', error);
    }

    return res.status(200).json(results);

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to perform search'
    });
  }
}

// Export types for frontend use
export interface SearchResult {
  query: string;
  type: string;
  results: any;
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}