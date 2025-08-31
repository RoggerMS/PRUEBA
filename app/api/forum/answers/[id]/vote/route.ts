import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const voteSchema = z.object({
  type: z.enum(['UP', 'DOWN', 'REMOVE'])
})

// POST /api/forum/answers/[id]/vote - Vote on an answer
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

    const answerId = params.id
    const body = await request.json()
    const { type } = voteSchema.parse(body)
    const userId = session.user.id

    // Check if answer exists
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        id: true,
        authorId: true,
        question: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    if (!answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }

    // Users can't vote on their own answers
    if (answer.authorId === userId) {
      return NextResponse.json(
        { error: 'Cannot vote on your own answer' },
        { status: 400 }
      )
    }

    // Can't vote on answers to closed questions
    if (answer.question.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'Cannot vote on answers to closed questions' },
        { status: 400 }
      )
    }

    // Get existing vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_answerId: {
          userId,
          answerId
        }
      }
    })

    let newVoteType: string | null = null
    let pointsChange = 0

    if (type === 'REMOVE') {
      // Remove existing vote
      if (existingVote) {
        await prisma.vote.delete({
          where: {
            userId_answerId: {
              userId,
              answerId
            }
          }
        })

        // Reverse points change
        pointsChange = existingVote.type === 'UP' ? -10 : 5
      }
    } else {
      // Add or update vote
      if (existingVote) {
        // Update existing vote
        if (existingVote.type !== type) {
          await prisma.vote.update({
            where: {
              userId_answerId: {
                userId,
                answerId
              }
            },
            data: { type }
          })

          // Calculate points change (reverse old vote, apply new vote)
          const oldPoints = existingVote.type === 'UP' ? 10 : -5
          const newPoints = type === 'UP' ? 10 : -5
          pointsChange = newPoints - oldPoints
          newVoteType = type
        }
        // If same vote type, do nothing
      } else {
        // Create new vote
        await prisma.vote.create({
          data: {
            type,
            userId,
            answerId
          }
        })

        pointsChange = type === 'UP' ? 10 : -5
        newVoteType = type
      }
    }

    // Update answer author's points
    if (pointsChange !== 0) {
      await prisma.user.update({
        where: { id: answer.authorId },
        data: {
          points: { increment: pointsChange }
        }
      })
    }

    // Get updated vote counts
    const [upvotes, downvotes] = await Promise.all([
      prisma.vote.count({
        where: {
          answerId,
          type: 'UP'
        }
      }),
      prisma.vote.count({
        where: {
          answerId,
          type: 'DOWN'
        }
      })
    ])

    const score = upvotes - downvotes

    return NextResponse.json({
      success: true,
      upvotes,
      downvotes,
      score,
      userVote: newVoteType,
      pointsChange
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error processing vote:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}

// GET /api/forum/answers/[id]/vote - Get vote information for an answer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const answerId = params.id
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Check if answer exists
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: { id: true }
    })

    if (!answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }

    // Get vote counts
    const [upvotes, downvotes, userVote] = await Promise.all([
      prisma.vote.count({
        where: {
          answerId,
          type: 'UP'
        }
      }),
      prisma.vote.count({
        where: {
          answerId,
          type: 'DOWN'
        }
      }),
      userId ? prisma.vote.findUnique({
        where: {
          userId_answerId: {
            userId,
            answerId
          }
        },
        select: { type: true }
      }) : null
    ])

    const score = upvotes - downvotes

    return NextResponse.json({
      upvotes,
      downvotes,
      score,
      userVote: userVote?.type || null
    })
  } catch (error) {
    console.error('Error fetching vote information:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vote information' },
      { status: 500 }
    )
  }
}