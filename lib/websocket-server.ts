import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { eventBus } from '@/lib/eventBus';
import { prisma } from '@/lib/prisma';

export interface GamificationNotification {
  id: string;
  type: 'badge_earned' | 'achievement_unlocked' | 'level_up' | 'streak_milestone' | 'xp_gained';
  title: string;
  message: string;
  data: any;
  userId: string;
  timestamp: Date;
  read: boolean;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      },
      path: '/api/socket'
    });

    this.setupEventHandlers();
    this.setupGamificationListeners();
  }

  private setupEventHandlers() {
    this.io.on('connection', async (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Autenticar usuario
      const session = await this.authenticateSocket(socket);
      if (!session?.user?.id) {
        socket.emit('error', { message: 'No autorizado' });
        socket.disconnect();
        return;
      }

      const userId = session.user.id;
      
      // Registrar conexión del usuario
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(socket.id);

      // Unir al usuario a su sala personal
      socket.join(`user:${userId}`);
      
      // Enviar notificaciones pendientes
      await this.sendPendingNotifications(socket, userId);

      // Manejar eventos del cliente
      socket.on('mark_notification_read', async (notificationId: string) => {
        await this.markNotificationAsRead(userId, notificationId);
      });

      socket.on('get_notifications', async (params: { limit?: number; offset?: number }) => {
        const notifications = await this.getUserNotifications(userId, params.limit, params.offset);
        socket.emit('notifications_list', notifications);
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        
        // Remover conexión del usuario
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.connectedUsers.delete(userId);
          }
        }
      });
    });
  }

  private async authenticateSocket(socket: Socket): Promise<any> {
    try {
      // En un entorno real, aquí validarías el token JWT del socket
      // Por simplicidad, asumimos que el userId viene en el handshake
      const userId = socket.handshake.auth?.userId;
      if (!userId) return null;

      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, role: true }
      });

      return user ? { user } : null;
    } catch (error) {
      console.error('Error authenticating socket:', error);
      return null;
    }
  }

  private setupGamificationListeners() {
    // Escuchar eventos de gamificación y enviar notificaciones
    eventBus.on('badge_earned', async (data) => {
      const notification: GamificationNotification = {
        id: `badge_${data.badgeId}_${Date.now()}`,
        type: 'badge_earned',
        title: '¡Nuevo Badge Obtenido!',
        message: `Has obtenido el badge "${data.badgeName}"`,
        data: {
          badgeId: data.badgeId,
          badgeName: data.badgeName,
          badgeIcon: data.badgeIcon,
          badgeRarity: data.badgeRarity,
          xpGained: data.xpGained || 0
        },
        userId: data.userId,
        timestamp: new Date(),
        read: false
      };

      await this.sendNotificationToUser(data.userId, notification);
    });

    eventBus.on('achievement_unlocked', async (data) => {
      const notification: GamificationNotification = {
        id: `achievement_${data.achievementId}_${Date.now()}`,
        type: 'achievement_unlocked',
        title: '¡Logro Desbloqueado!',
        message: `Has completado el logro "${data.achievementName}"`,
        data: {
          achievementId: data.achievementId,
          achievementName: data.achievementName,
          xpReward: data.xpReward,
          crolarsReward: data.crolarsReward,
          badgeAwarded: data.badgeAwarded
        },
        userId: data.userId,
        timestamp: new Date(),
        read: false
      };

      await this.sendNotificationToUser(data.userId, notification);
    });

    eventBus.on('level_reached', async (data) => {
      const notification: GamificationNotification = {
        id: `level_${data.newLevel}_${Date.now()}`,
        type: 'level_up',
        title: '¡Subiste de Nivel!',
        message: `¡Felicidades! Ahora eres nivel ${data.newLevel}`,
        data: {
          oldLevel: data.oldLevel,
          newLevel: data.newLevel,
          xpGained: data.xpGained,
          crolarsReward: data.crolarsReward
        },
        userId: data.userId,
        timestamp: new Date(),
        read: false
      };

      await this.sendNotificationToUser(data.userId, notification);
    });

    eventBus.on('streak_milestone', async (data) => {
      const notification: GamificationNotification = {
        id: `streak_${data.streakDays}_${Date.now()}`,
        type: 'streak_milestone',
        title: '¡Racha Increíble!',
        message: `¡Has mantenido una racha de ${data.streakDays} días!`,
        data: {
          streakDays: data.streakDays,
          xpBonus: data.xpBonus,
          crolarsBonus: data.crolarsBonus
        },
        userId: data.userId,
        timestamp: new Date(),
        read: false
      };

      await this.sendNotificationToUser(data.userId, notification);
    });
  }

  private async sendNotificationToUser(userId: string, notification: GamificationNotification) {
    try {
      // Guardar notificación en la base de datos
      await prisma.notification.create({
        data: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          userId: userId,
          read: false,
          createdAt: notification.timestamp
        }
      });

      // Enviar notificación en tiempo real si el usuario está conectado
      this.io.to(`user:${userId}`).emit('gamification_notification', notification);

      // Enviar conteo de notificaciones no leídas
      const unreadCount = await this.getUnreadNotificationCount(userId);
      this.io.to(`user:${userId}`).emit('unread_count_update', { count: unreadCount });

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  private async sendPendingNotifications(socket: Socket, userId: string) {
    try {
      const notifications = await this.getUserNotifications(userId, 10, 0);
      socket.emit('notifications_list', notifications);

      const unreadCount = await this.getUnreadNotificationCount(userId);
      socket.emit('unread_count_update', { count: unreadCount });
    } catch (error) {
      console.error('Error sending pending notifications:', error);
    }
  }

  private async getUserNotifications(userId: string, limit = 20, offset = 0) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  private async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          read: false
        }
      });
    } catch (error) {
      console.error('Error counting unread notifications:', error);
      return 0;
    }
  }

  private async markNotificationAsRead(userId: string, notificationId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: userId
        },
        data: {
          read: true
        }
      });

      // Enviar conteo actualizado
      const unreadCount = await this.getUnreadNotificationCount(userId);
      this.io.to(`user:${userId}`).emit('unread_count_update', { count: unreadCount });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Método para enviar notificaciones desde otros servicios
  public async broadcastNotification(userId: string, notification: Omit<GamificationNotification, 'id' | 'timestamp' | 'read'>) {
    const fullNotification: GamificationNotification = {
      ...notification,
      id: `${notification.type}_${Date.now()}`,
      timestamp: new Date(),
      read: false
    };

    await this.sendNotificationToUser(userId, fullNotification);
  }

  public getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

// Singleton instance
let wsServer: WebSocketServer | null = null;

export function initializeWebSocketServer(server: HTTPServer): WebSocketServer {
  if (!wsServer) {
    wsServer = new WebSocketServer(server);
  }
  return wsServer;
}

export function getWebSocketServer(): WebSocketServer | null {
  return wsServer;
}