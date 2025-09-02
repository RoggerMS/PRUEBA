import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const getStatsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  moderatorId: z.string().optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user is moderator or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'admin' && user?.role !== 'moderator') {
      return res.status(403).json({ error: 'Moderator access required' });
    }

    switch (req.method) {
      case 'GET':
        return await getModerationStats(req, res, session.user.id);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Moderation stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getModerationStats(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const validatedQuery = getStatsSchema.parse(req.query);
    
    // Calculate date range
    let startDate: Date;
    let endDate: Date = new Date();
    
    if (validatedQuery.startDate && validatedQuery.endDate) {
      startDate = new Date(validatedQuery.startDate);
      endDate = new Date(validatedQuery.endDate);
    } else {
      const now = new Date();
      switch (validatedQuery.period) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      }
    }

    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };

    // Get report statistics
    const [reportStats, reportsByStatus, reportsByReason, reportsByType] = await Promise.all([
      // Total reports
      prisma.report.count({
        where: dateFilter
      }),
      
      // Reports by status
      prisma.report.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: { status: true }
      }),
      
      // Reports by reason
      prisma.report.groupBy({
        by: ['reason'],
        where: dateFilter,
        _count: { reason: true },
        orderBy: { _count: { reason: 'desc' } }
      }),
      
      // Reports by type
      prisma.report.groupBy({
        by: ['type'],
        where: dateFilter,
        _count: { type: true }
      })
    ]);

    // Get moderation action statistics
    const [actionStats, actionsByType, actionsByModerator] = await Promise.all([
      // Total actions
      prisma.moderationAction.count({
        where: dateFilter
      }),
      
      // Actions by type
      prisma.moderationAction.groupBy({
        by: ['type'],
        where: dateFilter,
        _count: { type: true }
      }),
      
      // Actions by moderator
      prisma.moderationAction.groupBy({
        by: ['moderatorId'],
        where: dateFilter,
        _count: { moderatorId: true },
        orderBy: { _count: { moderatorId: 'desc' } },
        take: 10
      })
    ]);

    // Get moderator details for action stats
    const moderatorIds = actionsByModerator.map(action => action.moderatorId).filter(Boolean);
    const moderators = await prisma.user.findMany({
      where: { id: { in: moderatorIds } },
      select: {
        id: true,
        username: true,
        name: true,
        image: true
      }
    });

    const moderatorMap = new Map(moderators.map(mod => [mod.id, mod]));
    const actionsByModeratorWithDetails = actionsByModerator.map(action => ({
      ...action,
      moderator: moderatorMap.get(action.moderatorId)
    }));

    // Get response time statistics
    const responseTimeStats = await prisma.$queryRaw`
      SELECT 
        AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 3600) as avg_response_hours,
        MIN(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 3600) as min_response_hours,
        MAX(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 3600) as max_response_hours
      FROM "Report"
      WHERE "status" IN ('resolved', 'dismissed')
        AND "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
        AND "updatedAt" IS NOT NULL
    `;

    // Get trending issues (most reported content)
    const trendingIssues = await prisma.report.groupBy({
      by: ['targetId', 'type'],
      where: {
        ...dateFilter,
        status: { in: ['pending', 'investigating'] }
      },
      _count: { targetId: true },
      orderBy: { _count: { targetId: 'desc' } },
      take: 10
    });

    // Get user behavior statistics
    const [bannedUsers, suspendedUsers, contentRemoved] = await Promise.all([
      prisma.user.count({
        where: {
          isBanned: true,
          bannedAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      prisma.user.count({
        where: {
          isSuspended: true,
          bannedAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      prisma.moderationAction.count({
        where: {
          type: 'content_removal',
          ...dateFilter
        }
      })
    ]);

    // Calculate resolution rate
    const totalReports = reportStats;
    const resolvedReports = reportsByStatus.find(r => r.status === 'resolved')?._count.status || 0;
    const dismissedReports = reportsByStatus.find(r => r.status === 'dismissed')?._count.status || 0;
    const resolutionRate = totalReports > 0 ? ((resolvedReports + dismissedReports) / totalReports) * 100 : 0;

    // Get daily activity for charts
    const dailyActivity = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as reports
      FROM "Report"
      WHERE "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY DATE("createdAt")
      ORDER BY date
    `;

    const dailyActions = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as actions
      FROM "ModerationAction"
      WHERE "createdAt" >= ${startDate}
        AND "createdAt" <= ${endDate}
      GROUP BY DATE("createdAt")
      ORDER BY date
    `;

    // Get moderator performance (if specific moderator requested)
    let moderatorPerformance = null;
    if (validatedQuery.moderatorId) {
      const moderatorReports = await prisma.report.count({
        where: {
          moderatorId: validatedQuery.moderatorId,
          ...dateFilter
        }
      });

      const moderatorActions = await prisma.moderationAction.count({
        where: {
          moderatorId: validatedQuery.moderatorId,
          ...dateFilter
        }
      });

      const moderatorResolved = await prisma.report.count({
        where: {
          moderatorId: validatedQuery.moderatorId,
          status: 'resolved',
          ...dateFilter
        }
      });

      const moderatorAvgResponseTime = await prisma.$queryRaw`
        SELECT 
          AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 3600) as avg_response_hours
        FROM "Report"
        WHERE "moderatorId" = ${validatedQuery.moderatorId}
          AND "status" IN ('resolved', 'dismissed')
          AND "createdAt" >= ${startDate}
          AND "createdAt" <= ${endDate}
          AND "updatedAt" IS NOT NULL
      `;

      moderatorPerformance = {
        reportsHandled: moderatorReports,
        actionsPerformed: moderatorActions,
        reportsResolved: moderatorResolved,
        resolutionRate: moderatorReports > 0 ? (moderatorResolved / moderatorReports) * 100 : 0,
        avgResponseTime: moderatorAvgResponseTime[0]?.avg_response_hours || 0
      };
    }

    const stats = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        type: validatedQuery.period
      },
      reports: {
        total: totalReports,
        byStatus: reportsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        byReason: reportsByReason.reduce((acc, item) => {
          acc[item.reason] = item._count.reason;
          return acc;
        }, {} as Record<string, number>),
        byType: reportsByType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {} as Record<string, number>),
        resolutionRate: Math.round(resolutionRate * 100) / 100
      },
      actions: {
        total: actionStats,
        byType: actionsByType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {} as Record<string, number>),
        byModerator: actionsByModeratorWithDetails
      },
      performance: {
        avgResponseTime: responseTimeStats[0]?.avg_response_hours || 0,
        minResponseTime: responseTimeStats[0]?.min_response_hours || 0,
        maxResponseTime: responseTimeStats[0]?.max_response_hours || 0
      },
      userActions: {
        bannedUsers,
        suspendedUsers,
        contentRemoved
      },
      trending: {
        issues: trendingIssues
      },
      charts: {
        dailyReports: dailyActivity,
        dailyActions: dailyActions
      },
      moderatorPerformance
    };

    return res.status(200).json({ stats });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    throw error;
  }
}