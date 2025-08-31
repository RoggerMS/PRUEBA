import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createAnswerSchema = z.object({
  content: z.string().min(20).max(5000)
})

const acceptAnswerSchema = z.object({
  answerId: z.string(),
  action: z.enum(['accept', 'unaccept'])
})

// GET /api/forum/questions/[id]/answers - Get answers for a question
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const sortBy = searchParams.get('sortBy') || 'votes' // votes, recent, oldest

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const skip = (page - 1) * limit

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, bestAnswerId: true }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }
    switch (sortBy) {
      case 'votes':
        orderBy = [{ votes: { _count: 'desc' } }, { createdAt: 'desc' }]
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
    }

    const [answers, total] = await Promise.all([
      prisma.answer.findMany({
        where: { questionId },
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
          _count: {
            select: {
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
      prisma.answer.count({ where: { questionId } })
    ])

    // Calculate vote scores and transform answers
    const transformedAnswers = await Promise.all(
      answers.map(async (answer) => {
        // Get vote counts
        const [upvotes, downvotes] = await Promise.all([
          prisma.vote.count({
            where: {
              answerId: answer.id,
              type: 'UP'
            }
          }),
          prisma.vote.count({
            where: {
              answerId: answer.id,
              type: 'DOWN'
            }
          })
        ])

        const userVote = userId && answer.votes?.length > 0 ? answer.votes[0].type : null
        const isAccepted = answer.id === question.bestAnswerId

        return {
          ...answer,
          upvotes,
          downvotes,
          score: upvotes - downvotes,
          userVote,
          isAccepted,
          votes: undefined,
          _count: undefined
        }
      })
    )

    // Sort by acceptance status first (accepted answers at top), then by original sort
    const sortedAnswers = transformedAnswers.sort((a, b) => {
      if (a.isAccepted && !b.isAccepted) return -1
      if (!a.isAccepted && b.isAccepted) return 1
      return 0
    })

    return NextResponse.json({
      answers: sortedAnswers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching answers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch answers' },
      { status: 500 }
    )
  }
}

// POST /api/forum/questions/[id]/answers - Create an answer or accept/unaccept an answer
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

    const questionId = params.id
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = session.user.id

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        authorId: true,
        status: true,
        bestAnswerId: true,
        bounty: true
      }
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    if (question.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'Question is closed' },
        { status: 400 }
      )
    }

    if (action === 'accept') {
      // Accept/unaccept an answer (only question author can do this)
      if (question.authorId !== userId) {
        return NextResponse.json(
          { error: 'Only the question author can accept answers' },
          { status: 403 }
        )
      }

      const { answerId, action: acceptAction } = acceptAnswerSchema.parse(body)

      // Check if answer exists and belongs to this question
      const answer = await prisma.answer.findUnique({
        where: { id: answerId },
        select: { id: true, questionId: true, authorId: true }
      })

      if (!answer || answer.questionId !== questionId) {
        return NextResponse.json(
          { error: 'Answer not found' },
          { status: 404 }
        )
      }

      if (acceptAction === 'accept') {
        // Accept the answer
        await prisma.question.update({
          where: { id: questionId },
          data: {
            bestAnswerId: answerId,
            status: 'ANSWERED'
          }
        })

        // Award bounty points to answer author if there's a bounty
        if (question.bounty > 0) {
          await prisma.user.update({
            where: { id: answer.authorId },
            data: {
              points: { increment: question.bounty }
            }
          })
        }
      } else {
        // Unaccept the answer
        await prisma.question.update({
          where: { id: questionId },
          data: {
            bestAnswerId: null,
            status: 'OPEN'
          }
        })

        // Remove bounty points from answer author if there was a bounty
        if (question.bounty > 0) {
          await prisma.user.update({
            where: { id: answer.authorId },
            data: {
              points: { decrement: question.bounty }
            }
          })
        }
      }

      return NextResponse.json({
        success: true,
        isAccepted: acceptAction === 'accept'
      })
    } else {
      // Create a new answer
      const { content } = createAnswerSchema.parse(body)

      // Users can't answer their own questions
      if (question.authorId === userId) {
        return NextResponse.json(
          { error: 'Cannot answer your own question' },
          { status: 400 }
        )
      }

      const answer = await prisma.answer.create({
        data: {
          content,
          questionId,
          authorId: userId
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
              votes: true
            }
          }
        }
      })

      // Increment question's answer count
      await prisma.question.update({
        where: { id: questionId },
        data: {
          answerCount: { increment: 1 }
        }
      })

      // Transform response
      const transformedAnswer = {
        ...answer,
        upvotes: 0,
        downvotes: 0,
        score: 0,
        userVote: null,
        isAccepted: false,
        _count: undefined
      }

      return NextResponse.json(transformedAnswer, { status: 201 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error processing answer action:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}