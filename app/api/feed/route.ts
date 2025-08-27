import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FeedPost, FeedResponse, CreatePostData, FeedRanking } from '@/types/feed';
import { z } from 'zod';

// Validation schemas
const createPostSchema = z.object({
  kind: z.enum(['post', 'photo', 'video', 'question', 'note']),
  text: z.string().optional(),
  title: z.string().optional(),
  visibility: z.enum(['public', 'university', 'friends', 'private']),
  hashtags: z.array(z.string()).optional(),
  mediaUrls: z.array(z.string()).optional(), // URLs of uploaded media
});

const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  ranking: z.enum(['home', 'recent', 'saved', 'trending']).default('home'),
  kind: z.enum(['post', 'photo', 'video', 'question', 'note']).optional(),
  author: z.string().optional(),
  hashtag: z.string().optional(),
});

// GET /api/feed - Fetch feed posts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const query = feedQuerySchema.parse(Object.fromEntries(searchParams));

    // Build where clause based on filters
    const whereClause: any = userId
      ? {
          // Visibility filter based on user's access level
          OR: [
            { visibility: 'public' },
            {
              visibility: 'university',
              // University filtering would go here
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

    // Apply additional filters
    if (query.kind) {
      whereClause.kind = query.kind;
    }

    if (query.author) {
      whereClause.author = { username: query.author };
    }

    if (query.hashtag) {
      whereClause.hashtags = {
        has: query.hashtag
      };
    }

    // Cursor pagination
    if (query.cursor) {
      whereClause.id = {
        lt: query.cursor
      };
    }

    // Determine order by ranking
    let orderBy: any = { createdAt: 'desc' };
    if (query.ranking === 'trending') {
      // Simple trending algorithm based on recent engagement
      orderBy = [
        { fires: { _count: 'desc' } },
        { comments: { _count: 'desc' } },
        { createdAt: 'desc' }
      ];
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy,
      take: query.limit + 1, // Take one extra to check if there are more
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
    const feedPosts = posts.slice(0, query.limit);
    const nextCursor = hasMore ? feedPosts[feedPosts.length - 1]?.id : undefined;

    // Transform to FeedPost format
    const transformedPosts: FeedPost[] = feedPosts.map((post: any) => ({
      id: post.id,
      kind: post.type as any,
      author: post.author as any,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt?.toISOString(),
      text: post.content || undefined,
      media: post.imageUrl || post.videoUrl ? [{
        id: '1',
        type: post.imageUrl ? 'image' : 'video',
        url: post.imageUrl || post.videoUrl!,
        name: post.imageUrl ? 'image' : 'video'
      }] : undefined,
      visibility: post.visibility as any,
      hashtags: post.tags || undefined,
      stats: {
        fires: post._count.likes,
        comments: post._count.comments,
        shares: 0,
        saves: post._count.bookmarks,
        views: 0
      },
      viewerState: {
        fired: userId ? post.likes.length > 0 : false,
        saved: userId ? post.bookmarks.length > 0 : false,
        shared: false
      }
    }));

    const response: FeedResponse = {
      posts: transformedPosts,
      nextCursor,
      hasMore
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Feed GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/feed - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createPostSchema.parse(body);

    // Extract hashtags from text
    const hashtags = data.hashtags || [];
    if (data.text) {
      const textHashtags = data.text.match(/#[\w\u00c0-\u024f\u1e00-\u1eff]+/g) || [];
      hashtags.push(...textHashtags.map(tag => tag.slice(1).toLowerCase()));
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        type: data.kind as any,
        content: data.text || '',
        visibility: data.visibility.toUpperCase() as any,
        tags: [...new Set(hashtags)], // Remove duplicates
        authorId: session.user.id,
        imageUrl: data.mediaUrls?.[0] || null,
        videoUrl: data.mediaUrls?.[1] || null
      },
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

        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true
          }
        }
      }
    });

    // Transform to FeedPost format
    const feedPost: FeedPost = {
      id: post.id,
      kind: post.type as any,
      author: post.author as any,
      createdAt: post.createdAt.toISOString(),
      text: post.content || undefined,
      media: post.imageUrl || post.videoUrl ? [{
        id: '1',
        type: post.imageUrl ? 'image' : 'video',
        url: post.imageUrl || post.videoUrl!,
        name: post.imageUrl ? 'image' : 'video'
      }] : undefined,
      visibility: post.visibility as any,
      hashtags: post.tags || undefined,
      stats: {
        fires: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        views: 0
      },
      viewerState: {
        fired: false,
        saved: false,
        shared: false
      }
    };

    return NextResponse.json(feedPost, { status: 201 });
  } catch (error) {
    console.error('Feed POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}