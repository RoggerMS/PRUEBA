import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const repliesQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)),
  sort: z.enum(['newest', 'oldest', 'popular']).optional().default('newest')
})

// GET /api/feed/[id]/comments/[commentId]/replies - Get replies for a comment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = repliesQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sort: searchParams.get('sort') || 'newest'
    })
    
    const { page, limit, sort } = queryParams
    const skip = (page - 1) * limit

    const { id: postId, commentId } = params
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    
    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' }
    } else if (sort === 'popular') {
      orderBy = [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }]
    }

    // Check if parent comment exists and belongs to the post
    const parentComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true }
    })

    if (!parentComment || parentComment.postId !== postId) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Get replies for the comment
    const replies = await prisma.comment.findMany({
      where: {
        parentId: commentId
      },
      skip,
      take: limit,
      orderBy,
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
        mentions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        },
        // Include user's likes if logged in
        ...(userId && {
          likes: {
            where: { userId },
            select: { id: true }
          }
        })
      }
    })

    // Transform replies to include interaction flags
    const transformedReplies = replies.map(reply => ({
      ...reply,
      isLiked: userId ? reply.likes?.length > 0 : false,
      likesCount: reply._count.likes,
      repliesCount: reply._count.replies,
      mentions: reply.mentions.map(mention => ({
        id: mention.id,
        user: mention.user
      })),
      likes: undefined,
      _count: undefined
    }))

    return NextResponse.json({
      replies: transformedReplies,
      pagination: {
        page,
        limit,
        hasMore: replies.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching replies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch replies' },
      { status: 500 }
    )
  }
}