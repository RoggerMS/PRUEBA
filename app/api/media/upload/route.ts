import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const uploadMediaSchema = z.object({
  file: z.any(), // File will be validated separately
  type: z.enum(['image', 'video', 'audio', 'document']),
  description: z.string().optional(),
  altText: z.string().optional()
})

// Helper function to get file type from mime type
function getMediaType(mimeType: string): 'image' | 'video' | 'audio' | 'document' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'document'
}

// Helper function to validate file size and type
function validateFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024 // 50MB
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mp3', 'audio/wav', 'audio/ogg',
    'application/pdf', 'text/plain'
  ]

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 50MB limit' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not supported' }
  }

  return { isValid: true }
}

// POST /api/media/upload - Upload media file
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string
    const altText = formData.get('altText') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Get file buffer and metadata
    const buffer = Buffer.from(await file.arrayBuffer())
    const mediaType = getMediaType(file.type)
    
    // In a real application, you would upload to a cloud storage service
    // For now, we'll simulate the upload and store metadata
    const fileName = `${Date.now()}-${file.name}`
    const fileUrl = `/uploads/${fileName}` // This would be the actual URL after upload
    
    // Create media record in database
    const media = await prisma.media.create({
      data: {
        type: mediaType,
        url: fileUrl,
        filename: fileName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        description: description || null,
        altText: altText || null,
        uploadedById: session.user.id,
        metadata: {
          width: mediaType === 'image' ? 1920 : null, // Would get from actual image processing
          height: mediaType === 'image' ? 1080 : null,
          duration: mediaType === 'video' || mediaType === 'audio' ? 120 : null // Would get from actual media processing
        }
      }
    })

    return NextResponse.json({
      id: media.id,
      type: media.type,
      url: media.url,
      filename: media.filename,
      originalName: media.originalName,
      mimeType: media.mimeType,
      size: media.size,
      description: media.description,
      altText: media.altText,
      metadata: media.metadata,
      createdAt: media.createdAt
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    )
  }
}