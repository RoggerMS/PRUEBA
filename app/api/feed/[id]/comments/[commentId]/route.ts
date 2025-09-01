import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(500, 'Comment too long'),
  mentions: z.array(z.string()).optional() // Explicit mentions
})

// Helper function to extract mentions from content
function extractMentions(content: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g
  const mentions: string[] = []
  let match
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1])
  }
  
  return [...new Set(mentions)] // Remove duplicates
}

// GET /api/feed/[id]/comments/[commentId] - Get a specific comment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { id: postId, commentId } = params
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            verified: true
          }
        },
        mentions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        },
        // Include user's likes if logged in
        ...(userId && {
          likes: {
            where: { userId },
            select: { id: true }
          }
        })
      }
    })

    if (!comment || comment.postId !== postId) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Transform the response
    const transformedComment = {
      ...comment,
      isLiked: userId ? comment.likes?.length > 0 : false,
      likesCount: comment._count.likes,
      repliesCount: comment._count.replies,
      mentions: comment.mentions.map(mention => ({
        id: mention.id,
        user: mention.user
      })),
      likes: undefined,
      _count: undefined
    }

    return NextResponse.json(transformedComment)
  } catch (error) {
    console.error('Error fetching comment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comment' },
      { status: 500 }
    )
  }
}

// PUT /api/feed/[id]/comments/[commentId] - Update a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: postId, commentId } = params
    const body = await request.json()
    const validatedData = updateCommentSchema.parse(body)

    // Check if comment exists and user owns it
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true, authorId: true }
    })

    if (!existingComment || existingComment.postId !== postId) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (existingComment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to edit this comment' },
        { status: 403 }
      )
    }

    // Extract mentions from content
    const contentMentions = extractMentions(validatedData.content)
    const allMentions = [...new Set([...contentMentions, ...(validatedData.mentions || [])])]

    // Get mentioned users
    const mentionedUsers = allMentions.length > 0 ? await prisma.user.findMany({
      where: {
        username: {
          in: allMentions
        }
      },
      select: { id: true, username: true }
    }) : []

    // Update comment with mentions in a transaction
    const updatedComment = await prisma.$transaction(async (tx) => {
      // Delete existing mentions
      await tx.commentMention.deleteMany({
        where: { commentId }
      })

      // Update the comment
      const comment = await tx.comment.update({
        where: { id: commentId },
        data: {
          content: validatedData.content,
          editedAt: new Date()
        }
      })

      // Create new mention relationships
      if (mentionedUsers.length > 0) {
        await tx.commentMention.createMany({
          data: mentionedUsers.map(user => ({
            commentId,
            userId: user.id,
            username: user.username
          }))
        })
      }

      // Return comment with all related data
      return await tx.comment.findUnique({
        where: { id: commentId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              verified: true
            }
          },
          mentions: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              likes: true,
              replies: true
            }
          }
        }
      })
    })

    // Transform the response
    const transformedComment = {
      ...updatedComment,
      isLiked: false, // We don't have user's like info in this context
      likesCount: updatedComment._count.likes,
      repliesCount: updatedComment._count.replies,
      mentions: updatedComment.mentions.map(mention => ({
        id: mention.id,
        user: mention.user
      })),
      _count: undefined
    }

    return NextResponse.json(transformedComment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

// DELETE /api/feed/[id]/comments/[commentId] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: postId, commentId } = params

    // Check if comment exists and user owns it
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true, authorId: true }
    })

    if (!existingComment || existingComment.postId !== postId) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    if (existingComment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this comment' },
        { status: 403 }
      )
    }

    // Delete comment and all related data (cascading)
    await prisma.comment.delete({
      where: { id: commentId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}