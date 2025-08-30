export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';
import { rateLimitComment } from '@/lib/rate-limit';

const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().optional() // For nested replies
});

// POST /api/feed/[id]/comment - Create new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimitComment(request, session.user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const postId = id;
    const body = await request.json();
    const { content, parentId } = createCommentSchema.parse(body);

    // Check if post exists and user can access it
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { 
        id: true,
        authorId: true,
        visibility: true,
        author: {
          select: {
            followers: {
              where: { followerId: session.user.id },
              select: { id: true }
            }
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check visibility permissions
    if (post.visibility === 'PRIVATE' && post.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    if (post.visibility === 'FOLLOWERS' && 
        post.authorId !== session.user.id && 
        post.author.followers.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, postId: true }
      });

      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json(
          { error: 'Parent comment not found or does not belong to this post' },
          { status: 404 }
        );
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: session.user.id,
        parentId: parentId || null
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
            replies: true,
            likes: true
          }
        }
      }
    });

    // Transform response
    const transformedComment = {
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
        liked: false // New comment, user hasn't liked it yet
      },
      parentId: comment.parentId
    };

    return NextResponse.json(transformedComment, { status: 201 });

  } catch (error) {
    console.error('Create comment error:', error);
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