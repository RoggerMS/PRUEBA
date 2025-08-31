import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const rateNoteSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().max(500).optional()
})

const bookmarkSchema = z.object({
  action: z.enum(['bookmark', 'unbookmark'])
})

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const note = await prisma.note.findUnique({
      where: { id: noteId },
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
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            bookmarks: true,
            ratings: true,
            purchases: true
          }
        },
        // Include user's interactions if logged in
        ...(userId && {
          bookmarks: {
            where: { userId },
            select: { id: true }
          },
          purchases: {
            where: { userId },
            select: { id: true }
          },
          ratings: {
            where: { userId },
            select: { id: true, rating: true, review: true }
          }
        })
      }
    })

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Check if user can access this note
    if (note.status !== 'APPROVED' && note.authorId !== userId) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.note.update({
      where: { id: noteId },
      data: { views: { increment: 1 } }
    })

    // Transform the response
    const transformedNote = {
      ...note,
      isBookmarked: userId ? note.bookmarks?.length > 0 : false,
      isPurchased: userId ? note.purchases?.length > 0 : false,
      userRating: userId && note.ratings?.length > 0 ? note.ratings[0] : null,
      bookmarksCount: note._count.bookmarks,
      ratingsCount: note._count.ratings,
      purchasesCount: note._count.purchases,
      bookmarks: undefined,
      purchases: undefined,
      _count: undefined
    }

    return NextResponse.json(transformedNote)
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    )
  }
}

// POST /api/notes/[id] - Rate or bookmark a note
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
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

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

    const userId = session.user.id

    if (action === 'rate') {
      // Rate the note
      const { rating, review } = rateNoteSchema.parse(body)

      // Users can't rate their own notes
      if (note.authorId === userId) {
        return NextResponse.json(
          { error: 'Cannot rate your own note' },
          { status: 400 }
        )
      }

      // Create or update rating
      const noteRating = await prisma.noteRating.upsert({
        where: {
          userId_noteId: {
            userId,
            noteId
          }
        },
        update: {
          rating,
          review
        },
        create: {
          userId,
          noteId,
          rating,
          review
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

      return NextResponse.json({
        success: true,
        rating: noteRating,
        avgRating,
        ratingCount: ratings.length
      })
    } else if (action === 'bookmark') {
      // Bookmark the note
      const { action: bookmarkAction } = bookmarkSchema.parse(body)

      if (bookmarkAction === 'bookmark') {
        await prisma.bookmark.upsert({
          where: {
            userId_noteId: {
              userId,
              noteId
            }
          },
          update: {},
          create: {
            userId,
            noteId
          }
        })
      } else {
        await prisma.bookmark.deleteMany({
          where: {
            userId,
            noteId
          }
        })
      }

      const bookmarksCount = await prisma.bookmark.count({
        where: { noteId }
      })

      return NextResponse.json({
        success: true,
        bookmarksCount,
        isBookmarked: bookmarkAction === 'bookmark'
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error processing note action:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}

// DELETE /api/notes/[id] - Delete a note (only by author)
export async function DELETE(
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

    // Check if note exists and user is the author
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true, authorId: true }
    })

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    if (note.authorId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to delete this note' },
        { status: 403 }
      )
    }

    // Delete the note (cascade will handle related records)
    await prisma.note.delete({
      where: { id: noteId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}