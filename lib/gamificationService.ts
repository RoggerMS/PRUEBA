import { prisma } from './prisma';
import { gamificationEventBus, GamificationEvents } from './eventBus';
import { Badge, Achievement, UserBadge, Activity, ProgressCounter, BadgeRarity } from '@prisma/client';

// Tipos para el servicio
export interface BadgeProgress {
  badgeId: string;
  progress: number;
  targetValue: number;
  isCompleted: boolean;
}

export interface UserGamificationStats {
  totalBadges: number;
  totalPoints: number;
  level: number;
  xp: number;
  recentActivities: Activity[];
  progressCounters: ProgressCounter[];
}

class GamificationService {
  private static instance: GamificationService;

  private constructor() {
    this.initializeEventListeners();
  }

  public static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // Inicializar listeners de eventos
  private initializeEventListeners(): void {
    // Escuchar eventos de gamificación
    gamificationEventBus.onGamificationEvent('post_created', (data) => {
      this.handlePostCreated(data.userId, data.postId);
    });

    gamificationEventBus.onGamificationEvent('user_followed', (data) => {
      this.handleUserFollowed(data.userId, data.followedUserId);
    });

    gamificationEventBus.onGamificationEvent('user_gained_follower', (data) => {
      this.handleUserGainedFollower(data.userId, data.followerId);
    });

    gamificationEventBus.onGamificationEvent('level_reached', (data) => {
      this.handleLevelReached(data.userId, data.level);
    });

    gamificationEventBus.onGamificationEvent('comment_created', (data) => {
      this.handleCommentCreated(data.userId, data.commentId, data.postId);
    });

    gamificationEventBus.onGamificationEvent('like_given', (data) => {
      this.handleLikeGiven(data.userId, data.postId);
    });
  }

  // Manejar creación de post
  private async handlePostCreated(userId: string, postId: string): Promise<void> {
    try {
      await this.incrementProgressCounter(userId, 'post_created');
      await this.recordActivity(userId, 'post_created', { postId }, 10);
      await this.checkAchievements(userId, 'post_created');
    } catch (error) {
      console.error('Error handling post created:', error);
    }
  }

  // Manejar seguimiento de usuario
  private async handleUserFollowed(userId: string, followedUserId: string): Promise<void> {
    try {
      await this.incrementProgressCounter(userId, 'user_followed');
      await this.recordActivity(userId, 'user_followed', { followedUserId }, 5);
      await this.checkAchievements(userId, 'user_followed');
    } catch (error) {
      console.error('Error handling user followed:', error);
    }
  }

  // Manejar ganancia de seguidor
  private async handleUserGainedFollower(userId: string, followerId: string): Promise<void> {
    try {
      await this.incrementProgressCounter(userId, 'user_gained_follower');
      await this.recordActivity(userId, 'user_gained_follower', { followerId }, 15);
      await this.checkAchievements(userId, 'user_gained_follower');
    } catch (error) {
      console.error('Error handling user gained follower:', error);
    }
  }

  // Manejar nivel alcanzado
  private async handleLevelReached(userId: string, level: number): Promise<void> {
    try {
      await this.recordActivity(userId, 'level_reached', { level }, level * 10);
      await this.checkAchievements(userId, 'level_reached');
    } catch (error) {
      console.error('Error handling level reached:', error);
    }
  }

  // Manejar creación de comentario
  private async handleCommentCreated(userId: string, commentId: string, postId: string): Promise<void> {
    try {
      await this.incrementProgressCounter(userId, 'comment_created');
      await this.recordActivity(userId, 'comment_created', { commentId, postId }, 5);
    } catch (error) {
      console.error('Error handling comment created:', error);
    }
  }

  // Manejar like dado
  private async handleLikeGiven(userId: string, postId: string): Promise<void> {
    try {
      await this.incrementProgressCounter(userId, 'like_given');
      await this.recordActivity(userId, 'like_given', { postId }, 2);
    } catch (error) {
      console.error('Error handling like given:', error);
    }
  }

  // Incrementar contador de progreso
  private async incrementProgressCounter(userId: string, eventType: string): Promise<ProgressCounter> {
    return await prisma.progressCounter.upsert({
      where: {
        userId_eventType: {
          userId,
          eventType
        }
      },
      update: {
        count: {
          increment: 1
        },
        lastUpdated: new Date()
      },
      create: {
        userId,
        eventType,
        count: 1
      }
    });
  }

  // Registrar actividad
  private async recordActivity(
    userId: string,
    eventType: string,
    eventData: any,
    points: number
  ): Promise<Activity> {
    const activity = await prisma.activity.create({
      data: {
        userId,
        eventType,
        eventData,
        points
      }
    });

    // Actualizar XP del usuario
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: {
          increment: points
        }
      }
    });

    return activity;
  }

  // Verificar logros
  private async checkAchievements(userId: string, eventType: string): Promise<void> {
    const achievements = await prisma.achievement.findMany({
      where: {
        eventType,
        isActive: true
      },
      include: {
        badge: true
      }
    });

    for (const achievement of achievements) {
      const progressCounter = await prisma.progressCounter.findUnique({
        where: {
          userId_eventType: {
            userId,
            eventType
          }
        }
      });

      if (progressCounter && progressCounter.count >= achievement.targetValue) {
        await this.awardBadge(userId, achievement.badgeId, achievement.targetValue);
      }
    }
  }

  // Otorgar badge
  private async awardBadge(userId: string, badgeId: string, progress: number): Promise<UserBadge | null> {
    try {
      // Verificar si el usuario ya tiene este badge
      const existingUserBadge = await prisma.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId,
            badgeId
          }
        }
      });

      if (existingUserBadge && existingUserBadge.isCompleted) {
        return null; // Ya tiene el badge
      }

      // Crear o actualizar el badge del usuario
      const userBadge = await prisma.userBadge.upsert({
        where: {
          userId_badgeId: {
            userId,
            badgeId
          }
        },
        update: {
          progress,
          isCompleted: true,
          earnedAt: new Date()
        },
        create: {
          userId,
          badgeId,
          progress,
          isCompleted: true
        },
        include: {
          badge: true
        }
      });

      // Emitir evento de badge ganado
      gamificationEventBus.emitGamificationEvent('badge_earned', {
        userId,
        badgeId
      });

      console.log(`Badge awarded: ${userBadge.badge.name} to user ${userId}`);
      return userBadge;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return null;
    }
  }

  // Obtener estadísticas de gamificación del usuario
  public async getUserGamificationStats(userId: string): Promise<UserGamificationStats> {
    const [userBadges, recentActivities, progressCounters, user] = await Promise.all([
      prisma.userBadge.findMany({
        where: {
          userId,
          isCompleted: true
        },
        include: {
          badge: true
        }
      }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.progressCounter.findMany({
        where: { userId }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true }
      })
    ]);

    const totalPoints = userBadges.reduce((sum, ub) => sum + ub.badge.points, 0);

    return {
      totalBadges: userBadges.length,
      totalPoints,
      level: user?.level || 1,
      xp: user?.xp || 0,
      recentActivities,
      progressCounters
    };
  }

  // Obtener badges del usuario
  public async getUserBadges(userId: string): Promise<UserBadge[]> {
    return await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true
      },
      orderBy: {
        earnedAt: 'desc'
      }
    });
  }

  // Obtener catálogo de badges
  public async getBadgeCatalog(): Promise<Badge[]> {
    return await prisma.badge.findMany({
      where: { isActive: true },
      orderBy: [
        { rarity: 'desc' },
        { points: 'desc' }
      ]
    });
  }

  // Obtener progreso hacia badges
  public async getBadgeProgress(userId: string): Promise<BadgeProgress[]> {
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true },
      include: { badge: true }
    });

    const progressCounters = await prisma.progressCounter.findMany({
      where: { userId }
    });

    const userBadges = await prisma.userBadge.findMany({
      where: { userId }
    });

    return achievements.map(achievement => {
      const counter = progressCounters.find(pc => pc.eventType === achievement.eventType);
      const userBadge = userBadges.find(ub => ub.badgeId === achievement.badgeId);
      
      return {
        badgeId: achievement.badgeId,
        progress: counter?.count || 0,
        targetValue: achievement.targetValue,
        isCompleted: userBadge?.isCompleted || false
      };
    });
  }
}

// Exportar la instancia singleton
export const gamificationService = GamificationService.getInstance();
export default gamificationService;