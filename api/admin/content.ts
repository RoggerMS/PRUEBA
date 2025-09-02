import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const contentFiltersSchema = z.object({
  type: z.enum(['post', 'comment', 'message']).optional(),
  status: z.enum(['active', 'hidden', 'deleted', 'flagged']).optional(),
  authorId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'reports', 'likes']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

const contentUpdateSchema = z.object({
  status: z.enum(['active', 'hidden', 'deleted', 'flagged']).optional(),
  moderatorNotes: z.string().optional(),
  flagReason: z.string().optional()
});

const bulkActionSchema = z.object({
  action: z.enum(['hide', 'delete', 'flag', 'restore']),
  contentIds: z.array(z.string()).min(1),
  reason: z.string().optional(),
  notes: z.string().optional()
});

// Helper function to check admin/moderator permissions
async function checkAdminPermissions(session: any) {
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!user || !['admin', 'moderator'].includes(user.role)) {
    return { error: 'Insufficient permissions', status: 403 };
  }

  return { user };
}

// GET /api/admin/content - Get content with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const permissionCheck = await checkAdminPermissions(session);
    
    if (permissionCheck.error) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = contentFiltersSchema.parse(Object.fromEntries(searchParams));

    // Build where clause
    const where: any = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.authorId) {
      where.authorId = filters.authorId;
    }
    
    if (filters.search) {
      where.OR = [
        { content: { contains: filters.search, mode: 'insensitive' } },
        { author: { name: { contains: filters.search, mode: 'insensitive' } } },
        { author: { username: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }
    
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    // Calculate pagination
    const skip = (filters.page - 1) * filters.limit;

    // Get content based on type
    let content = [];
    let total = 0;

    if (!filters.type || filters.type === 'post') {
      const posts = await prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              email: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              reports: true
            }
          }
        },
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip,
        take: filters.limit
      });

      const postsTotal = await prisma.post.count({ where });
      
      content = posts.map(post => ({
        ...post,
        type: 'post',
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        reportsCount: post._count.reports
      }));
      
      total = postsTotal;
    }

    if (!filters.type || filters.type === 'comment') {
      const comments = await prisma.comment.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              email: true
            }
          },
          post: {
            select: {
              id: true,
              title: true
            }
          },
          _count: {
            select: {
              likes: true,
              reports: true
            }
          }
        },
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip: filters.type ? skip : 0,
        take: filters.type ? filters.limit : undefined
      });

      const commentsTotal = await prisma.comment.count({ where });
      
      const commentContent = comments.map(comment => ({
        ...comment,
        type: 'comment',
        likesCount: comment._count.likes,
        reportsCount: comment._count.reports
      }));
      
      if (filters.type === 'comment') {
        content = commentContent;
        total = commentsTotal;
      } else {
        content = [...content, ...commentContent];
        total += commentsTotal;
      }
    }

    // Sort mixed content if no specific type filter
    if (!filters.type) {
      content.sort((a, b) => {
        const aValue = a[filters.sortBy];
        const bValue = b[filters.sortBy];
        
        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
      
      // Apply pagination to mixed results
      content = content.slice(skip, skip + filters.limit);
    }

    return NextResponse.json({
      content,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      }
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/content/[id] - Update content
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const permissionCheck = await checkAdminPermissions(session);
    
    if (permissionCheck.error) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');
    const contentType = searchParams.get('type');
    
    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: 'Content ID and type are required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates = contentUpdateSchema.parse(body);

    let updatedContent;
    
    if (contentType === 'post') {
      updatedContent = await prisma.post.update({
        where: { id: contentId },
        data: {
          ...updates,
          updatedAt: new Date()
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true
            }
          }
        }
      });
    } else if (contentType === 'comment') {
      updatedContent = await prisma.comment.update({
        where: { id: contentId },
        data: {
          ...updates,
          updatedAt: new Date()
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true
            }
          }
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Log moderation action
    await prisma.moderationAction.create({
      data: {
        type: 'content_moderation',
        reason: `Content ${updates.status}: ${updates.moderatorNotes || 'No reason provided'}`,
        targetId: contentId,
        targetType: contentType as any,
        moderatorId: session.user.id,
        notes: updates.moderatorNotes
      }
    });

    return NextResponse.json({
      message: 'Content updated successfully',
      content: updatedContent
    });

  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

// POST /api/admin/content/bulk - Bulk actions on content
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const permissionCheck = await checkAdminPermissions(session);
    
    if (permissionCheck.error) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.status }
      );
    }

    const body = await request.json();
    const { action, contentIds, reason, notes } = bulkActionSchema.parse(body);

    // Determine status based on action
    let status: string;
    switch (action) {
      case 'hide':
        status = 'hidden';
        break;
      case 'delete':
        status = 'deleted';
        break;
      case 'flag':
        status = 'flagged';
        break;
      case 'restore':
        status = 'active';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Get content type for each ID (assuming format: type:id)
    const updates = [];
    
    for (const contentId of contentIds) {
      const [type, id] = contentId.split(':');
      
      if (type === 'post') {
        await prisma.post.update({
          where: { id },
          data: {
            status,
            moderatorNotes: notes,
            updatedAt: new Date()
          }
        });
      } else if (type === 'comment') {
        await prisma.comment.update({
          where: { id },
          data: {
            status,
            moderatorNotes: notes,
            updatedAt: new Date()
          }
        });
      }

      // Log moderation action
      await prisma.moderationAction.create({
        data: {
          type: 'content_moderation',
          reason: reason || `Bulk ${action} action`,
          targetId: id,
          targetType: type as any,
          moderatorId: session.user.id,
          notes
        }
      });

      updates.push({ id, type, status });
    }

    return NextResponse.json({
      message: `Bulk ${action} completed successfully`,
      updated: updates.length,
      details: updates
    });

  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/content/[id] - Delete content permanently
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const permissionCheck = await checkAdminPermissions(session);
    
    if (permissionCheck.error) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');
    const contentType = searchParams.get('type');
    
    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: 'Content ID and type are required' },
        { status: 400 }
      );
    }

    // Check if user has admin role for permanent deletion
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can permanently delete content' },
        { status: 403 }
      );
    }

    if (contentType === 'post') {
      // Delete related data first
      await prisma.comment.deleteMany({
        where: { postId: contentId }
      });
      
      await prisma.like.deleteMany({
        where: { postId: contentId }
      });
      
      await prisma.report.deleteMany({
        where: { targetId: contentId, targetType: 'post' }
      });
      
      // Delete the post
      await prisma.post.delete({
        where: { id: contentId }
      });
    } else if (contentType === 'comment') {
      // Delete related data first
      await prisma.like.deleteMany({
        where: { commentId: contentId }
      });
      
      await prisma.report.deleteMany({
        where: { targetId: contentId, targetType: 'comment' }
      });
      
      // Delete the comment
      await prisma.comment.delete({
        where: { id: contentId }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Log moderation action
    await prisma.moderationAction.create({
      data: {
        type: 'content_removal',
        reason: 'Permanent deletion by admin',
        targetId: contentId,
        targetType: contentType as any,
        moderatorId: session.user.id,
        notes: 'Content permanently deleted from system'
      }
    });

    return NextResponse.json({
      message: 'Content permanently deleted'
    });

  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}