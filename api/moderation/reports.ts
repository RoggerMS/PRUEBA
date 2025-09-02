import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createReportSchema = z.object({
  type: z.enum(['user', 'post', 'comment', 'message', 'conversation']),
  targetId: z.string().min(1),
  reason: z.enum([
    'spam',
    'harassment',
    'hate_speech',
    'violence',
    'sexual_content',
    'misinformation',
    'copyright',
    'privacy',
    'impersonation',
    'other'
  ]),
  description: z.string().optional(),
  evidence: z.array(z.string()).optional() // URLs to evidence (screenshots, etc.)
});

const updateReportSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['pending', 'investigating', 'resolved', 'dismissed']).optional(),
  moderatorNotes: z.string().optional(),
  action: z.enum(['none', 'warning', 'content_removal', 'temporary_ban', 'permanent_ban']).optional(),
  actionDuration: z.number().optional() // Duration in hours for temporary actions
});

const getReportsSchema = z.object({
  status: z.enum(['pending', 'investigating', 'resolved', 'dismissed']).optional(),
  type: z.enum(['user', 'post', 'comment', 'message', 'conversation']).optional(),
  reason: z.enum([
    'spam',
    'harassment',
    'hate_speech',
    'violence',
    'sexual_content',
    'misinformation',
    'copyright',
    'privacy',
    'impersonation',
    'other'
  ]).optional(),
  moderatorId: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    switch (req.method) {
      case 'POST':
        return await createReport(req, res, session.user.id);
      case 'GET':
        return await getReports(req, res, session.user.id);
      case 'PUT':
        return await updateReport(req, res, session.user.id);
      case 'DELETE':
        return await deleteReport(req, res, session.user.id);
      default:
        res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Reports API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createReport(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const validatedData = createReportSchema.parse(req.body);
    
    // Check if user has already reported this target
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: userId,
        type: validatedData.type,
        targetId: validatedData.targetId,
        status: { in: ['pending', 'investigating'] }
      }
    });

    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this content' });
    }

    // Verify target exists based on type
    let targetExists = false;
    let targetData: any = null;

    switch (validatedData.type) {
      case 'user':
        targetData = await prisma.user.findUnique({
          where: { id: validatedData.targetId },
          select: { id: true, username: true, name: true }
        });
        targetExists = !!targetData;
        break;
      case 'post':
        targetData = await prisma.post.findUnique({
          where: { id: validatedData.targetId },
          select: { id: true, content: true, authorId: true }
        });
        targetExists = !!targetData;
        break;
      case 'comment':
        targetData = await prisma.comment.findUnique({
          where: { id: validatedData.targetId },
          select: { id: true, content: true, authorId: true }
        });
        targetExists = !!targetData;
        break;
      case 'message':
        targetData = await prisma.message.findUnique({
          where: { id: validatedData.targetId },
          select: { id: true, content: true, senderId: true }
        });
        targetExists = !!targetData;
        break;
      case 'conversation':
        targetData = await prisma.conversation.findUnique({
          where: { id: validatedData.targetId },
          select: { id: true, title: true, type: true }
        });
        targetExists = !!targetData;
        break;
    }

    if (!targetExists) {
      return res.status(404).json({ error: 'Target content not found' });
    }

    // Calculate priority based on reason and user history
    let priority = 'medium';
    const highPriorityReasons = ['violence', 'hate_speech', 'harassment'];
    const lowPriorityReasons = ['spam', 'other'];

    if (highPriorityReasons.includes(validatedData.reason)) {
      priority = 'high';
    } else if (lowPriorityReasons.includes(validatedData.reason)) {
      priority = 'low';
    }

    // Check if reporter has a good track record
    const reporterStats = await prisma.report.groupBy({
      by: ['status'],
      where: { reporterId: userId },
      _count: { status: true }
    });

    const totalReports = reporterStats.reduce((sum, stat) => sum + stat._count.status, 0);
    const resolvedReports = reporterStats.find(stat => stat.status === 'resolved')?._count.status || 0;
    const dismissedReports = reporterStats.find(stat => stat.status === 'dismissed')?._count.status || 0;

    // Adjust priority based on reporter reliability
    if (totalReports > 5) {
      const accuracy = resolvedReports / (resolvedReports + dismissedReports);
      if (accuracy > 0.8) {
        priority = priority === 'low' ? 'medium' : 'high';
      } else if (accuracy < 0.3) {
        priority = priority === 'high' ? 'medium' : 'low';
      }
    }

    const report = await prisma.report.create({
      data: {
        type: validatedData.type,
        targetId: validatedData.targetId,
        reason: validatedData.reason,
        description: validatedData.description,
        evidence: validatedData.evidence || [],
        priority,
        status: 'pending',
        reporterId: userId,
        targetData: targetData
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Create notification for moderators
    const moderators = await prisma.user.findMany({
      where: { role: { in: ['admin', 'moderator'] } },
      select: { id: true }
    });

    const notifications = moderators.map(mod => ({
      userId: mod.id,
      type: 'moderation_report' as const,
      title: 'New Report',
      message: `New ${validatedData.type} report: ${validatedData.reason}`,
      data: { reportId: report.id, type: validatedData.type, reason: validatedData.reason }
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({ data: notifications });
    }

    return res.status(201).json({ report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    throw error;
  }
}

async function getReports(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Check if user is moderator or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    const isModerator = user?.role === 'admin' || user?.role === 'moderator';
    
    const validatedQuery = getReportsSchema.parse(req.query);

    const where: any = {};
    
    // Non-moderators can only see their own reports
    if (!isModerator) {
      where.reporterId = userId;
    }

    if (validatedQuery.status) {
      where.status = validatedQuery.status;
    }
    if (validatedQuery.type) {
      where.type = validatedQuery.type;
    }
    if (validatedQuery.reason) {
      where.reason = validatedQuery.reason;
    }
    if (validatedQuery.moderatorId && isModerator) {
      where.moderatorId = validatedQuery.moderatorId;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true
            }
          },
          moderator: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          [validatedQuery.sortBy]: validatedQuery.sortOrder
        },
        skip: validatedQuery.offset,
        take: validatedQuery.limit
      }),
      prisma.report.count({ where })
    ]);

    return res.status(200).json({
      reports,
      pagination: {
        total,
        limit: validatedQuery.limit,
        offset: validatedQuery.offset,
        hasMore: validatedQuery.offset + validatedQuery.limit < total
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    throw error;
  }
}

async function updateReport(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Check if user is moderator or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'admin' && user?.role !== 'moderator') {
      return res.status(403).json({ error: 'Moderator access required' });
    }

    const validatedData = updateReportSchema.parse(req.body);

    const existingReport = await prisma.report.findUnique({
      where: { id: validatedData.id },
      include: {
        reporter: {
          select: { id: true, username: true, name: true }
        }
      }
    });

    if (!existingReport) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const updateData: any = {
      moderatorId: userId,
      updatedAt: new Date()
    };

    if (validatedData.status) {
      updateData.status = validatedData.status;
    }
    if (validatedData.moderatorNotes) {
      updateData.moderatorNotes = validatedData.moderatorNotes;
    }
    if (validatedData.action) {
      updateData.action = validatedData.action;
      updateData.actionTakenAt = new Date();
      
      if (validatedData.actionDuration) {
        updateData.actionExpiresAt = new Date(Date.now() + validatedData.actionDuration * 60 * 60 * 1000);
      }
    }

    const updatedReport = await prisma.report.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        },
        moderator: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Apply moderation action if specified
    if (validatedData.action && validatedData.action !== 'none') {
      await applyModerationAction(
        existingReport.type,
        existingReport.targetId,
        validatedData.action,
        validatedData.actionDuration,
        userId
      );
    }

    // Notify reporter of resolution
    if (validatedData.status === 'resolved' || validatedData.status === 'dismissed') {
      await prisma.notification.create({
        data: {
          userId: existingReport.reporterId,
          type: 'report_update',
          title: 'Report Update',
          message: `Your report has been ${validatedData.status}`,
          data: {
            reportId: existingReport.id,
            status: validatedData.status,
            action: validatedData.action
          }
        }
      });
    }

    return res.status(200).json({ report: updatedReport });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    throw error;
  }
}

async function deleteReport(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Report ID is required' });
    }

    // Check if user is admin or the reporter
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    const report = await prisma.report.findUnique({
      where: { id },
      select: { reporterId: true, status: true }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Only admin or the reporter can delete, and only if pending
    if (user?.role !== 'admin' && report.reporterId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (report.status !== 'pending' && user?.role !== 'admin') {
      return res.status(400).json({ error: 'Cannot delete report that is being processed' });
    }

    await prisma.report.delete({ where: { id } });

    return res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    throw error;
  }
}

async function applyModerationAction(
  type: string,
  targetId: string,
  action: string,
  duration?: number,
  moderatorId?: string
) {
  const expiresAt = duration ? new Date(Date.now() + duration * 60 * 60 * 1000) : null;

  switch (action) {
    case 'warning':
      // Create a warning record
      await prisma.moderationAction.create({
        data: {
          type: 'warning',
          targetType: type,
          targetId,
          moderatorId,
          reason: 'Content violation',
          expiresAt
        }
      });
      break;

    case 'content_removal':
      // Mark content as removed
      if (type === 'post') {
        await prisma.post.update({
          where: { id: targetId },
          data: { isRemoved: true, removedAt: new Date(), removedBy: moderatorId }
        });
      } else if (type === 'comment') {
        await prisma.comment.update({
          where: { id: targetId },
          data: { isRemoved: true, removedAt: new Date(), removedBy: moderatorId }
        });
      }
      break;

    case 'temporary_ban':
    case 'permanent_ban':
      // Apply user ban
      if (type === 'user') {
        await prisma.user.update({
          where: { id: targetId },
          data: {
            isBanned: true,
            bannedAt: new Date(),
            bannedUntil: expiresAt,
            bannedBy: moderatorId
          }
        });
      } else {
        // Ban the author of the content
        let authorId: string | null = null;
        
        if (type === 'post') {
          const post = await prisma.post.findUnique({
            where: { id: targetId },
            select: { authorId: true }
          });
          authorId = post?.authorId || null;
        } else if (type === 'comment') {
          const comment = await prisma.comment.findUnique({
            where: { id: targetId },
            select: { authorId: true }
          });
          authorId = comment?.authorId || null;
        }

        if (authorId) {
          await prisma.user.update({
            where: { id: authorId },
            data: {
              isBanned: true,
              bannedAt: new Date(),
              bannedUntil: expiresAt,
              bannedBy: moderatorId
            }
          });
        }
      }
      break;
  }

  // Record the moderation action
  await prisma.moderationAction.create({
    data: {
      type: action,
      targetType: type,
      targetId,
      moderatorId,
      reason: 'Report resolution',
      expiresAt
    }
  });
}