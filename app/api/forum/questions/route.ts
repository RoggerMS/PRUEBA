import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createQuestionSchema = z.object({
  title: z.string().min(10).max(200),
  content: z.string().min(20).max(5000),
  tags: z.array(z.string()).max(5).optional(),
  subject: z.string().optional(),
  career: z.string().optional(),
  university: z.string().optional(),
  semester: z.string().optional(),
  bounty: z.number().int().min(0).optional()
})

// GET /api/forum/questions - Get paginated questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const search = searchParams.get('search')
    const subject = searchParams.get('subject')
    const career = searchParams.get('career')
    const university = searchParams.get('university')
    const semester = searchParams.get('semester')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const sortBy = searchParams.get('sortBy') || 'recent' // recent, popular, unanswered, bounty
    const status = searchParams.get('status') || 'OPEN'

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: status as any
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (subject) where.subject = subject
    if (career) where.career = career
    if (university) where.university = university
    if (semester) where.semester = semester
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      }
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }
    switch (sortBy) {
      case 'popular':
        orderBy = { views: 'desc' }
        break
      case 'unanswered':
        where.answers = { none: {} }
        break
      case 'bounty':
        orderBy = { bounty: 'desc' }
        where.bounty = { gt: 0 }
        break
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
          bestAnswer: {
            select: {
              id: true,
              content: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true
                }
              }
            }
          },
          _count: {
            select: {
              answers: true,
              votes: true
            }
          },
          // Include user's vote if logged in
          ...(userId && {
            votes: {
              where: { userId },
              select: { type: true }
            }
          })
        }
      }),
      prisma.question.count({ where })
    ])

    // Transform questions to include computed fields
    const transformedQuestions = questions.map(question => {
      const upvotes = question._count.votes // This would need to be calculated properly
      const userVote = userId && question.votes?.length > 0 ? question.votes[0].type : null
      
      return {
        ...question,
        answersCount: question._count.answers,
        upvotes,
        userVote,
        hasAcceptedAnswer: !!question.bestAnswer,
        votes: undefined,
        _count: undefined
      }
    })

    return NextResponse.json({
      questions: transformedQuestions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST /api/forum/questions - Create a new question
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      content,
      tags = [],
      subject,
      career,
      university,
      semester,
      bounty = 0
    } = createQuestionSchema.parse(body)

    const userId = session.user.id

    // Check if user has enough points for bounty (if applicable)
    if (bounty > 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true }
      })

      if (!user || user.points < bounty) {
        return NextResponse.json(
          { error: 'Insufficient points for bounty' },
          { status: 400 }
        )
      }
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        title,
        content,
        tags,
        subject,
        career,
        university,
        semester,
        bounty,
        authorId: userId,
        status: 'OPEN'
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
            answers: true,
            votes: true
          }
        }
      }
    })

    // Deduct bounty points from user if applicable
    if (bounty > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: { decrement: bounty }
        }
      })
    }

    // Transform response
    const transformedQuestion = {
      ...question,
      answersCount: question._count.answers,
      upvotes: question._count.votes,
      userVote: null,
      hasAcceptedAnswer: false,
      _count: undefined
    }

    return NextResponse.json(transformedQuestion, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}