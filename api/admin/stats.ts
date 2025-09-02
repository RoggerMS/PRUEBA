import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const statsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).optional().default('week'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication and admin privileges
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has admin or moderator role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || !['admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Validate query parameters
    const { period, startDate, endDate } = statsQuerySchema.parse(req.query);

    // Calculate date range
    const now = new Date();
    let dateFrom: Date;
    let dateTo = new Date();

    if (startDate && endDate) {
      dateFrom = new Date(startDate);
      dateTo = new Date(endDate);
    } else {
      switch (period) {
        case 'day':
          dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    }

    // Get user statistics
    const [totalUsers, activeUsers, bannedUsers, suspendedUsers, newUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastActiveAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Active in last 30 days
          }
        }
      }),
      prisma.user.count({
        where: { status: 'banned' }
      }),
      prisma.user.count({
        where: { status: 'suspended' }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: dateFrom,
            lte: dateTo
          }
        }
      })
    ]);

    // Get content statistics
    const [totalPosts, totalComments, totalMessages, totalConversations, removedContent] = await Promise.all([
      prisma.post.count(),
      prisma.comment.count(),
      prisma.message.count(),
      prisma.conversation.count(),
      prisma.post.count({
        where: { status: 'removed' }
      }) + await prisma.comment.count({
        where: { status: 'removed' }
      })
    ]);

    // Get moderation statistics
    const [pendingReports, totalReports, activeActions, resolvedReports] = await Promise.all([
      prisma.report.count({
        where: { status: 'pending' }
      }),
      prisma.report.count(),
      prisma.moderationAction.count({
        where: { 
          status: 'active',
          expiresAt: {
            gt: now
          }
        }
      }),
      prisma.report.count({
        where: {
          status: 'resolved',
          updatedAt: {
            gte: dateFrom,
            lte: dateTo
          }
        }
      })
    ]);

    // Calculate average response time for resolved reports
    const resolvedReportsWithTime = await prisma.report.findMany({
      where: {
        status: 'resolved',
        updatedAt: {
          gte: dateFrom,
          lte: dateTo
        }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    });

    const avgResponseTime = resolvedReportsWithTime.length > 0
      ? resolvedReportsWithTime.reduce((acc, report) => {
          const responseTime = (report.updatedAt.getTime() - report.createdAt.getTime()) / (1000 * 60 * 60); // hours
          return acc + responseTime;
        }, 0) / resolvedReportsWithTime.length
      : 0;

    // Get daily activity for charts (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyActivity = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const [users, posts, reports] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        }),
        prisma.post.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        }),
        prisma.report.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        })
      ]);
      
      dailyActivity.push({
        date: date.toISOString().split('T')[0],
        users,
        posts,
        reports
      });
    }

    // Get trending issues (most common report reasons)
    const trendingIssues = await prisma.report.groupBy({
      by: ['reason'],
      where: {
        createdAt: {
          gte: dateFrom,
          lte: dateTo
        }
      },
      _count: {
        reason: true
      },
      orderBy: {
        _count: {
          reason: 'desc'
        }
      },
      take: 5
    });

    // Get top moderators by actions
    const topModerators = await prisma.moderationAction.groupBy({
      by: ['moderatorId'],
      where: {
        createdAt: {
          gte: dateFrom,
          lte: dateTo
        }
      },
      _count: {
        moderatorId: true
      },
      orderBy: {
        _count: {
          moderatorId: 'desc'
        }
      },
      take: 5
    });

    // Get moderator details
    const moderatorIds = topModerators.map(m => m.moderatorId);
    const moderators = await prisma.user.findMany({
      where: {
        id: {
          in: moderatorIds
        }
      },
      select: {
        id: true,
        name: true,
        username: true
      }
    });

    const topModeratorsWithDetails = topModerators.map(mod => {
      const moderator = moderators.find(m => m.id === mod.moderatorId);
      return {
        moderator: moderator || { id: mod.moderatorId, name: 'Unknown', username: 'unknown' },
        actions: mod._count.moderatorId
      };
    });

    // System health metrics (simulated)
    const systemHealth = {
      uptime: 99.8,
      activeConnections: Math.floor(Math.random() * 2000) + 500,
      storageUsed: Math.floor(Math.random() * 30) + 70,
      apiCalls: Math.floor(Math.random() * 100000) + 200000,
      responseTime: Math.floor(Math.random() * 100) + 50,
      errorRate: Math.random() * 0.5
    };

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        suspended: suspendedUsers,
        newToday: newUsers
      },
      content: {
        posts: totalPosts,
        comments: totalComments,
        messages: totalMessages,
        conversations: totalConversations,
        removedContent
      },
      moderation: {
        pendingReports,
        totalReports,
        activeActions,
        resolvedToday: resolvedReports,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10
      },
      system: systemHealth,
      charts: {
        dailyActivity,
        trendingIssues: trendingIssues.map(issue => ({
          reason: issue.reason,
          count: issue._count.reason
        })),
        topModerators: topModeratorsWithDetails
      },
      period,
      dateRange: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString()
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}