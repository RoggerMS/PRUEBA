import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const getUsersQuerySchema = z.object({
  page: z.string().transform(Number).optional().default(1),
  limit: z.string().transform(Number).optional().default(20),
  search: z.string().optional(),
  status: z.enum(['active', 'banned', 'suspended', 'pending']).optional(),
  role: z.enum(['user', 'moderator', 'admin']).optional(),
  sortBy: z.enum(['createdAt', 'lastActiveAt', 'name', 'email']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

const updateUserSchema = z.object({
  userId: z.string(),
  status: z.enum(['active', 'banned', 'suspended']).optional(),
  role: z.enum(['user', 'moderator', 'admin']).optional(),
  reason: z.string().optional(),
  duration: z.number().optional() // Duration in hours for temporary actions
});

const bulkActionSchema = z.object({
  userIds: z.array(z.string()),
  action: z.enum(['ban', 'suspend', 'activate', 'delete']),
  reason: z.string().optional(),
  duration: z.number().optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check authentication and admin privileges
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has admin or moderator role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!currentUser || !['admin', 'moderator'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    switch (req.method) {
      case 'GET':
        return await getUsers(req, res);
      case 'PUT':
        return await updateUser(req, res, currentUser.role);
      case 'POST':
        return await bulkAction(req, res, currentUser.role);
      case 'DELETE':
        return await deleteUser(req, res, currentUser.role);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in admin users API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  const {
    page,
    limit,
    search,
    status,
    role,
    sortBy,
    sortOrder
  } = getUsersQuerySchema.parse(req.query);

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (status) {
    where.status = status;
  }

  if (role) {
    where.role = role;
  }

  // Get users with pagination
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        verified: true,
        createdAt: true,
        lastActiveAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            followers: true,
            following: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit
    }),
    prisma.user.count({ where })
  ]);

  // Get recent moderation actions for these users
  const userIds = users.map(user => user.id);
  const recentActions = await prisma.moderationAction.findMany({
    where: {
      targetId: { in: userIds },
      targetType: 'user'
    },
    select: {
      id: true,
      targetId: true,
      type: true,
      reason: true,
      createdAt: true,
      expiresAt: true,
      status: true,
      moderator: {
        select: {
          name: true,
          username: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Attach recent actions to users
  const usersWithActions = users.map(user => ({
    ...user,
    recentActions: recentActions.filter(action => action.targetId === user.id).slice(0, 3)
  }));

  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    users: usersWithActions,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}

async function updateUser(
  req: NextApiRequest,
  res: NextApiResponse,
  currentUserRole: string
) {
  const { userId, status, role, reason, duration } = updateUserSchema.parse(req.body);

  // Get target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, status: true, name: true, email: true }
  });

  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check permissions
  if (currentUserRole === 'moderator') {
    // Moderators can't modify admins or other moderators
    if (['admin', 'moderator'].includes(targetUser.role)) {
      return res.status(403).json({ error: 'Cannot modify admin or moderator accounts' });
    }
    // Moderators can't assign admin or moderator roles
    if (role && ['admin', 'moderator'].includes(role)) {
      return res.status(403).json({ error: 'Cannot assign admin or moderator roles' });
    }
  }

  const updates: any = {};
  if (status) updates.status = status;
  if (role) updates.role = role;

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      status: true
    }
  });

  // Create moderation action if status changed
  if (status && status !== targetUser.status) {
    const actionType = status === 'banned' ? 'ban' : 
                     status === 'suspended' ? 'suspend' : 'activate';
    
    const expiresAt = duration ? new Date(Date.now() + duration * 60 * 60 * 1000) : null;

    await prisma.moderationAction.create({
      data: {
        type: actionType,
        targetType: 'user',
        targetId: userId,
        moderatorId: req.session?.user?.id || '',
        reason: reason || `User ${actionType}ed by admin`,
        status: 'active',
        expiresAt
      }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'moderation',
        title: `Account ${actionType}ed`,
        content: reason || `Your account has been ${actionType}ed`,
        metadata: {
          action: actionType,
          reason,
          expiresAt: expiresAt?.toISOString()
        }
      }
    });
  }

  res.status(200).json({
    message: 'User updated successfully',
    user: updatedUser
  });
}

async function bulkAction(
  req: NextApiRequest,
  res: NextApiResponse,
  currentUserRole: string
) {
  const { userIds, action, reason, duration } = bulkActionSchema.parse(req.body);

  // Get target users
  const targetUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, role: true, status: true, name: true }
  });

  // Check permissions for each user
  if (currentUserRole === 'moderator') {
    const restrictedUsers = targetUsers.filter(user => 
      ['admin', 'moderator'].includes(user.role)
    );
    
    if (restrictedUsers.length > 0) {
      return res.status(403).json({ 
        error: 'Cannot perform bulk actions on admin or moderator accounts' 
      });
    }
  }

  const results = [];
  const expiresAt = duration ? new Date(Date.now() + duration * 60 * 60 * 1000) : null;

  for (const user of targetUsers) {
    try {
      let updates: any = {};
      let actionType = action;

      switch (action) {
        case 'ban':
          updates.status = 'banned';
          break;
        case 'suspend':
          updates.status = 'suspended';
          break;
        case 'activate':
          updates.status = 'active';
          actionType = 'activate';
          break;
        case 'delete':
          // Soft delete - mark as deleted but keep data
          updates.status = 'deleted';
          actionType = 'delete';
          break;
      }

      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: updates
      });

      // Create moderation action
      await prisma.moderationAction.create({
        data: {
          type: actionType,
          targetType: 'user',
          targetId: user.id,
          moderatorId: req.session?.user?.id || '',
          reason: reason || `Bulk ${action} action`,
          status: 'active',
          expiresAt
        }
      });

      // Create notification
      if (action !== 'delete') {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'moderation',
            title: `Account ${action}ed`,
            content: reason || `Your account has been ${action}ed`,
            metadata: {
              action,
              reason,
              expiresAt: expiresAt?.toISOString()
            }
          }
        });
      }

      results.push({
        userId: user.id,
        success: true,
        message: `User ${action}ed successfully`
      });
    } catch (error) {
      results.push({
        userId: user.id,
        success: false,
        message: `Failed to ${action} user: ${error.message}`
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  res.status(200).json({
    message: `Bulk action completed: ${successCount} successful, ${failureCount} failed`,
    results,
    summary: {
      total: userIds.length,
      successful: successCount,
      failed: failureCount
    }
  });
}

async function deleteUser(
  req: NextApiRequest,
  res: NextApiResponse,
  currentUserRole: string
) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Get target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, name: true }
  });

  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check permissions
  if (currentUserRole === 'moderator' && ['admin', 'moderator'].includes(targetUser.role)) {
    return res.status(403).json({ error: 'Cannot delete admin or moderator accounts' });
  }

  // Soft delete - mark as deleted but keep data for audit purposes
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: 'deleted',
      email: `deleted_${Date.now()}_${targetUser.id}@deleted.local`,
      username: `deleted_${Date.now()}_${targetUser.id}`
    }
  });

  // Create moderation action
  await prisma.moderationAction.create({
    data: {
      type: 'delete',
      targetType: 'user',
      targetId: userId,
      moderatorId: req.session?.user?.id || '',
      reason: 'User account deleted by admin',
      status: 'active'
    }
  });

  res.status(200).json({
    message: 'User deleted successfully'
  });
}