import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(500, 'Comment too long'),
  parentId: z.string().optional() // For reply comments
})

// GET /api/feed/[id]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const postId = params.id
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

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

    // Get top-level comments (no parent)
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null // Only top-level comments
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
        }),
        // Include some replies (limited)
        replies: {
          take: 3,
          orderBy: { createdAt: 'asc' },
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
                likes: true
              }
            },
            ...(userId && {
              likes: {
                where: { userId },
                select: { id: true }
              }
            })
          }
        }
      }
    })

    // Transform comments to include interaction flags
    const transformedComments = comments.map(comment => ({
      ...comment,
      isLiked: userId ? comment.likes?.length > 0 : false,
      likesCount: comment._count.likes,
      repliesCount: comment._count.replies,
      replies: comment.replies.map(reply => ({
        ...reply,
        isLiked: userId ? reply.likes?.length > 0 : false,
        likesCount: reply._count.likes,
        likes: undefined,
        _count: undefined
      })),
      likes: undefined,
      _count: undefined
    }))

    return NextResponse.json({
      comments: transformedComments,
      pagination: {
        page,
        limit,
        hasMore: comments.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/feed/[id]/comments - Create a new comment
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
    const validatedData = createCommentSchema.parse(body)

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

    // If parentId is provided, check if parent comment exists
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
        select: { id: true, postId: true }
      })

      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json(
          { error: 'Parent comment not found or not in this post' },
          { status: 404 }
        )
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        authorId: session.user.id,
        postId,
        parentId: validatedData.parentId || null
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
            likes: true,
            replies: true
          }
        }
      }
    })

    // Transform the response
    const transformedComment = {
      ...comment,
      isLiked: false,
      likesCount: comment._count.likes,
      repliesCount: comment._count.replies,
      _count: undefined
    }

    return NextResponse.json(transformedComment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}