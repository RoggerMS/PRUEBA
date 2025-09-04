import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gamificationService } from '@/lib/gamificationService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all achievements from the catalog
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [
        { rarity: 'desc' },
        { name: 'asc' }
      ]
    });

    // Get user's completed achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      }
    });

    // Get user's progress counters
    const userStats = await gamificationService.getUserGamificationStats(userId);
    const progressCounters = userStats.progressCounters || {};

    // Map achievements with user progress
    const achievementsWithProgress = allAchievements.map(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
      const currentProgress = progressCounters[achievement.eventType] || 0;
      
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        type: achievement.eventType,
        rarity: achievement.rarity,
        targetValue: achievement.targetValue,
        currentProgress: Math.min(currentProgress, achievement.targetValue),
        isCompleted: !!userAchievement,
        completedAt: userAchievement?.earnedAt || null,
        xpReward: achievement.xpReward,
        badge: achievement.badgeId ? {
          id: achievement.badgeId,
          name: achievement.name, // Using achievement name as badge name
          icon: getAchievementIcon(achievement.eventType)
        } : null
      };
    });

    return NextResponse.json(achievementsWithProgress);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

// Helper function to get achievement icons based on event type
function getAchievementIcon(eventType: string): string {
  const iconMap: Record<string, string> = {
    'post_created': '📝',
    'user_followed': '👥',
    'user_gained_follower': '⭐',
    'level_reached': '🏆',
    'comment_created': '💬',
    'like_given': '❤️',
    'badge_earned': '🏅',
    'streak_maintained': '🔥',
    'xp_gained': '⚡',
    'achievement_unlocked': '🎯'
  };
  
  return iconMap[eventType] || '🏆';
}