export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const reactionSchema = z.object({
  type: z.enum(['fire']).default('fire'),
  action: z.enum(['add', 'remove']).default('add')
});

// POST /api/feed/[id]/react - Add or remove reaction
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;
    const body = await request.json();
    const { type, action } = reactionSchema.parse(body);

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

    // Check if user already has a reaction
    const existingReaction = await prisma.postReaction.findUnique({
      where: {
        userId_postId_type: {
          userId: session.user.id,
          postId: postId,
          type: 'fire'
        }
      }
    });

    let newFireCount = 0;
    let userFired = false;

    if (action === 'add') {
      if (!existingReaction) {
        // Add new reaction
        await prisma.postReaction.create({
          data: {
            userId: session.user.id,
            postId: postId,
            type: 'fire'
          }
        });
        userFired = true;
      } else {
        // Reaction already exists
        userFired = true;
      }
    } else if (action === 'remove') {
      if (existingReaction) {
        // Remove reaction
        await prisma.postReaction.delete({
          where: {
            userId_postId_type: {
              userId: session.user.id,
              postId: postId,
              type: 'fire'
            }
          }
        });
        userFired = false;
      }
    }

    // Get updated fire count
    newFireCount = await prisma.postReaction.count({
      where: { postId: postId }
    });

    return NextResponse.json({
      success: true,
      fireCount: newFireCount,
      userFired: userFired
    });

  } catch (error) {
    console.error('React API error:', error);
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