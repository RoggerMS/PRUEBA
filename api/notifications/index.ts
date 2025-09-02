import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const createNotificationSchema = z.object({
  type: z.enum(['LIKE', 'COMMENT', 'FOLLOW', 'MENTION', 'MESSAGE', 'SYSTEM', 'ACHIEVEMENT']),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  recipientId: z.string(),
  relatedId: z.string().optional(),
  relatedType: z.enum(['POST', 'COMMENT', 'USER', 'MESSAGE']).optional(),
  actionUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional()
});

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  markAll: z.boolean().optional()
});

const getNotificationsSchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  type: z.enum(['LIKE', 'COMMENT', 'FOLLOW', 'MENTION', 'MESSAGE', 'SYSTEM', 'ACHIEVEMENT']).optional(),
  unreadOnly: z.string().transform(val => val === 'true').optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getNotifications(req, res, session.user.id);
      case 'POST':
        return await createNotification(req, res, session.user.id);
      case 'PUT':
        return await markNotificationsAsRead(req, res, session.user.id);
      case 'DELETE':
        return await deleteNotifications(req, res, session.user.id);
      default:
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Notifications API error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Get notifications for user
async function getNotifications(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const validation = getNotificationsSchema.safeParse(req.query);
  
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Parámetros inválidos',
      details: validation.error.errors
    });
  }

  const { page = 1, limit = 20, type, unreadOnly } = validation.data;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    recipientId: userId
  };

  if (type) {
    where.type = type;
  }

  if (unreadOnly) {
    where.isRead = false;
  }

  try {
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              isVerified: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          recipientId: userId,
          isRead: false
        }
      })
    ]);

    // Format notifications
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      actionUrl: notification.actionUrl,
      relatedId: notification.relatedId,
      relatedType: notification.relatedType,
      metadata: notification.metadata ? JSON.parse(notification.metadata) : null,
      sender: notification.sender
    }));

    return res.status(200).json({
      notifications: formattedNotifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
}

// Create notification (admin/system use)
async function createNotification(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const validation = createNotificationSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Datos inválidos',
      details: validation.error.errors
    });
  }

  const { type, title, message, recipientId, relatedId, relatedType, actionUrl, metadata } = validation.data;

  // Check if user has permission to create notifications (admin only for now)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'No tienes permisos para crear notificaciones' });
  }

  try {
    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true }
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Usuario destinatario no encontrado' });
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        recipientId,
        senderId: userId,
        relatedId,
        relatedType,
        actionUrl,
        metadata: metadata ? JSON.stringify(metadata) : null
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            isVerified: true
          }
        }
      }
    });

    // TODO: Send real-time notification via WebSocket
    // await sendRealtimeNotification(recipientId, notification);

    return res.status(201).json({
      message: 'Notificación creada exitosamente',
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        actionUrl: notification.actionUrl,
        relatedId: notification.relatedId,
        relatedType: notification.relatedType,
        metadata: notification.metadata ? JSON.parse(notification.metadata) : null,
        sender: notification.sender
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ error: 'Error al crear notificación' });
  }
}

// Mark notifications as read
async function markNotificationsAsRead(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const validation = markAsReadSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Datos inválidos',
      details: validation.error.errors
    });
  }

  const { notificationIds, markAll } = validation.data;

  try {
    let updateResult;

    if (markAll) {
      // Mark all notifications as read for this user
      updateResult = await prisma.notification.updateMany({
        where: {
          recipientId: userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      updateResult = await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          recipientId: userId, // Ensure user can only mark their own notifications
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });
    } else {
      return res.status(400).json({ error: 'Debe especificar notificationIds o markAll' });
    }

    // Get updated unread count
    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false
      }
    });

    return res.status(200).json({
      message: `${updateResult.count} notificaciones marcadas como leídas`,
      updatedCount: updateResult.count,
      unreadCount
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({ error: 'Error al marcar notificaciones como leídas' });
  }
}

// Delete notifications
async function deleteNotifications(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
    return res.status(400).json({ error: 'IDs de notificaciones requeridos' });
  }

  try {
    const deleteResult = await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        recipientId: userId // Ensure user can only delete their own notifications
      }
    });

    return res.status(200).json({
      message: `${deleteResult.count} notificaciones eliminadas`,
      deletedCount: deleteResult.count
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return res.status(500).json({ error: 'Error al eliminar notificaciones' });
  }
}

// Helper function to create notifications (to be used by other parts of the app)
export async function createNotificationHelper({
  type,
  title,
  message,
  recipientId,
  senderId,
  relatedId,
  relatedType,
  actionUrl,
  metadata
}: {
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION' | 'MESSAGE' | 'SYSTEM' | 'ACHIEVEMENT';
  title: string;
  message: string;
  recipientId: string;
  senderId?: string;
  relatedId?: string;
  relatedType?: 'POST' | 'COMMENT' | 'USER' | 'MESSAGE';
  actionUrl?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        recipientId,
        senderId,
        relatedId,
        relatedType,
        actionUrl,
        metadata: metadata ? JSON.stringify(metadata) : null
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            isVerified: true
          }
        }
      }
    });

    // TODO: Send real-time notification via WebSocket
    // await sendRealtimeNotification(recipientId, notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}