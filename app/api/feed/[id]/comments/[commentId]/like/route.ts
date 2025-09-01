import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/feed/[id]/comments/[commentId]/like - Toggle like on a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: postId, commentId } = params;
    const userId = session.user.id;

    // Verify comment exists and belongs to the post
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { 
        id: true, 
        postId: true,
        authorId: true
      }
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.postId !== postId) {
      return NextResponse.json(
        { error: 'Comment does not belong to this post' },
        { status: 400 }
      );
    }

    // Check if user already liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId
        }
      }
    });

    let isLiked: boolean;
    let likeCount: number;

    if (existingLike) {
      // Unlike the comment
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId
          }
        }
      });
      isLiked = false;
    } else {
      // Like the comment
      await prisma.commentLike.create({
        data: {
          userId,
          commentId
        }
      });
      isLiked = true;
    }

    // Get updated like count
    const updatedLikeCount = await prisma.commentLike.count({
      where: { commentId }
    });

    likeCount = updatedLikeCount;

    // Create notification if liking someone else's comment
    if (isLiked && comment.authorId !== userId) {
      try {
        await prisma.notification.create({
          data: {
            type: 'COMMENT_LIKE',
            userId: comment.authorId,
            actorId: userId,
            postId,
            commentId,
            message: 'le gustó tu comentario'
          }
        });
      } catch (notificationError) {
        // Don't fail the request if notification creation fails
        console.error('Failed to create notification:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      isLiked,
      likeCount
    });

  } catch (error) {
    console.error('Error toggling comment like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/feed/[id]/comments/[commentId]/like - Get like status for a comment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { commentId } = params;

    // Get like count
    const likeCount = await prisma.commentLike.count({
      where: { commentId }
    });

    let isLiked = false;
    if (session?.user?.id) {
      const userLike = await prisma.commentLike.findUnique({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId
          }
        }
      });
      isLiked = !!userLike;
    }

    return NextResponse.json({
      isLiked,
      likeCount
    });

  } catch (error) {
    console.error('Error fetching comment like status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}