import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FeedPost } from '@/types/feed';
import { z } from 'zod';

// Marcar como ruta dinámica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  kind: z.enum(['post', 'photo', 'video', 'question', 'note']).optional(),
  author: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// GET /api/feed/search - Search feed posts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const query = searchQuerySchema.parse(Object.fromEntries(searchParams));

    const searchTerm = query.q.trim();
    const isHashtagSearch = searchTerm.startsWith('#');
    const hashtag = isHashtagSearch ? searchTerm.slice(1).toLowerCase() : null;

    // Build base where clause for visibility
    const baseWhereClause: any = userId
      ? {
          OR: [
            { visibility: 'public' },
            {
              visibility: 'university'
            },
            {
              visibility: 'friends',
              author: {
                followers: {
                  some: { followerId: userId }
                }
              }
            },
            { authorId: userId } // User's own posts
          ]
        }
      : { visibility: 'public' };

    // Add search conditions
    const searchConditions: any[] = [];

    if (isHashtagSearch && hashtag) {
      // Hashtag search
      searchConditions.push({
        tags: {
          has: hashtag
        }
      });
    } else {
      // Text search in content
      const textSearchConditions = {
        content: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      };
      searchConditions.push(textSearchConditions);
    }

    // Combine base visibility with search conditions
    const whereClause = {
      AND: [
        baseWhereClause,
        ...searchConditions
      ]
    };

    // Add additional filters
    if (query.kind) {
      whereClause.AND.push({ type: query.kind });
    }

    if (query.author) {
      whereClause.AND.push({
        author: { username: query.author }
      });
    }

    if (query.dateFrom || query.dateTo) {
      const dateFilter: any = {};
      if (query.dateFrom) {
        dateFilter.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        dateFilter.lte = new Date(query.dateTo);
      }
      whereClause.AND.push({ createdAt: dateFilter });
    }

    // Cursor pagination
    if (query.cursor) {
      whereClause.AND.push({
        id: { lt: query.cursor }
      });
    }

    // Search with relevance scoring
    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: [
        // Boost recent posts in search results
        { createdAt: 'desc' }
      ],
      take: query.limit + 1,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            verified: true
          }
        },
        ...(userId && {
          likes: {
            where: { userId },
            select: { id: true }
          },
        bookmarks: {
            where: { userId },
            select: { id: true }
          }
        }),
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true
          }
        }
      }
    });

    const hasMore = posts.length > query.limit;
    const resultPosts = posts.slice(0, query.limit);
    const nextCursor = hasMore ? resultPosts[resultPosts.length - 1]?.id : undefined;

    // Transform to FeedPost format
    const transformedPosts = resultPosts.map((post: any) => ({
      id: post.id,
      kind: post.type as any,
      author: post.author,
      createdAt: post.createdAt.toISOString(),
      text: post.content || undefined,
      media: post.imageUrl || post.videoUrl ? [{
        id: '1',
        type: post.imageUrl ? 'image' : 'video',
        url: post.imageUrl || post.videoUrl || '',
        alt: ''
      }] : undefined,
      visibility: post.visibility as any,
      hashtags: post.tags || undefined,
      stats: {
        fires: post._count.likes,
        comments: post._count.comments,
        shares: 0,
        saves: post._count.bookmarks
      },
      viewerState: {
        fired: userId ? post.likes?.length > 0 : false,
        saved: userId ? post.bookmarks?.length > 0 : false
      }
    })) as FeedPost[];

    // Analytics tracking would go here if needed

    return NextResponse.json({
      posts: transformedPosts,
      nextCursor,
      hasMore,
      query: {
        term: searchTerm,
        isHashtagSearch,
        hashtag
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}