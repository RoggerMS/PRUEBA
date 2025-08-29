import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Comment } from '@/types/feed';
import { z } from 'zod';

// Marcar como ruta dinámica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


const createCommentSchema = z.object({
  text: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

const commentsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  sort: z.enum(['recent', 'relevant']).default('relevant'),
});

// GET /api/feed/[id]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;
    const { searchParams } = new URL(request.url);
    const query = commentsQuerySchema.parse(Object.fromEntries(searchParams));

    // Check if post exists and user has access
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        OR: [
          { visibility: 'PUBLIC' },
          {
            visibility: 'UNIVERSITY',
            author: { university: (session.user as any).university }
          },
          {
            visibility: 'FRIENDS',
            author: {
              followers: {
                some: { followerId: session.user.id }
              }
            }
          },
          { authorId: session.user.id }
        ]
      },
      select: { id: true }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Build where clause for comments
    const whereClause: any = {
      postId,
      parentId: null // Only get top-level comments first
    };

    if (query.cursor) {
      whereClause.id = {
        lt: query.cursor
      };
    }

    // Determine order
    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'relevant') {
      orderBy = [
        { likes: { _count: 'desc' } },
        { createdAt: 'desc' }
      ];
    }

    const comments = await prisma.comment.findMany({
      where: whereClause,
      orderBy,
      take: query.limit + 1,
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
        likes: {
          where: { userId: session.user.id },
          select: { id: true }
        },
        replies: {
          take: 3, // Show first 3 replies
          orderBy: { createdAt: 'asc' },
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
            likes: {
              where: { userId: session.user.id },
              select: { id: true }
            },
            _count: {
              select: {
                likes: true,
                replies: true
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
    });

    const hasMore = comments.length > query.limit;
    const resultComments = comments.slice(0, query.limit);
    const nextCursor = hasMore ? resultComments[resultComments.length - 1]?.id : undefined;

    // Transform to Comment format
    const transformedComments: Comment[] = resultComments.map((comment: any) => ({
      id: comment.id,
      postId: comment.postId!,
      author: {
        id: comment.author.id,
        name: comment.author.name || '',
        username: comment.author.username,
        avatar: comment.author.image || undefined,
        verified: comment.author.verified
      },
      text: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt?.toISOString(),
      parentId: comment.parentId || undefined,
      stats: {
        fires: comment._count.likes,
        replies: comment._count.replies
      },
      viewerState: {
        fired: comment.likes.length > 0
      },
      replies: comment.replies?.map((reply: any) => ({
        id: reply.id,
        postId: comment.postId!,
        author: {
        id: reply.author.id,
        name: reply.author.name || '',
        username: reply.author.username,
        avatar: reply.author.image || undefined,
        verified: reply.author.verified
        },
        text: reply.content,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt?.toISOString(),
        parentId: comment.id,
        stats: {
          fires: reply._count.likes,
          replies: reply._count.replies
        },
        viewerState: {
          fired: reply.likes.length > 0
        }
      }))
    }));

    return NextResponse.json({
      comments: transformedComments,
      nextCursor,
      hasMore
    });
  } catch (error) {
    console.error('Comments GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/feed/[id]/comments - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;
    const body = await request.json();
    const data = createCommentSchema.parse(body);

    // Check if post exists and user has access
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        OR: [
          { visibility: 'PUBLIC' },
          {
            visibility: 'UNIVERSITY',
            author: { university: (session.user as any).university }
          },
          {
            visibility: 'FRIENDS',
            author: {
              followers: {
                some: { followerId: session.user.id }
              }
            }
          },
          { authorId: session.user.id }
        ]
      },
      select: {
        id: true,
        authorId: true
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // If replying to a comment, check if parent comment exists
    if (data.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: {
          id: data.parentId,
          postId // Ensure parent comment belongs to this post
        }
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: data.text,
        postId,
        authorId: session.user.id,
        parentId: data.parentId
      },
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
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      }
    });

    // Create notification for post author (if not self-comment)
      if (post.authorId !== session.user.id) {
        await prisma.notification.create({
          data: {
            type: 'COMMENT',
            userId: post.authorId,
            title: 'New Comment',
            message: data.parentId ? 'replied to your comment' : 'commented on your post',
            data: { actorId: session.user.id, postId }
          }
        }).catch(console.error);
      }

    // Analytics tracking would go here if needed

    // Transform to Comment format
    const transformedComment: Comment = {
      id: comment.id,
      postId: comment.postId!,
      author: {
        id: comment.author.id,
        name: comment.author.name || '',
        username: comment.author.username,
        avatar: comment.author.image || undefined,
        verified: comment.author.verified
      },
      text: comment.content,
      createdAt: comment.createdAt.toISOString(),
      parentId: comment.parentId || undefined,
      stats: {
        fires: 0,
        replies: 0
      },
      viewerState: {
        fired: false
      }
    };

    return NextResponse.json(transformedComment, { status: 201 });
  } catch (error) {
    console.error('Comment POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}