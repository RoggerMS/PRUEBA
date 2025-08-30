import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { gamificationEventBus } from '@/lib/eventBus';

// POST /api/test/gamification - Endpoint para probar eventos de gamificación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { eventType, data } = await request.json();

    if (!eventType) {
      return NextResponse.json(
        { error: 'Tipo de evento requerido' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Emitir diferentes tipos de eventos de prueba
    switch (eventType) {
      case 'post_created':
        gamificationEventBus.emitGamificationEvent('post_created', {
          userId,
          postId: data?.postId || 'test-post-' + Date.now()
        });
        break;

      case 'user_followed':
        gamificationEventBus.emitGamificationEvent('user_followed', {
          userId,
          followedUserId: data?.followedUserId || 'test-user-' + Date.now()
        });
        break;

      case 'user_gained_follower':
        gamificationEventBus.emitGamificationEvent('user_gained_follower', {
          userId,
          followerId: data?.followerId || 'test-follower-' + Date.now()
        });
        break;

      case 'comment_created':
        gamificationEventBus.emitGamificationEvent('comment_created', {
          userId,
          commentId: data?.commentId || 'test-comment-' + Date.now(),
          postId: data?.postId || 'test-post-' + Date.now()
        });
        break;

      case 'like_given':
        gamificationEventBus.emitGamificationEvent('like_given', {
          userId,
          postId: data?.postId || 'test-post-' + Date.now()
        });
        break;

      case 'profile_updated':
        gamificationEventBus.emitGamificationEvent('profile_updated', {
          userId
        });
        break;

      case 'login_streak':
        gamificationEventBus.emitGamificationEvent('login_streak', {
          userId,
          streakDays: data?.streakDays || 1
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo de evento no válido' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Evento ${eventType} emitido correctamente`,
      userId,
      eventType,
      data
    });

  } catch (error) {
    console.error('Error emitiendo evento de gamificación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/test/gamification - Obtener información de prueba
export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de prueba de gamificación',
    availableEvents: [
      'post_created',
      'user_followed',
      'user_gained_follower',
      'comment_created',
      'like_given',
      'profile_updated',
      'login_streak'
    ],
    usage: {
      method: 'POST',
      body: {
        eventType: 'string (required)',
        data: 'object (optional)'
      }
    }
  });
}