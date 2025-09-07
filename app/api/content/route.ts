import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Validation schema
const querySchema = z.object({
  type: z.enum(['all', 'posts', 'notes']).default('all'),
  limit: z.coerce.number().min(1).max(50).default(10),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(['recent', 'popular', 'trending']).default('recent'),
  userId: z.string().optional(),
  tags: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = querySchema.parse({
      type: searchParams.get('type') || 'all',
      limit: searchParams.get('limit') || '10',
      offset: searchParams.get('offset') || '0',
      sortBy: searchParams.get('sortBy') || 'recent',
      userId: searchParams.get('userId') || undefined,
      tags: searchParams.get('tags') || undefined,
    })

    const { type, limit, offset, sortBy, userId, tags } = params

    // Mock data for testing (remove when database is working)
    const mockUser = {
      id: 'user1',
      name: 'John Doe',
      username: 'johndoe',
      image: null,
    }

    const mockPosts = [
      {
        id: 'post1',
        content: 'This is a sample post content for testing the unified content API.',
        imageUrl: null,
        videoUrl: null,
        tags: 'programming,web',
        viewCount: 150,
        authorId: 'user1',
        author: mockUser,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        _count: { likes: 25, comments: 8, shares: 3 },
      },
      {
        id: 'post2',
        content: 'Another sample post to demonstrate the API functionality.',
        imageUrl: null,
        videoUrl: null,
        tags: 'tutorial,learning',
        viewCount: 89,
        authorId: 'user1',
        author: mockUser,
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
        _count: { likes: 12, comments: 4, shares: 1 },
      },
    ]

    const mockNotes = [
      {
        id: 'note1',
        title: 'JavaScript Fundamentals',
        content: 'Comprehensive notes on JavaScript basics',
        description: 'Learn the core concepts of JavaScript programming',
        fileUrl: null,
        fileName: null,
        price: null,
        downloads: 45,
        views: 234,
        rating: 4.5,
        tags: 'javascript,programming',
        subject: 'Computer Science',
        career: 'Software Engineering',
        university: 'Tech University',
        authorId: 'user1',
        author: mockUser,
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-13'),
        _count: { comments: 6, bookmarks: 18 },
      },
    ]

    let content: any[] = []
    let totalCount = 0

    if (type === 'all') {
      const transformedPosts = mockPosts.slice(0, Math.ceil(limit / 2)).map(post => ({
        id: post.id,
        contentType: 'post' as const,
        title: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        content: post.content,
        description: null,
        fileUrl: post.imageUrl || post.videoUrl,
        fileName: null,
        price: null,
        downloads: null,
        views: post.viewCount,
        rating: null,
        tags: post.tags,
        subject: null,
        career: null,
        university: null,
        author: post.author,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        stats: {
          likes: post._count.likes,
          comments: post._count.comments,
          shares: post._count.shares,
        },
      }))

      const transformedNotes = mockNotes.slice(0, Math.ceil(limit / 2)).map(note => ({
        id: note.id,
        contentType: 'note' as const,
        title: note.title,
        content: note.content,
        description: note.description,
        fileUrl: note.fileUrl,
        fileName: note.fileName,
        price: note.price,
        downloads: note.downloads,
        views: note.views,
        rating: note.rating,
        tags: note.tags,
        subject: note.subject,
        career: note.career,
        university: note.university,
        author: note.author,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        stats: {
          comments: note._count.comments,
          bookmarks: note._count.bookmarks,
        },
      }))

      content = [...transformedPosts, ...transformedNotes]
      if (sortBy === 'recent') {
        content.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      } else if (sortBy === 'popular') {
        content.sort((a, b) => (b.views || 0) - (a.views || 0))
      }

      content = content.slice(0, limit)
      totalCount = mockPosts.length + mockNotes.length

    } else if (type === 'posts') {
      content = mockPosts.slice(offset, offset + limit).map(post => ({
        id: post.id,
        contentType: 'post' as const,
        title: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        content: post.content,
        description: null,
        fileUrl: post.imageUrl || post.videoUrl,
        fileName: null,
        price: null,
        downloads: null,
        views: post.viewCount,
        rating: null,
        tags: post.tags,
        subject: null,
        career: null,
        university: null,
        author: post.author,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        stats: {
          likes: post._count.likes,
          comments: post._count.comments,
          shares: post._count.shares,
        },
      }))
      totalCount = mockPosts.length

    } else if (type === 'notes') {
      content = mockNotes.slice(offset, offset + limit).map(note => ({
        id: note.id,
        contentType: 'note' as const,
        title: note.title,
        content: note.content,
        description: note.description,
        fileUrl: note.fileUrl,
        fileName: note.fileName,
        price: note.price,
        downloads: note.downloads,
        views: note.views,
        rating: note.rating,
        tags: note.tags,
        subject: note.subject,
        career: note.career,
        university: note.university,
        author: note.author,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        stats: {
          comments: note._count.comments,
          bookmarks: note._count.bookmarks,
        },
      }))
      totalCount = mockNotes.length
    }

    // Calculate pagination
    const hasMore = offset + limit < totalCount
    const nextOffset = hasMore ? offset + limit : null

    return NextResponse.json({
      success: true,
      data: {
        content,
        pagination: {
          limit,
          offset,
          total: totalCount,
          hasMore,
          nextOffset,
        },
      },
    })

  } catch (error) {
    console.error('Error in unified content API:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}