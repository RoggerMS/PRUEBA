import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateMediaSchema = z.object({
  description: z.string().optional(),
  altText: z.string().optional()
})

// GET /api/media/[id] - Get media details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mediaId = params.id

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    })

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...media,
      commentsCount: media._count.comments,
      _count: undefined
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

// PUT /api/media/[id] - Update media metadata
export async function PUT(
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
    const validatedData = updateMediaSchema.parse(body)

    // Check if media exists and user owns it
    const existingMedia = await prisma.media.findUnique({
      where: { id: mediaId },
      select: { id: true, uploadedById: true }
    })

    if (!existingMedia) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    if (existingMedia.uploadedById !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this media' },
        { status: 403 }
      )
    }

    // Update media metadata
    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: {
        description: validatedData.description,
        altText: validatedData.altText,
        updatedAt: new Date()
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    })

    return NextResponse.json({
      ...updatedMedia,
      commentsCount: updatedMedia._count.comments,
      _count: undefined
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating media:', error)
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    )
  }
}

// DELETE /api/media/[id] - Delete media
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

    const mediaId = params.id

    // Check if media exists and user owns it
    const existingMedia = await prisma.media.findUnique({
      where: { id: mediaId },
      select: { id: true, uploadedById: true, url: true }
    })

    if (!existingMedia) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    if (existingMedia.uploadedById !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this media' },
        { status: 403 }
      )
    }

    // Delete media record (this would also delete the actual file in a real implementation)
    await prisma.media.delete({
      where: { id: mediaId }
    })

    // In a real implementation, you would also delete the file from storage
    // await deleteFileFromStorage(existingMedia.url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}
