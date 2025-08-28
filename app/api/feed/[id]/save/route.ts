import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Marcar como ruta dinámica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// POST /api/feed/[id]/save - Toggle save/bookmark post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;
    const userId = session.user.id;

    // Check if post exists and user has access to it
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        OR: [
          { visibility: 'PUBLIC' },
          {
            visibility: 'UNIVERSITY',
            author: { university: (session.user as any).university }
          },
          {
            visibility: 'FRIENDS',
            author: {
              followers: {
                some: { followerId: userId }
              }
            }
          },
          { authorId: userId } // User's own posts
        ]
      },
      select: {
        id: true,
        authorId: true
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user already saved this post
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    let saved: boolean;
    let saveCount: number;

    if (existingBookmark) {
      // Remove bookmark (unsave)
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id
        }
      });
      saved = false;

      // Get updated count
      saveCount = await prisma.bookmark.count({
        where: { postId }
      });
    } else {
      // Add bookmark (save)
      await prisma.bookmark.create({
        data: {
          userId,
          postId
        }
      });
      saved = true;

      // Get updated count
      saveCount = await prisma.bookmark.count({
        where: { postId }
      });
    }

    // Analytics tracking would go here if needed

    return NextResponse.json({
      saved,
      saveCount,
      postId
    });
  } catch (error) {
    console.error('Save toggle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/feed/[id]/save - Check if post is saved by current user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;
    const userId = session.user.id;

    // Check if user has saved this post
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    // Get total save count
    const saveCount = await prisma.bookmark.count({
      where: { postId }
    });

    return NextResponse.json({
      saved: !!existingBookmark,
      saveCount,
      postId
    });
  } catch (error) {
    console.error('Save GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}