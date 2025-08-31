import { NextRequest } from 'next/server';
import { notificationStream, createSSEResponse } from '@/lib/notificationStream';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response('userId query parameter is required', { status: 400 });
  }

  const stream = notificationStream.createStream(userId);
  return createSSEResponse(stream);
}
