import { NextRequest } from 'next/server';
import { notificationStream, createSSEResponse } from '@/lib/notificationStream';

// Asegurar que esta ruta se ejecute en el runtime de Node.js, necesario para SSE
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response('userId query parameter is required', { status: 400 });
    }

    const stream = notificationStream.createStream(userId);
    return createSSEResponse(stream);
  } catch (error) {
    console.error('Failed to establish notification stream:', error);
    return new Response('Failed to establish stream', { status: 500 });
  }
}
