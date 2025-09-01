import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const followingQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 20, 50))
})

// GET /api/users/[id]/following - Get users that this user follows
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = followingQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20'
    })
    
    const { page, limit } = queryParams
    const skip = (page - 1) * limit
    const userId = params.id
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get following
    const following = await prisma.follow.findMany({
      where: {
        followerId: userId
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        following: {
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
                following: true
              }
            },
            // Check if current user follows each person in the following list
            ...(currentUserId && {
              followers: {
                where: { followerId: currentUserId },
                select: { id: true }
              }
            })
          }
        }
      }
    })

    // Transform following data
    const transformedFollowing = following.map(follow => ({
      ...follow.following,
      followersCount: follow.following._count.followers,
      followingCount: follow.following._count.following,
      isFollowing: currentUserId ? follow.following.followers?.length > 0 : false,
      followedAt: follow.createdAt,
      _count: undefined,
      followers: undefined
    }))

    // Get total count for pagination
    const totalCount = await prisma.follow.count({
      where: { followerId: userId }
    })
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      following: transformedFollowing,
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

    console.error('Error fetching following:', error)
    return NextResponse.json(
      { error: 'Failed to fetch following' },
      { status: 500 }
    )
  }
}