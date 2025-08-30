import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para crear notificaciones
const CreateNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['LIKE', 'COMMENT', 'FOLLOW', 'MENTION', 'ACHIEVEMENT_UNLOCKED', 'LEVEL_UP', 'CROLAR_EARNED', 'NOTE_RATED', 'ANSWER_ACCEPTED', 'MARKETPLACE_SALE', 'SYSTEM']),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  metadata: z.record(z.any()).optional(),
  actionUrl: z.string().url().optional()
});

// Schema de validación para parámetros de consulta
const NotificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  type: z.string().optional(),
  unreadOnly: z.coerce.boolean().default(false)
});

// GET /api/notifications - Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      type: searchParams.get('type'),
      unreadOnly: searchParams.get('unreadOnly') === 'true'
    };

    const validatedParams = NotificationQuerySchema.parse(queryParams);
    const { page, limit, type, unreadOnly } = validatedParams;

    // Construir filtros
    const where: any = {
      userId: session.user.id
    };

    if (type) {
      where.type = type;
    }

    if (unreadOnly) {
      where.readAt = null;
    }

    // Obtener notificaciones
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          readAt: null
        }
      })
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      unreadCount
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Crear nueva notificación (solo para admin o sistema)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar permisos (solo admin puede crear notificaciones manuales)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = CreateNotificationSchema.parse(body);

    const notification = await prisma.notification.create({
      data: {
        ...validatedData,
        metadata: validatedData.metadata || {}
      }
    });

    // Aquí se podría integrar con WebSocket para notificación en tiempo real
    // await notifyUserRealTime(validatedData.userId, notification);

    return NextResponse.json(notification, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Marcar notificaciones como leídas
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // Marcar todas las notificaciones como leídas
      const result = await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          readAt: null
        },
        data: {
          readAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        updatedCount: result.count
      });
    }

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere un array de IDs de notificaciones' },
        { status: 400 }
      );
    }

    // Marcar notificaciones específicas como leídas
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count
    });

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Eliminar notificaciones
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationIds = searchParams.get('ids')?.split(',') || [];
    const deleteAll = searchParams.get('all') === 'true';

    if (deleteAll) {
      // Eliminar todas las notificaciones del usuario
      const result = await prisma.notification.deleteMany({
        where: {
          userId: session.user.id
        }
      });

      return NextResponse.json({
        success: true,
        deletedCount: result.count
      });
    }

    if (notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'Se requieren IDs de notificaciones para eliminar' },
        { status: 400 }
      );
    }

    // Eliminar notificaciones específicas
    const result = await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count
    });

  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para crear notificaciones del sistema
export async function createSystemNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  metadata?: Record<string, any>,
  actionUrl?: string
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        message,
        metadata: metadata || {},
        actionUrl
      }
    });

    // Aquí se integraría con WebSocket para notificación en tiempo real
    // await notifyUserRealTime(userId, notification);

    return notification;
  } catch (error) {
    console.error('Error creating system notification:', error);
    return null;
  }
}