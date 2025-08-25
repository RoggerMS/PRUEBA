import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Mapa para mantener las conexiones activas
const connections = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user.id;

    // Crear un ReadableStream para Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // Almacenar la conexión
        connections.set(userId, controller);

        // Enviar evento inicial de conexión
        const data = JSON.stringify({ type: 'connected', message: 'Connected to notifications stream' });
        controller.enqueue(`data: ${data}\n\n`);

        // Configurar heartbeat cada 30 segundos
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
          } catch (error) {
            clearInterval(heartbeat);
            connections.delete(userId);
          }
        }, 30000);

        // Limpiar cuando se cierre la conexión
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
          connections.delete(userId);
          try {
            controller.close();
          } catch (error) {
            // Conexión ya cerrada
          }
        });
      },
      cancel() {
        connections.delete(userId);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });
  } catch (error) {
    console.error('Error setting up SSE stream:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Función helper para enviar notificaciones a usuarios específicos
export function sendNotificationToUser(userId: string, notification: any) {
  const controller = connections.get(userId);
  if (controller) {
    try {
      const data = JSON.stringify({
        type: 'notification',
        data: notification
      });
      controller.enqueue(`data: ${data}\n\n`);
    } catch (error) {
      console.error('Error sending notification to user:', error);
      connections.delete(userId);
    }
  }
}

// Función helper para broadcast a todos los usuarios conectados
export function broadcastNotification(notification: any) {
  connections.forEach((controller, userId) => {
    try {
      const data = JSON.stringify({
        type: 'broadcast',
        data: notification
      });
      controller.enqueue(`data: ${data}\n\n`);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      connections.delete(userId);
    }
  });
}