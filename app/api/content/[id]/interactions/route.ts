import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, contentType } = await request.json()
    const contentId = params.id
    const userId = session.user.id

    switch (action) {
      case 'like':
        if (contentType === 'POST') {
          await prisma.like.create({
            data: {
              userId,
              postId: contentId
            }
          })
        }
        break

      case 'unlike':
        if (contentType === 'POST') {
          await prisma.like.deleteMany({
            where: {
              userId,
              postId: contentId
            }
          })
        }
        break

      case 'bookmark':
        await prisma.bookmark.create({
          data: {
            userId,
            ...(contentType === 'POST' ? { postId: contentId } : { noteId: contentId })
          }
        })
        break

      case 'unbookmark':
        await prisma.bookmark.deleteMany({
          where: {
            userId,
            ...(contentType === 'POST' ? { postId: contentId } : { noteId: contentId })
          }
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling interaction:', error)
    return NextResponse.json(
      { error: 'Failed to process interaction' },
      { status: 500 }