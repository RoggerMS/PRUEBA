// Utility helpers to manage server-sent event connections for notifications
// This module keeps a registry of active connections and exposes
// functions to send notifications to specific users or broadcast to all.

const connections = new Map<string, ReadableStreamDefaultController>();

/**
 * Store a new connection for the given user
 */
export function addConnection(
  userId: string,
  controller: ReadableStreamDefaultController
): void {
  connections.set(userId, controller);
}

/**
 * Remove a connection when the stream ends
 */
export function removeConnection(userId: string): void {
  connections.delete(userId);
}

/**
 * Send a notification event to a specific user
 */
export function sendNotificationToUser(
  userId: string,
  notification: unknown
): void {
  const controller = connections.get(userId);
  if (!controller) return;

  try {
    const data = JSON.stringify({ type: 'notification', data: notification });
    controller.enqueue(`data: ${data}\n\n`);
  } catch (error) {
    console.error('Error sending notification to user:', error);
    connections.delete(userId);
  }
}

/**
 * Broadcast a notification event to all connected users
 */
export function broadcastNotification(notification: unknown): void {
  connections.forEach((controller, userId) => {
    try {
      const data = JSON.stringify({ type: 'broadcast', data: notification });
      controller.enqueue(`data: ${data}\n\n`);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      connections.delete(userId);
    }
  });
}

