import { gamificationEventBus, GamificationEvents } from '@/lib/eventBus';

export interface GamificationEvent {
  type: 'xp_gained' | 'badge_earned' | 'level_up' | 'achievement_unlocked' | 'streak_updated';
  userId: string;
  data: {
    amount?: number;
    badgeId?: string;
    achievementId?: string;
    level?: number;
    streak?: number;
    source?: string;
    metadata?: Record<string, any>;
  };
  timestamp: Date;
}

export interface UserProgress {
  userId: string;
  totalXP: number;
  level: number;
  badges: string[];
  achievements: string[];
  streaks: Record<string, number>;
  lastActivity: Date;
}

class GamificationService {
  private userProgress: Map<string, UserProgress> = new Map();

  // Initialize user progress
  initializeUser(userId: string): UserProgress {
    if (!this.userProgress.has(userId)) {
      const progress: UserProgress = {
        userId,
        totalXP: 0,
        level: 1,
        badges: [],
        achievements: [],
        streaks: {},
        lastActivity: new Date()
      };
      this.userProgress.set(userId, progress);
      return progress;
    }
    return this.userProgress.get(userId)!;
  }

  // Get user progress
  getUserProgress(userId: string): UserProgress | null {
    return this.userProgress.get(userId) || null;
  }

  // Award XP to user
  async awardXP(userId: string, amount: number, source: string = 'general'): Promise<void> {
    const progress = this.initializeUser(userId);
    const oldLevel = progress.level;
    
    progress.totalXP += amount;
    progress.level = this.calculateLevel(progress.totalXP);
    progress.lastActivity = new Date();
    
    // Emit XP gained event using existing event bus structure
    // For now, we'll use the closest matching event type
    gamificationEventBus.emitGamificationEvent('profile_updated', {
      userId
    });
    
    // Check for level up
    if (progress.level > oldLevel) {
      await this.handleLevelUp(userId, progress.level, oldLevel);
    }
    
    // Check for achievements
    await this.checkAchievements(userId, progress);
  }

  // Award badge to user
  async awardBadge(userId: string, badgeId: string): Promise<void> {
    const progress = this.initializeUser(userId);
    
    if (!progress.badges.includes(badgeId)) {
      progress.badges.push(badgeId);
      progress.lastActivity = new Date();
      
      gamificationEventBus.emitGamificationEvent('badge_earned', {
        userId,
        badgeId
      });
    }
  }

  // Unlock achievement
  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    const progress = this.initializeUser(userId);
    
    if (!progress.achievements.includes(achievementId)) {
      progress.achievements.push(achievementId);
      progress.lastActivity = new Date();
      
      // Use profile_updated as closest match for achievement unlocked
      gamificationEventBus.emitGamificationEvent('profile_updated', {
        userId
      });
    }
  }

  // Update streak
  async updateStreak(userId: string, streakType: string, count: number): Promise<void> {
    const progress = this.initializeUser(userId);
    const oldStreak = progress.streaks[streakType] || 0;
    
    progress.streaks[streakType] = count;
    progress.lastActivity = new Date();
    
    gamificationEventBus.emitGamificationEvent('login_streak', {
      userId,
      streakDays: count
    });
  }

  // Handle level up
  private async handleLevelUp(userId: string, newLevel: number, oldLevel: number): Promise<void> {
    gamificationEventBus.emitGamificationEvent('level_reached', {
      userId,
      level: newLevel
    });
    
    // Award level-up badge if applicable
    if (newLevel % 5 === 0) {
      await this.awardBadge(userId, `level_${newLevel}`);
    }
  }

  // Calculate level from XP
  private calculateLevel(totalXP: number): number {
    // Simple level calculation: 100 XP per level, with increasing requirements
    let level = 1;
    let xpRequired = 100;
    let currentXP = totalXP;
    
    while (currentXP >= xpRequired) {
      currentXP -= xpRequired;
      level++;
      xpRequired = Math.floor(xpRequired * 1.2); // 20% increase per level
    }
    
    return level;
  }

  // Check for achievements based on progress
  private async checkAchievements(userId: string, progress: UserProgress): Promise<void> {
    const achievements = [
      { id: 'first_100_xp', condition: () => progress.totalXP >= 100 },
      { id: 'first_500_xp', condition: () => progress.totalXP >= 500 },
      { id: 'first_1000_xp', condition: () => progress.totalXP >= 1000 },
      { id: 'badge_collector', condition: () => progress.badges.length >= 5 },
      { id: 'level_5', condition: () => progress.level >= 5 },
      { id: 'level_10', condition: () => progress.level >= 10 },
      { id: 'streak_master', condition: () => Object.values(progress.streaks).some(s => s >= 7) }
    ];
    
    for (const achievement of achievements) {
      if (achievement.condition() && !progress.achievements.includes(achievement.id)) {
        await this.unlockAchievement(userId, achievement.id);
      }
    }
  }

  // Get XP for next level
  getXPForNextLevel(userId: string): { current: number; required: number; progress: number } {
    const progress = this.getUserProgress(userId);
    if (!progress) {
      return { current: 0, required: 100, progress: 0 };
    }
    
    let level = 1;
    let xpRequired = 100;
    let totalXPUsed = 0;
    
    // Calculate XP used for current level
    while (level < progress.level) {
      totalXPUsed += xpRequired;
      level++;
      xpRequired = Math.floor(xpRequired * 1.2);
    }
    
    const currentLevelXP = progress.totalXP - totalXPUsed;
    const progressPercent = (currentLevelXP / xpRequired) * 100;
    
    return {
      current: currentLevelXP,
      required: xpRequired,
      progress: Math.min(progressPercent, 100)
    };
  }

  // Get leaderboard
  getLeaderboard(limit: number = 10): UserProgress[] {
    return Array.from(this.userProgress.values())
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, limit);
  }

  // Activity tracking methods
  async trackChatMessage(userId: string): Promise<void> {
    await this.awardXP(userId, 5, 'chat_message');
  }

  async trackQuestionAsked(userId: string): Promise<void> {
    await this.awardXP(userId, 10, 'question_asked');
  }

  async trackHelpfulResponse(userId: string): Promise<void> {
    await this.awardXP(userId, 15, 'helpful_response');
  }

  async trackDailyLogin(userId: string): Promise<void> {
    const today = new Date().toDateString();
    const progress = this.getUserProgress(userId);
    
    if (progress && progress.lastActivity.toDateString() !== today) {
      await this.awardXP(userId, 20, 'daily_login');
      
      // Update daily streak
      const currentStreak = progress.streaks['daily_login'] || 0;
      await this.updateStreak(userId, 'daily_login', currentStreak + 1);
    }
  }

  async trackQuickActionUsed(userId: string): Promise<void> {
    await this.awardXP(userId, 8, 'quick_action');
  }

  async trackLongConversation(userId: string): Promise<void> {
    await this.awardXP(userId, 25, 'long_conversation');
  }
}

// Export singleton instance
export const gamificationService = new GamificationService();

// Export types
export type { GamificationEvent, UserProgress };