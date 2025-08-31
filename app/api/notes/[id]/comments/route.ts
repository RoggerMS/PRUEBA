import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const commentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(500, 'Comment too long'),
  rating: z.number().int().min(1).max(5)
})

// GET /api/notes/[id]/comments - Get comments for a note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const skip = (page - 1) * limit

    // Check if note exists
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true, status: true }
    })

    if (!note || note.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    const comments = await prisma.noteRating.findMany({
      where: { 
        noteId,
        review: { not: null }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            verified: true
          }
        }
      }
    })

    // Transform comments to match expected format
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      user: {
        name: comment.user.name || 'Usuario',
        avatar: comment.user.image || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20avatar%20default&image_size=square'
      },
      content: comment.review || '',
      rating: comment.rating,
      createdAt: comment.createdAt.toISOString()
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

// POST /api/notes/[id]/comments - Add a comment to a note
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

    const noteId = params.id
    const userId = session.user.id
    const body = await request.json()
    const { content, rating } = commentSchema.parse(body)

    // Check if note exists
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true, authorId: true, status: true }
    })

    if (!note || note.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Users can't comment on their own notes
    if (note.authorId === userId) {
      return NextResponse.json(
        { error: 'Cannot comment on your own note' },
        { status: 400 }
      )
    }

    // Create or update rating with comment
    const noteRating = await prisma.noteRating.upsert({
      where: {
        userId_noteId: {
          userId,
          noteId
        }
      },
      update: {
        rating,
        review: content
      },
      create: {
        userId,
        noteId,
        rating,
        review: content
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            verified: true
          }
        }
      }
    })

    // Update note's average rating
    const ratings = await prisma.noteRating.findMany({
      where: { noteId },
      select: { rating: true }
    })

    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    
    await prisma.note.update({
      where: { id: noteId },
      data: {
        rating: avgRating,
        ratingCount: ratings.length
      }
    })

    // Transform comment to match expected format
    const transformedComment = {
      id: noteRating.id,
      user: {
        name: noteRating.user.name || 'Usuario',
        avatar: noteRating.user.image || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=student%20avatar%20default&image_size=square'
      },
      content: noteRating.review || '',
      rating: noteRating.rating,
      createdAt: noteRating.createdAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      comment: transformedComment,
      avgRating,
      ratingCount: ratings.length
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error adding comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}