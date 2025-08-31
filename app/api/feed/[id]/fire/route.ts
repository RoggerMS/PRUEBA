import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/feed/[id]/fire - Toggle fire reaction (like) on a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const postId = params.id
    const userId = session.user.id

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user already liked (fired) this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    })

    let fired = false
    let fireCount = 0

    if (existingLike) {
      // Remove like (unfire)
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      })
      fired = false
    } else {
      // Add like (fire)
      await prisma.like.create({
        data: {
          userId,
          postId
        }
      })
      fired = true
    }

    // Get updated fire count
    fireCount = await prisma.like.count({
      where: { postId }
    })

    return NextResponse.json({
      fired,
      fireCount,
      message: fired ? 'Post fired!' : 'Fire removed'
    })
  } catch (error) {
    console.error('Error toggling fire reaction:', error)
    return NextResponse.json(
      { error: 'Failed to toggle fire reaction' },
      { status: 500 }
    )
  }
}