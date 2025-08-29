import { RedisService, CHANNELS } from './redis';
import { NotificationType } from '@prisma/client';

export interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface LiveNotification {
  type: 'notification' | 'feed_update' | 'chat_message' | 'system_announcement';
  data: any;
  timestamp: number;
}

// Notification service for real-time features
export class NotificationService {
  // Send notification to specific user
  static async sendToUser(userId: string, notification: Omit<NotificationData, 'userId'>): Promise<boolean> {
    try {
      const liveNotification: LiveNotification = {
        type: 'notification',
        data: { ...notification, userId },
        timestamp: Date.now()
      };
      
      // Publish to user's notification channel
      await RedisService.publish(CHANNELS.NOTIFICATIONS(userId), liveNotification);
      
      // Cache the notification for offline users
      const cacheKey = `notifications:cache:${userId}`;
      const cachedNotifications = await RedisService.get<NotificationData[]>(cacheKey) || [];
      cachedNotifications.unshift({ ...notification, userId });
      
      // Keep only last 50 notifications in cache
      if (cachedNotifications.length > 50) {
        cachedNotifications.splice(50);
      }
      
      await RedisService.set(cacheKey, cachedNotifications, 86400); // 24 hours TTL
      
      return true;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return false;
    }
  }

  // Send feed update to user
  static async sendFeedUpdate(userId: string, updateData: any): Promise<boolean> {
    try {
      const liveUpdate: LiveNotification = {
        type: 'feed_update',
        data: updateData,
        timestamp: Date.now()
      };
      
      await RedisService.publish(CHANNELS.FEED_UPDATES(userId), liveUpdate);
      return true;
    } catch (error) {
      console.error('Error sending feed update:', error);
      return false;
    }
  }

  // Send chat message
  static async sendChatMessage(chatId: string, messageData: any): Promise<boolean> {
    try {
      const liveMessage: LiveNotification = {
        type: 'chat_message',
        data: messageData,
        timestamp: Date.now()
      };
      
      await RedisService.publish(CHANNELS.CHAT_MESSAGES(chatId), liveMessage);
      return true;
    } catch (error) {
      console.error('Error sending chat message:', error);
      return false;
    }
  }

  // Send system announcement to all users
  static async sendSystemAnnouncement(announcementData: any): Promise<boolean> {
    try {
      const announcement: LiveNotification = {
        type: 'system_announcement',
        data: announcementData,
        timestamp: Date.now()
      };
      
      await RedisService.publish(CHANNELS.SYSTEM_ANNOUNCEMENTS, announcement);
      return true;
    } catch (error) {
      console.error('Error sending system announcement:', error);
      return false;
    }
  }

  // Get cached notifications for user
  static async getCachedNotifications(userId: string): Promise<NotificationData[]> {
    try {
      const cacheKey = `notifications:cache:${userId}`;
      return await RedisService.get<NotificationData[]>(cacheKey) || [];
    } catch (error) {
      console.error('Error getting cached notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    try {
      const cacheKey = `notifications:cache:${userId}`;
      const notifications = await RedisService.get<NotificationData[]>(cacheKey) || [];
      
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      );
      
      await RedisService.set(cacheKey, updatedNotifications, 86400);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const cacheKey = `notifications:cache:${userId}`;
      const notifications = await RedisService.get<NotificationData[]>(cacheKey) || [];
      
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      
      await RedisService.set(cacheKey, updatedNotifications, 86400);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getCachedNotifications(userId);
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

// Notification templates
export const NotificationTemplates = {
  // Social notifications
  NEW_FOLLOWER: (followerName: string) => ({
    type: 'SOCIAL' as NotificationType,
    title: 'Nuevo seguidor',
    message: `${followerName} comenzó a seguirte`
  }),

  POST_LIKED: (likerName: string) => ({
    type: 'SOCIAL' as NotificationType,
    title: 'Me gusta en tu publicación',
    message: `A ${likerName} le gustó tu publicación`
  }),

  POST_COMMENTED: (commenterName: string) => ({
    type: 'SOCIAL' as NotificationType,
    title: 'Nuevo comentario',
    message: `${commenterName} comentó en tu publicación`
  }),

  // Academic notifications
  NOTE_RATED: (raterName: string, rating: number) => ({
    type: 'ACADEMIC' as NotificationType,
    title: 'Calificación de apunte',
    message: `${raterName} calificó tu apunte con ${rating} estrellas`
  }),

  QUESTION_ANSWERED: (answererName: string) => ({
    type: 'ACADEMIC' as NotificationType,
    title: 'Nueva respuesta',
    message: `${answererName} respondió tu pregunta`
  }),

  ANSWER_ACCEPTED: () => ({
    type: 'ACADEMIC' as NotificationType,
    title: '¡Respuesta aceptada!',
    message: 'Tu respuesta fue marcada como la mejor'
  }),

  // Gamification notifications
  CROLARS_EARNED: (amount: number, reason: string) => ({
    type: 'GAMIFICATION' as NotificationType,
    title: '¡Crolars ganados!',
    message: `Ganaste ${amount} Crolars por ${reason}`
  }),

  STREAK_MILESTONE: (days: number) => ({
    type: 'GAMIFICATION' as NotificationType,
    title: '¡Racha alcanzada!',
    message: `¡Felicidades! Alcanzaste ${days} días de racha`
  }),

  LEVEL_UP: (newLevel: number) => ({
    type: 'GAMIFICATION' as NotificationType,
    title: '¡Subiste de nivel!',
    message: `¡Felicidades! Ahora eres nivel ${newLevel}`
  }),

  // Marketplace notifications
  PURCHASE_CONFIRMED: (productName: string) => ({
    type: 'MARKETPLACE' as NotificationType,
    title: 'Compra confirmada',
    message: `Tu compra de "${productName}" fue confirmada`
  }),

  PRODUCT_SOLD: (productName: string, buyerName: string) => ({
    type: 'MARKETPLACE' as NotificationType,
    title: 'Producto vendido',
    message: `${buyerName} compró tu producto "${productName}"`
  }),

  // System notifications
  WELCOME: () => ({
    type: 'SYSTEM' as NotificationType,
    title: '¡Bienvenido a CRUNEVO!',
    message: 'Completa tu perfil y comienza a conectar con otros estudiantes'
  }),

  MAINTENANCE: (startTime: string, duration: string) => ({
    type: 'SYSTEM' as NotificationType,
    title: 'Mantenimiento programado',
    message: `Habrá mantenimiento el ${startTime} por ${duration}`
  })
};