import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const mediaQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 20, 50)),
  type: z.enum(['image', 'video', 'audio']).optional(),
  userId: z.string().optional(), // Filter by uploader
  sort: z.enum(['newest', 'oldest', 'popular']).optional().default('newest')
})

// GET /api/media - Get media files with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = mediaQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      type: searchParams.get('type'),
      userId: searchParams.get('userId'),
      sort: searchParams.get('sort') || 'newest'
    })
    
    const { page, limit, type, userId, sort } = queryParams
    const skip = (page - 1) * limit
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    // Build where clause
    const where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (userId) {
      where.uploadedById = userId
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' }
    } else if (sort === 'popular') {
      orderBy = [{ comments: { _count: 'desc' } }, { createdAt: 'desc' }]
    }

    // Get media files
    const media = await prisma.media.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        uploadedBy: {
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
            comments: true
          }
        }
      }
    })

    // Transform media to include additional data
    const transformedMedia = media.map(item => ({
      ...item,
      commentsCount: item._count.comments,
      _count: undefined
    }))

    // Get total count for pagination
    const totalCount = await prisma.media.count({ where })
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      media: transformedMedia,
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

    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}