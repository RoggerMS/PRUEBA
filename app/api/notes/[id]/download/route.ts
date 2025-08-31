import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'

// POST /api/notes/[id]/download - Download a note
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
      select: {
        id: true,
        title: true,
        authorId: true,
        status: true,
        price: true,
        fileUrl: true,
        fileName: true,
        fileType: true,
        downloads: true
      }
    })

    if (!note || note.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Check if user has access to download
    let canDownload = false

    if (note.authorId === userId) {
      // Authors can always download their own notes
      canDownload = true
    } else if (note.price === 0) {
      // Free notes can be downloaded by anyone
      canDownload = true
    } else {
      // Check if user has purchased the note
      const purchase = await prisma.notePurchase.findUnique({
        where: {
          userId_noteId: {
            userId,
            noteId
          }
        }
      })
      canDownload = !!purchase
    }

    if (!canDownload) {
      return NextResponse.json(
        { error: 'Purchase required to download this note' },
        { status: 403 }
      )
    }

    // If no file is attached, return download info only
    if (!note.fileUrl) {
      // Increment download count
      await prisma.note.update({
        where: { id: noteId },
        data: { downloads: { increment: 1 } }
      })

      return NextResponse.json({
        success: true,
        message: 'Download recorded',
        downloads: note.downloads + 1
      })
    }

    try {
      // Read the file
      const filePath = path.join(process.cwd(), 'public', note.fileUrl)
      const fileBuffer = await readFile(filePath)

      // Increment download count
      await prisma.note.update({
        where: { id: noteId },
        data: { downloads: { increment: 1 } }
      })

      // Return file as download
      const response = new NextResponse(fileBuffer)
      response.headers.set('Content-Type', note.fileType || 'application/octet-stream')
      response.headers.set('Content-Disposition', `attachment; filename="${note.fileName || 'download'}"`)
      
      return response
    } catch (fileError) {
      console.error('File read error:', fileError)
      
      // Still increment download count even if file is missing
      await prisma.note.update({
        where: { id: noteId },
        data: { downloads: { increment: 1 } }
      })

      return NextResponse.json(
        { error: 'File not found on server' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error downloading note:', error)
    return NextResponse.json(
      { error: 'Failed to download note' },
      { status: 500 }
    )
  }
}

// GET /api/notes/[id]/download - Get download info
export async function GET(
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
      select: {
        id: true,
        title: true,
        authorId: true,
        status: true,
        price: true,
        fileUrl: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        downloads: true
      }
    })

    if (!note || note.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Check if user has access to download
    let canDownload = false
    let isPurchased = false

    if (note.authorId === userId) {
      canDownload = true
    } else if (note.price === 0) {
      canDownload = true
    } else {
      const purchase = await prisma.notePurchase.findUnique({
        where: {
          userId_noteId: {
            userId,
            noteId
          }
        }
      })
      isPurchased = !!purchase
      canDownload = isPurchased
    }

    return NextResponse.json({
      canDownload,
      isPurchased,
      price: note.price,
      fileName: note.fileName,
      fileType: note.fileType,
      fileSize: note.fileSize,
      downloads: note.downloads
    })
  } catch (error) {
    console.error('Error getting download info:', error)
    return NextResponse.json(
      { error: 'Failed to get download info' },
      { status: 500 }
    )
  }
}