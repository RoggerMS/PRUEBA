import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createCommentSchema = z.object({
  text: z.string().min(1).max(2000),
  parentId: z.string().optional()
});

// GET /api/feed/[id]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const postId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Get top-level comments with nested replies
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null // Only top-level comments
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
        replies: {
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
            replies: {
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
                replies: {
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
                        replies: true,
                        likes: true
                      }
                    }
                  },
                  orderBy: { createdAt: 'asc' }
                },
                _count: {
                  select: {
                    replies: true,
                    likes: true
                  }
                }
              },
              orderBy: { createdAt: 'asc' }
            },
            _count: {
              select: {
                replies: true,
                likes: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            replies: true,
            likes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    // Get user's like status for all comments if authenticated
    let userLikes: Set<string> = new Set();
    if (session?.user?.id) {
      const allCommentIds = getAllCommentIds(comments);
      const likes = await prisma.commentLike.findMany({
        where: {
          userId: session.user.id,
          commentId: { in: allCommentIds }
        },
        select: { commentId: true }
      });
      userLikes = new Set(likes.map(like => like.commentId));
    }

    // Transform comments with viewer state
    const transformedComments = comments.map(comment => 
      transformComment(comment, userLikes)
    );

    // Get total count for pagination
    const totalComments = await prisma.comment.count({
      where: {
        postId,
        parentId: null
      }
    });

    return NextResponse.json({
      comments: transformedComments,
      pagination: {
        page,
        limit,
        total: totalComments,
        hasMore: offset + comments.length < totalComments
      }
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
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
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const postId = params.id;
    const body = await request.json();
    const { text, parentId } = createCommentSchema.parse(body);

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // If replying to a comment, verify parent exists and get depth
    let depth = 0;
    let path = '';
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, depth: true, path: true, postId: true }
      });

      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }

      depth = parentComment.depth + 1;
      path = parentComment.path ? `${parentComment.path}.${parentId}` : parentId;
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        text,
        postId,
        authorId: session.user.id,
        parentId,
        depth,
        path
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
            replies: true,
            likes: true
          }
        }
      }
    });

    // Update post comment count
    await prisma.post.update({
      where: { id: postId },
      data: {
        commentCount: {
          increment: 1
        }
      }
    });

    // Transform comment with viewer state
    const transformedComment = {
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt.toISOString(),
      editedAt: comment.editedAt?.toISOString() || null,
      depth: comment.depth,
      path: comment.path,
      author: comment.author,
      stats: {
        likes: comment._count.likes,
        replies: comment._count.replies
      },
      viewerState: {
        liked: false // New comment, user hasn't liked it yet
      },
      replies: []
    };

    return NextResponse.json(transformedComment, { status: 201 });

  } catch (error) {
    console.error('Error creating comment:', error);
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

// Helper function to get all comment IDs recursively
function getAllCommentIds(comments: any[]): string[] {
  const ids: string[] = [];
  
  function collectIds(commentList: any[]) {
    for (const comment of commentList) {
      ids.push(comment.id);
      if (comment.replies && comment.replies.length > 0) {
        collectIds(comment.replies);
      }
    }
  }
  
  collectIds(comments);
  return ids;
}

// Helper function to transform comment with viewer state
function transformComment(comment: any, userLikes: Set<string>): any {
  const transformed = {
    id: comment.id,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
    editedAt: comment.editedAt?.toISOString() || null,
    depth: comment.depth,
    path: comment.path,
    author: comment.author,
    stats: {
      likes: comment._count.likes,
      replies: comment._count.replies
    },
    viewerState: {
      liked: userLikes.has(comment.id)
    },
    replies: comment.replies ? comment.replies.map((reply: any) => 
      transformComment(reply, userLikes)
    ) : []
  };
  
  return transformed;
}