import { NextRequest } from 'next/server';
import { addConnection, removeConnection } from '@/lib/notificationStream';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response('userId query parameter is required', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      addConnection(userId, controller);
      controller.enqueue('event: connected\ndata: ok\n\n');
    },
    cancel() {
      removeConnection(userId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
