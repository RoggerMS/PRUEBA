import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 20))
})

// GET /api/users/search - Search users by username or name
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = searchQuerySchema.parse({
      q: searchParams.get('q') || '',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10'
    })
    
    const { q, page, limit } = queryParams
    const skip = (page - 1) * limit
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    // Search users by username or name
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            name: {
              contains: q,
              mode: 'insensitive'
            }
          }
        ]
      },
      skip,
      take: limit,
      orderBy: [
        { verified: 'desc' }, // Verified users first
        { _relevance: { fields: ['username', 'name'], search: q, sort: 'desc' } },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        verified: true,
        bio: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        },
        // Check if current user follows each search result
        ...(currentUserId && {
          followers: {
            where: { followerId: currentUserId },
            select: { id: true }
          }
        })
      }
    })

    // Transform users data
    const transformedUsers = users.map(user => ({
      ...user,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      postsCount: user._count.posts,
      isFollowing: currentUserId ? user.followers?.length > 0 : false,
      isOwnProfile: currentUserId === user.id,
      _count: undefined,
      followers: undefined
    }))

    // Get total count for pagination
    const totalCount = await prisma.user.count({
      where: {
        OR: [
          {
            username: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            name: {
              contains: q,
              mode: 'insensitive'
            }
          }
        ]
      }
    })
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      users: transformedUsers,
      query: q,
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

    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}