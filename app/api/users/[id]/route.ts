import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/[id] - Get user profile with stats (supports both ID and username)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    // Determine if identifier is a UUID (ID) or username
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
    const whereClause = isUUID ? { id: identifier } : { username: identifier }

    // Get user with stats
    const user = await prisma.user.findUnique({
      where: whereClause,
      select: {
        id: true,
        name: true,
        username: true,
        email: true, // Will be filtered based on ownership after user is found
        image: true,
        bio: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        },
        // Check if current user follows this user (will be determined after user is found)
        followers: currentUserId ? {
          where: { followerId: currentUserId },
          select: { id: true }
        } : undefined
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Transform response
    const isOwnProfile = currentUserId === user.id
    const transformedUser = {
      ...user,
      email: isOwnProfile ? user.email : undefined, // Only show email to self
      postsCount: user._count.posts,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing: currentUserId && !isOwnProfile ? user.followers?.length > 0 : undefined,
      isOwnProfile,
      _count: undefined,
      followers: undefined
    }

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}