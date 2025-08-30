import { NextRequest } from 'next/server';
import { WebSocketServer } from '@/lib/websocket-server';

// WebSocket endpoint for real-time notifications
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response('Missing userId parameter', { status: 400 });
  }

  // Check if the request is a WebSocket upgrade request
  const upgrade = request.headers.get('upgrade');
  if (upgrade !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 426 });
  }

  try {
    // Get the WebSocket server instance
    const wsServer = WebSocketServer.getInstance();
    
    // Handle the WebSocket upgrade
    const response = await wsServer.handleUpgrade(request, userId);
    
    return response;
  } catch (error) {
    console.error('WebSocket upgrade error:', error);
    return new Response('WebSocket upgrade failed', { status: 500 });
  }
}