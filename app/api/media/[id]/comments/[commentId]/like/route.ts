import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/media/[id]/comments/[commentId]/like - Toggle like on media comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: mediaId, commentId } = params
    const userId = session.user.id

    // Check if comment exists and belongs to the media
    const comment = await prisma.mediaComment.findFirst({
      where: {
        id: commentId,
        mediaId
      },
      select: { id: true }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if user already liked this comment
    const existingLike = await prisma.mediaCommentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId
        }
      }
    })

    let isLiked: boolean
    let likesCount: number

    if (existingLike) {
      // Unlike the comment
      await prisma.mediaCommentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId
          }
        }
      })
      isLiked = false
    } else {
      // Like the comment
      await prisma.mediaCommentLike.create({
        data: {
          userId,
          commentId
        }
      })
      isLiked = true
    }

    // Get updated likes count
    const updatedComment = await prisma.mediaComment.findUnique({
      where: { id: commentId },
      select: {
        _count: {
          select: {
            likes: true
          }
        }
      }
    })

    likesCount = updatedComment?._count.likes || 0

    return NextResponse.json({
      isLiked,
      likesCount
    })
  } catch (error) {
    console.error('Error toggling media comment like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}