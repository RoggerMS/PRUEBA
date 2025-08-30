export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const saveSchema = z.object({
  action: z.enum(['save', 'unsave']).default('save')
});

// POST /api/feed/[id]/save - Save or unsave post
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
    const { action } = saveSchema.parse(body);

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

    // Check if user already has this post bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    });

    let saved = false;
    let saveCount = 0;

    if (action === 'save') {
      if (!existingBookmark) {
        // Add bookmark
        await prisma.bookmark.create({
          data: {
            userId: session.user.id,
            postId: postId
          }
        });
        saved = true;
      } else {
        // Already bookmarked
        saved = true;
      }
    } else if (action === 'unsave') {
      if (existingBookmark) {
        // Remove bookmark
        await prisma.bookmark.delete({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId: postId
            }
          }
        });
        saved = false;
      }
    }

    // Get updated save count
    saveCount = await prisma.bookmark.count({
      where: { postId: postId }
    });

    return NextResponse.json({
      success: true,
      saved: saved,
      saveCount: saveCount
    });

  } catch (error) {
    console.error('Save post API error:', error);
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