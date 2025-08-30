import { prisma } from './prisma';

interface ConnectedUser {
  userId: string;
  ws: any;
  lastSeen: Date;
}

interface NotificationData {
  type: 'badge_earned' | 'achievement_unlocked' | 'level_up' | 'streak_milestone' | 'xp_gained';
  userId: string;
  title: string;
  message: string;
  data?: any;
}

export class WebSocketServer {
  private static instance: WebSocketServer;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startHeartbeat();
  }

  public static getInstance(): WebSocketServer {
    if (!WebSocketServer.instance) {
      WebSocketServer.instance = new WebSocketServer();
    }
    return WebSocketServer.instance;
  }

  // Handle WebSocket upgrade for Next.js
  public async handleUpgrade(request: Request, userId: string): Promise<Response> {
    // For now, return a simple response indicating WebSocket support
    // In a production environment, you would implement proper WebSocket handling
    return new Response('WebSocket endpoint - use a WebSocket client to connect', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  // Add a user connection
  public addConnection(userId: string, ws: any) {
    this.connectedUsers.set(userId, {
      userId,
      ws,
      lastSeen: new Date(),
    });
    console.log(`User ${userId} connected. Total connections: ${this.connectedUsers.size}`);
  }

  // Remove a user connection
  public removeConnection(userId: string) {
    this.connectedUsers.delete(userId);
    console.log(`User ${userId} disconnected. Total connections: ${this.connectedUsers.size}`);
  }

  // Send notification to a specific user
  public async sendNotification(notification: NotificationData) {
    try {
      // Save notification to database
      const savedNotification = await prisma.notification.create({
        data: {
          userId: notification.userId,
          type: notification.type.toUpperCase(),
          title: notification.title,
          message: notification.message,
          data: notification.data || {},
        },
      });

      // Send real-time notification if user is connected
      const user = this.connectedUsers.get(notification.userId);
      if (user && user.ws) {
        try {
          user.ws.send(JSON.stringify({
            type: 'notification',
            notification: savedNotification,
          }));
        } catch (error) {
          console.error('Error sending WebSocket message:', error);
          // Remove dead connection
          this.removeConnection(notification.userId);
        }
      }

      console.log(`Notification sent to user ${notification.userId}: ${notification.title}`);
      return savedNotification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Broadcast notification to all connected users
  public async broadcastNotification(notification: Omit<NotificationData, 'userId'>) {
    const promises = Array.from(this.connectedUsers.keys()).map(userId =>
      this.sendNotification({ ...notification, userId })
    );
    
    await Promise.allSettled(promises);
  }

  // Handle client messages
  public async handleMessage(userId: string, message: string) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'mark_read':
          await this.markNotificationAsRead(userId, data.notificationId);
          break;
        case 'get_notifications':
          const notifications = await this.getUserNotifications(userId, data.limit, data.offset);
          const user = this.connectedUsers.get(userId);
          if (user?.ws) {
            user.ws.send(JSON.stringify({
              type: 'notifications',
              notifications,
            }));
          }
          break;
        case 'ping':
          // Update last seen
          const connectedUser = this.connectedUsers.get(userId);
          if (connectedUser) {
            connectedUser.lastSeen = new Date();
          }
          break;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  // Mark notification as read
  private async markNotificationAsRead(userId: string, notificationId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: userId,
        },
        data: {
          read: true,
        },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Get user notifications
  private async getUserNotifications(userId: string, limit = 20, offset = 0) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  // Start heartbeat to clean up dead connections
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      const timeout = 5 * 60 * 1000; // 5 minutes
      
      for (const [userId, user] of this.connectedUsers.entries()) {
        if (now.getTime() - user.lastSeen.getTime() > timeout) {
          console.log(`Removing inactive connection for user ${userId}`);
          this.removeConnection(userId);
        }
      }
    }, 60000); // Check every minute
  }

  // Stop heartbeat
  public stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Check if user is connected
  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get all connected user IDs
  public getConnectedUserIds(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}

// Singleton instance
let wsServer: WebSocketServer | null = null;

export function initializeWebSocketServer(): WebSocketServer {
  if (!wsServer) {
    wsServer = WebSocketServer.getInstance();
  }
  return wsServer;
}

export function getWebSocketServer(): WebSocketServer | null {
  return wsServer;
}