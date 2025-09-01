import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const userPostsQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 20)),
  type: z.enum(['all', 'posts', 'replies']).optional().default('all')
})

// GET /api/users/[id]/posts - Get posts by a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = userPostsQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      type: searchParams.get('type') || 'all'
    })
    
    const { page, limit, type } = queryParams
    const skip = (page - 1) * limit
    const userId = params.id
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build where clause based on type
    const where: any = {
      authorId: userId
    }

    if (type === 'posts') {
      where.parentId = null // Only top-level posts
    } else if (type === 'replies') {
      where.parentId = { not: null } // Only replies
    }

    // Get user's posts
    const posts = await prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
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
        media: {
          include: {
            media: {
              select: {
                id: true,
                url: true,
                type: true,
                width: true,
                height: true,
                altText: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        hashtags: {
          include: {
            hashtag: {
              select: {
                id: true,
                name: true
              }
            }
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
        parent: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                verified: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true
          }
        },
        // Include user interactions if logged in
        ...(currentUserId && {
          likes: {
            where: { userId: currentUserId },
            select: { id: true }
          },
          bookmarks: {
            where: { userId: currentUserId },
            select: { id: true }
          },
          reactions: {
            where: { userId: currentUserId },
            select: { type: true }
          }
        })
      }
    })

    // Transform posts data
    const transformedPosts = posts.map(post => ({
      ...post,
      media: post.media.map(pm => pm.media),
      hashtags: post.hashtags.map(ph => ph.hashtag),
      mentions: post.mentions.map(pm => pm.user),
      stats: {
        likes: post._count.likes,
        comments: post._count.comments,
        shares: post._count.shares,
        views: post.viewCount
      },
      viewerState: currentUserId ? {
        liked: post.likes?.length > 0,
        bookmarked: post.bookmarks?.length > 0,
        reaction: post.reactions?.[0]?.type || null
      } : null,
      _count: undefined,
      likes: undefined,
      bookmarks: undefined,
      reactions: undefined
    }))

    // Get total count for pagination
    const totalCount = await prisma.post.count({ where })
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      posts: transformedPosts,
      user: {
        id: user.id,
        username: user.username
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error fetching user posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    )
  }
}