import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { gamificationService } from '@/lib/gamificationService';
import { prisma } from '@/lib/prisma';

// GET /api/gamification/user/[userId]/stats - Get user gamification statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        level: true,
        xp: true,
        totalXp: true,
        crolars: true,
        streak: true,
        maxStreak: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Get comprehensive gamification stats
    const stats = await gamificationService.getUserGamificationStats(userId);
    
    // Get badge counts by rarity
    const badgeCounts = await prisma.userBadge.groupBy({
      by: ['badge'],
      where: {
        userId,
        isCompleted: true
      },
      _count: {
        badge: true
      }
    });

    // Get badges with rarity info
    const badges = await prisma.badge.findMany({
      where: {
        id: {
          in: badgeCounts.map(bc => bc.badge)
        }
      },
      select: {
        id: true,
        rarity: true
      }
    });

    // Calculate badge counts by rarity
    const badgesByRarity = badges.reduce((acc, badge) => {
      acc[badge.rarity.toLowerCase()] = (acc[badge.rarity.toLowerCase()] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate XP to next level
    const currentLevel = user.level;
    const nextLevelXP = Math.pow(currentLevel + 1, 2) * 100; // Simple formula
    const xpToNextLevel = Math.max(0, nextLevelXP - user.totalXp);

    // Get recent activities count
    const recentActivitiesCount = await prisma.activity.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    // Get user rank
    const userRank = await prisma.user.count({
      where: {
        totalXp: {
          gt: user.totalXp
        }
      }
    }) + 1;

    const response = {
      level: user.level,
      xp: user.xp,
      totalXp: user.totalXp,
      xpToNextLevel,
      crolars: user.crolars || 0,
      streak: user.streak || 0,
      maxStreak: user.maxStreak || 0,
      totalBadges: stats.totalBadges,
      earnedBadges: stats.earnedBadges,
      legendaryBadges: badgesByRarity.legendary || 0,
      epicBadges: badgesByRarity.epic || 0,
      rareBadges: badgesByRarity.rare || 0,
      commonBadges: badgesByRarity.common || 0,
      recentActivities: recentActivitiesCount,
      rank: userRank,
      joinedAt: user.createdAt || new Date(),
      lastActive: stats.recentActivities[0]?.createdAt || new Date()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching user gamification stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}