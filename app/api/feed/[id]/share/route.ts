import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const sharePostSchema = z.object({
  comment: z.string().max(500).optional(),
  visibility: z.enum(['public', 'university', 'friends', 'private']).default('public'),
});

// POST /api/feed/[id]/share - Share a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const originalPostId = params.id;
    const body = await request.json();
    const data = sharePostSchema.parse(body);

    // Check if original post exists and user has access to it
    const originalPost = await prisma.post.findFirst({
      where: {
        id: originalPostId,
        OR: [
          { visibility: 'public' },
          { 
            visibility: 'university',
            author: { university: session.user.university }
          },
          {
            visibility: 'friends',
            author: {
              followers: {
                some: { followerId: session.user.id }
              }
            }
          },
          { authorId: session.user.id }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            verified: true
          }
        }
      }
    });

    if (!originalPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Note: Share tracking would be implemented with a separate Share model if needed

    // Create a new post that represents the share
    const sharePost = await prisma.post.create({
      data: {
        type: 'post', // Shares are always of type 'post'
        content: data.comment,
        visibility: data.visibility,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            verified: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true
          }
        }
      }
    });

    // Create notification for original post author (if not self-share)
    if (originalPost.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: 'SHARE',
          userId: originalPost.authorId,
          actorId: session.user.id,
          postId: originalPostId,
          title: 'Post Shared',
          message: 'shared your post'
        }
      }).catch(console.error);
    }

    // Analytics tracking would go here if needed

    // Transform to FeedPost format
    const feedPost = {
      id: sharePost.id,
      type: 'post' as const,
      author: sharePost.author,
      createdAt: sharePost.createdAt.toISOString(),
      content: sharePost.content || undefined,
      visibility: sharePost.visibility as any,
      stats: {
        likes: sharePost._count.likes,
        comments: sharePost._count.comments,
        bookmarks: sharePost._count.bookmarks,
        views: 0
      },
      viewerState: {
        liked: false,
        saved: false,
        shared: true
      }
    };

    return NextResponse.json({
      sharePost: feedPost
    }, { status: 201 });
  } catch (error) {
    console.error('Share POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}