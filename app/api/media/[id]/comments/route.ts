import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createMediaCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(500, 'Comment too long'),
  mentions: z.array(z.string()).optional() // Explicit mentions
})

const commentsQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)),
  sort: z.enum(['newest', 'oldest', 'popular']).optional().default('newest')
})

// Helper function to extract mentions from content
function extractMentions(content: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g
  const mentions: string[] = []
  let match
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1])
  }
  
  return [...new Set(mentions)] // Remove duplicates
}

// GET /api/media/[id]/comments - Get comments for a media file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = commentsQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      sort: searchParams.get('sort') || 'newest'
    })
    
    const { page, limit, sort } = queryParams
    const skip = (page - 1) * limit

    const mediaId = params.id
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    
    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' }
    } else if (sort === 'popular') {
      orderBy = [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }]
    }

    // Check if media exists
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: { id: true }
    })

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    // Get comments for the media
    const comments = await prisma.mediaComment.findMany({
      where: {
        mediaId
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
        _count: {
          select: {
            likes: true
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

    // Transform comments to include interaction flags
    const transformedComments = comments.map(comment => ({
      ...comment,
      isLiked: userId ? comment.likes?.length > 0 : false,
      likesCount: comment._count.likes,
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
    console.error('Error fetching media comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/media/[id]/comments - Create a new comment on media
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

    const mediaId = params.id
    const body = await request.json()
    const validatedData = createMediaCommentSchema.parse(body)

    // Check if media exists
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: { id: true }
    })

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    // Extract mentions from content
    const contentMentions = extractMentions(validatedData.content)
    const allMentions = [...new Set([...contentMentions, ...(validatedData.mentions || [])])]

    // Get mentioned users
    const mentionedUsers = allMentions.length > 0 ? await prisma.user.findMany({
      where: {
        username: {
          in: allMentions
        }
      },
      select: { id: true, username: true }
    }) : []

    // Create comment
    const comment = await prisma.mediaComment.create({
      data: {
        content: validatedData.content,
        authorId: session.user.id,
        mediaId
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
            likes: true
          }
        }
      }
    })

    // Transform the response
    const transformedComment = {
      ...comment,
      isLiked: false,
      likesCount: comment._count.likes,
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

    console.error('Error creating media comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}