import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for creating a new post
const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long'),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'POLL', 'QUESTION']).default('TEXT'),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  tags: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE']).default('PUBLIC')
})

// GET /api/feed - Get feed posts with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Get posts with author info, counts, and user interactions
    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: {
        visibility: 'PUBLIC' // For now, only show public posts
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            university: true,
            career: true,
            verified: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true
          }
        },
        // Include user's interactions if logged in
        ...(userId && {
          likes: {
            where: { userId },
            select: { id: true }
          },
          bookmarks: {
            where: { userId },
            select: { id: true }
          }
        })
      }
    })

    // Transform posts to include interaction flags
    const transformedPosts = posts.map(post => ({
      ...post,
      isLiked: userId ? post.likes?.length > 0 : false,
      isBookmarked: userId ? post.bookmarks?.length > 0 : false,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      bookmarksCount: post._count.bookmarks,
      likes: undefined, // Remove the likes array from response
      bookmarks: undefined, // Remove the bookmarks array from response
      _count: undefined // Remove the _count object
    }))

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit
      }
    })
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    )
  }
}

// POST /api/feed - Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createPostSchema.parse(body)

    const post = await prisma.post.create({
      data: {
        ...validatedData,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            university: true,
            career: true,
            verified: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true
          }
        }
      }
    })

    // Transform the response
    const transformedPost = {
      ...post,
      isLiked: false,
      isBookmarked: false,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      bookmarksCount: post._count.bookmarks,
      _count: undefined
    }

    return NextResponse.json(transformedPost, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}