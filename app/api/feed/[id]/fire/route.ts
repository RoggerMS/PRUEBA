import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/feed/[id]/fire - Toggle fire reaction
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
          { visibility: 'public' },
          { 
            visibility: 'university',
            author: { university: session.user.university }
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
      },
      select: {
        id: true,
        authorId: true
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    let fired: boolean;
    let fireCount: number;

    if (existingLike) {
      // Remove like (unlike)
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });
      fired = false;

      // Get updated count
      fireCount = await prisma.like.count({
        where: { postId }
      });
    } else {
      // Add like (fire)
      await prisma.like.create({
        data: {
          userId,
          postId
        }
      });
      fired = true;

      // Get updated count
      fireCount = await prisma.like.count({
        where: { postId }
      });

      // Create notification for post author (if not self-like)
      if (post.authorId !== userId) {
        await prisma.notification.create({
          data: {
            type: 'LIKE',
            userId: post.authorId,
            title: 'New Like',
            message: 'Someone liked your post'
          }
        }).catch(console.error); // Don't fail the request if notification fails
      }
    }

    // Analytics tracking would go here if needed

    return NextResponse.json({
      fired,
      fireCount,
      postId
    });
  } catch (error) {
    console.error('Fire toggle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}