import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addConnection, removeConnection } from '@/lib/notificationStream';

// Marcar como ruta dinámica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
        addConnection(userId, controller);

        // Enviar evento inicial de conexión
        const data = JSON.stringify({ type: 'connected', message: 'Connected to notifications stream' });
        controller.enqueue(`data: ${data}\n\n`);

        // Configurar heartbeat cada 30 segundos
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
          } catch (error) {
            clearInterval(heartbeat);
            removeConnection(userId);
          }
        }, 30000);

        // Limpiar cuando se cierre la conexión
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
          removeConnection(userId);
          try {
            controller.close();
          } catch (error) {
            // Conexión ya cerrada
          }
        });
      },
      cancel() {
        removeConnection(userId);
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

// sendNotificationToUser y broadcastNotification están disponibles en
// '@/lib/notificationStream'