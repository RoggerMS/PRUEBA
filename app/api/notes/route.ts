import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import multer from 'multer'
import { writeFile } from 'fs/promises'
import path from 'path'

// Schema for creating a new note
const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  content: z.string().optional(),
  tags: z.string().optional(),
  subject: z.string().optional(),
  career: z.string().optional(),
  university: z.string().optional(),
  semester: z.number().int().min(1).max(12).optional(),
  price: z.number().int().min(0).optional(),
  visibility: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE']).default('PUBLIC')
})

// Schema for filtering notes
const filterSchema = z.object({
  search: z.string().optional(),
  subject: z.string().optional(),
  career: z.string().optional(),
  university: z.string().optional(),
  semester: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(['recent', 'popular', 'rating', 'downloads']).default('recent'),
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 12, 50))
})

// GET /api/notes - Get notes with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = filterSchema.parse(Object.fromEntries(searchParams))
    
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const skip = (filters.page - 1) * filters.limit

    // Build where clause
    const where: any = {
      status: 'APPROVED',
      visibility: 'PUBLIC'
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (filters.subject) {
      where.subject = { contains: filters.subject, mode: 'insensitive' }
    }

    if (filters.career) {
      where.career = { contains: filters.career, mode: 'insensitive' }
    }

    if (filters.university) {
      where.university = { contains: filters.university, mode: 'insensitive' }
    }

    if (filters.semester) {
      where.semester = parseInt(filters.semester)
    }

    if (filters.tags) {
      where.tags = { contains: filters.tags, mode: 'insensitive' }
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }
    switch (filters.sortBy) {
      case 'popular':
        orderBy = { downloads: 'desc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'downloads':
        orderBy = { downloads: 'desc' }
        break
    }

    const notes = await prisma.note.findMany({
      where,
      skip,
      take: filters.limit,
      orderBy,
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
        _count: {
          select: {
            bookmarks: true,
            ratings: true
          }
        },
        // Include user's interactions if logged in
        ...(userId && {
          bookmarks: {
            where: { userId },
            select: { id: true }
          }
        })
      }
    })

    // Transform notes to include interaction flags
    const transformedNotes = notes.map(note => ({
      ...note,
      isBookmarked: userId ? note.bookmarks?.length > 0 : false,
      bookmarksCount: note._count.bookmarks,
      ratingsCount: note._count.ratings,
      bookmarks: undefined,
      _count: undefined
    }))

    return NextResponse.json({
      notes: transformedNotes,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        hasMore: notes.length === filters.limit
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid filters', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

// POST /api/notes - Create a new note (with file upload support)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const contentType = request.headers.get('content-type') || ''
    
    let noteData: any
    let fileData: { buffer: Buffer; filename: string; mimetype: string } | null = null

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData()
      
      // Extract note data from form
      const title = formData.get('title') as string
      const description = formData.get('description') as string
      const content = formData.get('content') as string
      const tags = formData.get('tags') as string
      const subject = formData.get('subject') as string
      const career = formData.get('career') as string
      const university = formData.get('university') as string
      const semester = formData.get('semester') ? parseInt(formData.get('semester') as string) : undefined
      const price = formData.get('price') ? parseInt(formData.get('price') as string) : undefined
      const visibility = formData.get('visibility') as string || 'PUBLIC'

      noteData = {
        title,
        description: description || undefined,
        content: content || undefined,
        tags: tags || undefined,
        subject: subject || undefined,
        career: career || undefined,
        university: university || undefined,
        semester,
        price,
        visibility
      }

      // Handle file if present
      const file = formData.get('file') as File
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        fileData = {
          buffer: Buffer.from(bytes),
          filename: file.name,
          mimetype: file.type
        }
      }
    } else {
      // Handle JSON data (no file)
      noteData = await request.json()
    }

    const validatedData = createNoteSchema.parse(noteData)

    // Handle file upload if present
    let fileUrl: string | undefined
    let fileName: string | undefined
    let fileSize: number | undefined
    let fileType: string | undefined

    if (fileData) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'notes')
      
      // Generate unique filename
      const timestamp = Date.now()
      const extension = path.extname(fileData.filename)
      const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(2)}${extension}`
      
      const filePath = path.join(uploadsDir, uniqueFilename)
      
      try {
        await writeFile(filePath, fileData.buffer)
        fileUrl = `/uploads/notes/${uniqueFilename}`
        fileName = fileData.filename
        fileSize = fileData.buffer.length
        fileType = fileData.mimetype
      } catch (uploadError) {
        console.error('File upload error:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload file' },
          { status: 500 }
        )
      }
    }

    const note = await prisma.note.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
        fileUrl,
        fileName,
        fileSize,
        fileType,
        status: 'PENDING' // Notes need approval
      },
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
        _count: {
          select: {
            bookmarks: true,
            ratings: true
          }
        }
      }
    })

    // Transform the response
    const transformedNote = {
      ...note,
      isBookmarked: false,
      bookmarksCount: note._count.bookmarks,
      ratingsCount: note._count.ratings,
      _count: undefined
    }

    return NextResponse.json(transformedNote, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}