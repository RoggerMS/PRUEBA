import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const followersQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 20, 50))
})

// GET /api/users/[id]/followers - Get user's followers
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = followersQuerySchema.parse({
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

    // Get followers
    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        follower: {
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
            // Check if current user follows each follower
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

    // Transform followers data
    const transformedFollowers = followers.map(follow => ({
      ...follow.follower,
      followersCount: follow.follower._count.followers,
      followingCount: follow.follower._count.following,
      isFollowing: currentUserId ? follow.follower.followers?.length > 0 : false,
      followedAt: follow.createdAt,
      _count: undefined,
      followers: undefined
    }))

    // Get total count for pagination
    const totalCount = await prisma.follow.count({
      where: { followingId: userId }
    })
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      followers: transformedFollowers,
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

    console.error('Error fetching followers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch followers' },
      { status: 500 }
    )
  }
}