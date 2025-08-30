import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { gamificationEventBus, GamificationEvents } from '@/lib/eventBus';
import { prisma } from '@/lib/prisma';

// POST /api/gamification/events - Emitir eventos de gamificación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventType, data, userId } = body;

    // Validar que el eventType es válido
    const validEventTypes: (keyof GamificationEvents)[] = [
      'post_created',
      'user_followed',
      'user_gained_follower',
      'level_reached',
      'comment_created',
      'like_given',
      'profile_updated',
      'login_streak'
    ];

    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: `Tipo de evento no válido. Tipos válidos: ${validEventTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Verificar que el usuario puede emitir eventos para este userId
    const targetUserId = userId || session.user.id;
    
    if (targetUserId !== session.user.id) {
      // Solo admins pueden emitir eventos para otros usuarios
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      });

      if (user?.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'No tienes permisos para emitir eventos para otros usuarios' },
          { status: 403 }
        );
      }
    }

    // Verificar que el usuario objetivo existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, username: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Validar datos específicos según el tipo de evento
    const eventData: any = { userId: targetUserId, ...data };

    switch (eventType) {
      case 'post_created':
        if (!data.postId) {
          return NextResponse.json(
            { error: 'postId es requerido para el evento post_created' },
            { status: 400 }
          );
        }
        break;

      case 'user_followed':
        if (!data.followedUserId) {
          return NextResponse.json(
            { error: 'followedUserId es requerido para el evento user_followed' },
            { status: 400 }
          );
        }
        break;

      case 'user_gained_follower':
        if (!data.followerId) {
          return NextResponse.json(
            { error: 'followerId es requerido para el evento user_gained_follower' },
            { status: 400 }
          );
        }
        break;

      case 'level_reached':
        if (!data.level || typeof data.level !== 'number') {
          return NextResponse.json(
            { error: 'level (número) es requerido para el evento level_reached' },
            { status: 400 }
          );
        }
        break;

      case 'comment_created':
        if (!data.commentId || !data.postId) {
          return NextResponse.json(
            { error: 'commentId y postId son requeridos para el evento comment_created' },
            { status: 400 }
          );
        }
        break;

      case 'like_given':
        if (!data.postId) {
          return NextResponse.json(
            { error: 'postId es requerido para el evento like_given' },
            { status: 400 }
          );
        }
        break;

      case 'login_streak':
        if (!data.streakDays || typeof data.streakDays !== 'number') {
          return NextResponse.json(
            { error: 'streakDays (número) es requerido para el evento login_streak' },
            { status: 400 }
          );
        }
        break;
    }

    // Emitir el evento
    try {
      gamificationEventBus.emitGamificationEvent(eventType as keyof import('@/lib/eventBus').GamificationEvents, eventData);
      
      // Registrar el evento emitido para auditoría
      await prisma.activity.create({
        data: {
          userId: targetUserId,
          type: 'EVENT_EMITTED',
          description: `Evento ${eventType} emitido`,
          metadata: {
            eventType,
            eventData,
            emittedBy: session.user.id,
            timestamp: new Date().toISOString()
          }
        }
      });

      console.log(`[GamificationAPI] Event emitted: ${eventType} for user ${targetUserId}`);

      return NextResponse.json({
        success: true,
        message: `Evento ${eventType} emitido exitosamente`,
        eventType,
        userId: targetUserId,
        timestamp: new Date().toISOString()
      });

    } catch (eventError) {
      console.error('Error emitting gamification event:', eventError);
      return NextResponse.json(
        { error: 'Error al emitir el evento' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in gamification events API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/gamification/events - Obtener eventos recientes (solo admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos de admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventType = searchParams.get('eventType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      type: 'EVENT_EMITTED'
    };

    if (userId) {
      where.userId = userId;
    }

    if (eventType) {
      where.metadata = {
        path: ['eventType'],
        equals: eventType
      };
    }

    // Obtener eventos
    const events = await prisma.activity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    const totalEvents = await prisma.activity.count({ where });

    // Obtener estadísticas de eventos
    const eventStats = await prisma.activity.groupBy({
      by: ['metadata'],
      where: {
        type: 'EVENT_EMITTED',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
        }
      },
      _count: true
    });

    // Procesar estadísticas por tipo de evento
    const eventTypeStats: Record<string, number> = {};
    eventStats.forEach(stat => {
      const metadata = stat.metadata as any;
      if (metadata?.eventType) {
        eventTypeStats[metadata.eventType] = (eventTypeStats[metadata.eventType] || 0) + stat._count;
      }
    });

    return NextResponse.json({
      events: events.map(event => ({
        id: event.id,
        userId: event.userId,
        user: event.user,
        description: event.description,
        metadata: event.metadata,
        createdAt: event.createdAt
      })),
      pagination: {
        page,
        limit,
        total: totalEvents,
        totalPages: Math.ceil(totalEvents / limit),
        hasNext: page * limit < totalEvents,
        hasPrev: page > 1
      },
      stats: {
        totalEventsLast24h: Object.values(eventTypeStats).reduce((sum, count) => sum + count, 0),
        eventTypeDistribution: eventTypeStats,
        availableEventTypes: [
          'post_created',
          'user_followed',
          'user_gained_follower',
          'level_reached',
          'comment_created',
          'like_given',
          'profile_updated',
          'login_streak'
        ]
      }
    });

  } catch (error) {
    console.error('Error fetching gamification events:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}