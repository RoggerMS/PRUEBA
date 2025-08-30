export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const commentsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  sort: z.enum(['recent', 'oldest', 'popular']).default('recent')
});

// GET /api/feed/[id]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    const postId = params.id;
    const { searchParams } = new URL(request.url);
    const query = commentsQuerySchema.parse({
      cursor: searchParams.get('cursor'),
      limit: searchParams.get('limit'),
      sort: searchParams.get('sort')
    });

    // Check if post exists and user can access it
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { 
        id: true, 
        visibility: true, 
        authorId: true,
        author: {
          select: {
            id: true,
            followers: session?.user?.id ? {
              where: { followerId: session.user.id },
              select: { id: true }
            } : false
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check visibility permissions
    if (!session?.user?.id) {
      // Unauthenticated users can only see PUBLIC posts
      if (post.visibility !== 'PUBLIC') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
    } else {
      // Authenticated users visibility rules
      if (post.visibility === 'PRIVATE' && post.authorId !== session.user.id) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      if (post.visibility === 'FOLLOWERS' && 
          post.authorId !== session.user.id && 
          (!post.author.followers || post.author.followers.length === 0)) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
    }

    const where: any = {
      postId: postId,
      parentId: null // Only get top-level comments
    };

    // Cursor pagination
    if (query.cursor) {
      where.id = { lt: query.cursor };
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }; // recent
    if (query.sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (query.sort === 'popular') {
      // TODO: Implement proper popularity sorting based on likes
      orderBy = { createdAt: 'desc' };
    }

    const comments = await prisma.comment.findMany({
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
            replies: true,
            likes: true
          }
        },
        likes: session?.user?.id ? {
          where: { userId: session.user.id },
          select: { id: true }
        } : false,
        replies: {
          take: 3, // Show first 3 replies
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
                likes: true
              }
            },
            likes: session?.user?.id ? {
              where: { userId: session.user.id },
              select: { id: true }
            } : false
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy,
      take: query.limit + 1 // Take one extra to check if there are more
    });

    const hasMore = comments.length > query.limit;
    const commentsToReturn = hasMore ? comments.slice(0, -1) : comments;
    const nextCursor = hasMore ? commentsToReturn[commentsToReturn.length - 1]?.id : null;

    // Transform comments
    const transformedComments = commentsToReturn.map(comment => ({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.author.id,
        name: comment.author.name || '',
        username: comment.author.username || '',
        avatar: comment.author.image || '/default-avatar.png',
        verified: comment.author.verified || false
      },
      createdAt: comment.createdAt.toISOString(),
      stats: {
        likes: comment._count.likes,
        replies: comment._count.replies
      },
      viewerState: {
        liked: session?.user?.id ? (comment.likes && comment.likes.length > 0) : false
      },
      replies: comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        author: {
          id: reply.author.id,
          name: reply.author.name || '',
          username: reply.author.username || '',
          avatar: reply.author.image || '/default-avatar.png',
          verified: reply.author.verified || false
        },
        createdAt: reply.createdAt.toISOString(),
        stats: {
          likes: reply._count.likes,
          replies: 0 // Nested replies not supported for now
        },
        viewerState: {
          liked: session?.user?.id ? (reply.likes && reply.likes.length > 0) : false
        },
        parentId: comment.id
      }))
    }));

    return NextResponse.json({
      comments: transformedComments,
      nextCursor,
      hasMore
    });

  } catch (error) {
    console.error('Get comments error:', error);
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