import { WebSocketServer } from './websocket-server';
import { gamificationEventBus } from './eventBus';

interface NotificationData {
  type: 'badge_earned' | 'achievement_unlocked' | 'level_up' | 'streak_milestone' | 'xp_gained';
  userId: string;
  title: string;
  message: string;
  data?: any;
}

class NotificationService {
  private wsServer: WebSocketServer;

  constructor() {
    this.wsServer = WebSocketServer.getInstance();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for gamification events and send notifications
    gamificationEventBus.on('badge_earned', (data) => this.handleBadgeEarned(data));
    gamificationEventBus.on('achievement_unlocked', (data) => this.handleAchievementUnlocked(data));
    gamificationEventBus.on('level_reached', (data) => this.handleLevelUp(data));
    gamificationEventBus.on('streak_milestone', (data) => this.handleStreakMilestone(data));
    gamificationEventBus.on('xp_gained', (data) => this.handleXpGained(data));
  }

  private async handleBadgeEarned(data: any) {
    const notification: NotificationData = {
      type: 'badge_earned',
      userId: data.userId,
      title: '¡Insignia Desbloqueada!',
      message: `Has ganado la insignia "${data.badge.name}"`,
      data: {
        badgeId: data.badge.id,
        badgeName: data.badge.name,
        badgeIcon: data.badge.icon,
        badgeRarity: data.badge.rarity,
        xpGained: data.xpGained || 0,
        crolarsGained: data.crolarsGained || 0
      }
    };

    await this.sendNotification(notification);
  }

  private async handleAchievementUnlocked(data: any) {
    const notification: NotificationData = {
      type: 'achievement_unlocked',
      userId: data.userId,
      title: '¡Logro Desbloqueado!',
      message: `Has completado el logro "${data.achievement.name}"`,
      data: {
        achievementId: data.achievement.id,
        achievementName: data.achievement.name,
        achievementType: data.achievement.type,
        xpReward: data.achievement.xpReward,
        crolarsReward: data.achievement.crolarsReward,
        badgeId: data.badge?.id,
        badgeName: data.badge?.name
      }
    };

    await this.sendNotification(notification);
  }

  private async handleLevelUp(data: any) {
    const notification: NotificationData = {
      type: 'level_up',
      userId: data.userId,
      title: '¡Subiste de Nivel!',
      message: `¡Felicidades! Ahora eres nivel ${data.newLevel}`,
      data: {
        oldLevel: data.oldLevel,
        newLevel: data.newLevel,
        totalXp: data.totalXp,
        xpForNextLevel: data.xpForNextLevel,
        crolarsReward: data.crolarsReward || 0
      }
    };

    await this.sendNotification(notification);
  }

  private async handleStreakMilestone(data: any) {
    const notification: NotificationData = {
      type: 'streak_milestone',
      userId: data.userId,
      title: '¡Racha Increíble!',
      message: `¡Has alcanzado una racha de ${data.streakDays} días!`,
      data: {
        streakDays: data.streakDays,
        streakType: data.streakType || 'daily_login',
        xpBonus: data.xpBonus || 0,
        crolarsBonus: data.crolarsBonus || 0
      }
    };

    await this.sendNotification(notification);
  }

  private async handleXpGained(data: any) {
    // Only send notification for significant XP gains (>= 50 XP)
    if (data.xpGained < 50) return;

    const notification: NotificationData = {
      type: 'xp_gained',
      userId: data.userId,
      title: '¡XP Ganada!',
      message: `Has ganado ${data.xpGained} puntos de experiencia`,
      data: {
        xpGained: data.xpGained,
        source: data.source || 'unknown',
        activity: data.activity,
        totalXp: data.totalXp,
        crolarsGained: data.crolarsGained || 0
      }
    };

    await this.sendNotification(notification);
  }

  private async sendNotification(notification: NotificationData) {
    try {
      await this.wsServer.sendNotification(notification);
      console.log(`Notification sent: ${notification.type} to user ${notification.userId}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Public method to send custom notifications
  public async sendCustomNotification(notification: NotificationData) {
    await this.sendNotification(notification);
  }

  // Public method to broadcast notifications to all users
  public async broadcastNotification(notification: Omit<NotificationData, 'userId'>) {
    try {
      await this.wsServer.broadcastNotification(notification);
      console.log(`Broadcast notification sent: ${notification.type}`);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
    }
  }

  // Get WebSocket server stats
  public getStats() {
    return {
      connectedUsers: this.wsServer.getConnectedUsersCount(),
      connectedUserIds: this.wsServer.getConnectedUserIds()
    };
  }
}

// Create singleton instance
let notificationService: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    notificationService = new NotificationService();
  }
  return notificationService;
}

// Initialize the service
export function initializeNotificationService(): NotificationService {
  return getNotificationService();
}

export { NotificationService };