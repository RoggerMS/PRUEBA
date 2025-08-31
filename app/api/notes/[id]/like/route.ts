import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/notes/[id]/like - Like a note
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

    // Create like
    await prisma.noteLike.upsert({
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

    const likesCount = await prisma.noteLike.count({
      where: { noteId }
    })

    return NextResponse.json({
      success: true,
      liked: true,
      likesCount
    })
  } catch (error) {
    console.error('Error liking note:', error)
    return NextResponse.json(
      { error: 'Failed to like note' },
      { status: 500 }
    )
  }
}

// DELETE /api/notes/[id]/like - Unlike a note
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

    // Remove like
    await prisma.noteLike.deleteMany({
      where: {
        userId,
        noteId
      }
    })

    const likesCount = await prisma.noteLike.count({
      where: { noteId }
    })

    return NextResponse.json({
      success: true,
      liked: false,
      likesCount
    })
  } catch (error) {
    console.error('Error unliking note:', error)
    return NextResponse.json(
      { error: 'Failed to unlike note' },
      { status: 500 }
    )
  }
}