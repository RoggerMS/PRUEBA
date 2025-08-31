import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bookmarkSchema = z.object({
  action: z.enum(['bookmark', 'unbookmark'])
})

// POST /api/feed/[id]/bookmark - Bookmark or unbookmark a post
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
    const body = await request.json()
    const { action } = bookmarkSchema.parse(body)

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const userId = session.user.id

    if (action === 'bookmark') {
      // Create bookmark if it doesn't exist
      await prisma.bookmark.upsert({
        where: {
          userId_postId: {
            userId,
            postId
          }
        },
        update: {}, // Do nothing if already exists
        create: {
          userId,
          postId
        }
      })
    } else {
      // Remove bookmark if it exists
      await prisma.bookmark.deleteMany({
        where: {
          userId,
          postId
        }
      })
    }

    // Get updated bookmark count
    const bookmarksCount = await prisma.bookmark.count({
      where: { postId }
    })

    return NextResponse.json({
      success: true,
      bookmarksCount,
      isBookmarked: action === 'bookmark'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error bookmarking post:', error)
    return NextResponse.json(
      { error: 'Failed to bookmark post' },
      { status: 500 }
    )
  }
}