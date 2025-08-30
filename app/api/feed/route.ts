export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';
import { rateLimitPost } from '@/lib/rate-limit';

// Validation schemas
const createPostSchema = z.object({
  kind: z.enum(['post', 'photo', 'video', 'question', 'note']),
  text: z.string().optional(),
  title: z.string().optional(),
  visibility: z.enum(['public', 'university', 'friends', 'private']).default('public'),
  hashtags: z.array(z.string()).optional(),
  media: z.array(z.string()).optional(), // URLs of uploaded media
});

const feedQuerySchema = z.object({
  cursor: z.string().nullable().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  ranking: z.enum(['recent', 'trending', 'following']).nullable().default('recent'),
  kind: z.enum(['post', 'photo', 'video', 'question', 'note']).nullable().optional(),
  author: z.string().nullable().optional(),
});

// GET /api/feed - Fetch feed posts
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = feedQuerySchema.parse({
      cursor: searchParams.get('cursor'),
      limit: searchParams.get('limit'),
      ranking: searchParams.get('ranking'),
      kind: searchParams.get('kind'),
      author: searchParams.get('author'),
    });

    const where: any = {
      // Only show public posts or posts from followed users
      OR: [
        { visibility: 'PUBLIC' },
        {
          AND: [
            { visibility: 'UNIVERSITY' },
            {
              author: {
                university: {
                  equals: (await prisma.user.findUnique({
                    where: { id: session.user.id },
                    select: { university: true }
                  }))?.university
                }
              }
            }
          ]
        }
      ]
    };

    // Add filters
    if (query.kind) {
      const postTypeMap: Record<string, string> = {
        'post': 'TEXT',
        'photo': 'IMAGE',
        'video': 'VIDEO',
        'question': 'QUESTION',
        'note': 'TEXT'
      };
      where.type = postTypeMap[query.kind];
    }

    if (query.author) {
      where.author = { username: query.author };
    }

    // Cursor pagination
    if (query.cursor) {
      where.id = { lt: query.cursor };
    }

    const posts = await prisma.post.findMany({
      where,
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
            comments: true,
            likes: true,
            bookmarks: true,
            reactions: true
          }
        },
        reactions: {
          where: { userId: session.user.id },
          select: { type: true }
        },
        likes: {
          where: { userId: session.user.id },
          select: { id: true }
        },
        bookmarks: {
          where: { userId: session.user.id },
          select: { id: true }
        }
      },
      orderBy: query.ranking === 'recent' ? { createdAt: 'desc' } : { createdAt: 'desc' }, // TODO: implement trending logic
      take: query.limit + 1, // Take one extra to check if there are more
    });

    const hasMore = posts.length > query.limit;
    const postsToReturn = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? postsToReturn[postsToReturn.length - 1]?.id : null;

    // Transform posts to match frontend expectations
    const transformedPosts = postsToReturn.map(post => ({
      id: post.id,
      kind: post.type.toLowerCase(),
      text: post.content,
      media: post.imageUrl ? [{ id: '1', type: 'image', url: post.imageUrl }] : [],
      visibility: post.visibility.toLowerCase(),
      hashtags: post.tags || [],
      author: {
        id: post.author.id,
        name: post.author.name || '',
        username: post.author.username || '',
        avatar: post.author.image || '/default-avatar.png',
        verified: post.author.verified || false
      },
      createdAt: post.createdAt.toISOString(),
      stats: {
        fires: post._count.reactions,
        comments: post._count.comments,
        saves: post._count.bookmarks
      },
      viewerState: {
        fired: post.reactions.length > 0,
        saved: post.bookmarks.length > 0
      }
    }));

    return NextResponse.json({
      posts: transformedPosts,
      nextCursor,
      hasMore
    });

  } catch (error) {
    console.error('Feed API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/feed - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimitPost(request, session.user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const data = createPostSchema.parse(body);

    // Map frontend types to database types
    const postTypeMap: Record<string, string> = {
      'post': 'TEXT',
      'photo': 'IMAGE',
      'video': 'VIDEO',
      'question': 'QUESTION',
      'note': 'TEXT'
    };

    const visibilityMap: Record<string, string> = {
      'public': 'PUBLIC',
      'university': 'UNIVERSITY',
      'friends': 'FRIENDS',
      'private': 'PRIVATE'
    };

    const post = await prisma.post.create({
      data: {
        content: data.text || '',
        type: postTypeMap[data.kind] as any,
        visibility: visibilityMap[data.visibility] as any,
        tags: data.hashtags,
        imageUrl: data.media?.[0], // For now, just take the first media URL
        authorId: session.user.id
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
            comments: true,
            likes: true,
            bookmarks: true,
            reactions: true
          }
        }
      }
    });

    // Transform response
    const transformedPost = {
      id: post.id,
      kind: post.type.toLowerCase(),
      text: post.content,
      media: post.imageUrl ? [{ id: '1', type: 'image', url: post.imageUrl }] : [],
      visibility: post.visibility.toLowerCase(),
      hashtags: post.tags || [],
      author: {
        id: post.author.id,
        name: post.author.name || '',
        username: post.author.username || '',
        avatar: post.author.image || '/default-avatar.png',
        verified: post.author.verified || false
      },
      createdAt: post.createdAt.toISOString(),
      stats: {
        fires: 0,
        comments: 0,
        saves: 0
      },
      viewerState: {
        fired: false,
        saved: false
      }
    };

    return NextResponse.json(transformedPost, { status: 201 });

  } catch (error) {
    console.error('Create post error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}