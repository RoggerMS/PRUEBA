import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { gamificationService } from '@/lib/gamificationService';

// GET /api/gamification/user/[userId]/progress - Obtener progreso del usuario
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

    // Verificar que el usuario existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        level: true,
        xp: true,
        crolars: true,
        streak: true,
        lastActivity: true,
        createdAt: true
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d'; // '7d', '30d', '90d', '1y', 'all'
    const includeDetails = searchParams.get('details') === 'true';

    // Calcular fechas para el timeframe
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // Desde el inicio
    }

    // Obtener estadísticas del usuario usando el servicio
    const userStats = await gamificationService.getUserStats(userId);
    
    // Obtener progreso de badges
    const badgeProgress = await gamificationService.getBadgeProgress(userId);

    // Obtener contadores de progreso
    const progressCounters = await prisma.progressCounter.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    // Obtener actividades recientes en el timeframe
    const recentActivities = await prisma.activity.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        }
      },
      take: includeDetails ? 50 : 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        description: true,
        metadata: true,
        createdAt: true
      }
    });

    // Calcular XP ganado en el timeframe
    const xpActivities = await prisma.activity.findMany({
      where: {
        userId,
        type: {
          in: ['XP_GAINED', 'ACHIEVEMENT_UNLOCKED', 'LEVEL_UP']
        },
        createdAt: {
          gte: startDate
        }
      },
      select: {
        metadata: true,
        createdAt: true
      }
    });

    const xpGained = xpActivities.reduce((total, activity) => {
      const xp = (activity.metadata as any)?.xp || 0;
      return total + xp;
    }, 0);

    // Obtener badges ganados en el timeframe
    const badgesEarned = await prisma.userBadge.count({
      where: {
        userId,
        earnedAt: {
          gte: startDate,
          not: null
        }
      }
    });

    // Calcular progreso hacia el siguiente nivel
    const currentLevel = targetUser.level || 1;
    const currentXP = targetUser.xp || 0;
    const xpForCurrentLevel = gamificationService.getXPForLevel(currentLevel);
    const xpForNextLevel = gamificationService.getXPForLevel(currentLevel + 1);
    const xpNeededForNext = xpForNextLevel - currentXP;
    const progressToNextLevel = Math.max(0, Math.min(100, 
      ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
    ));

    // Obtener ranking del usuario (opcional, puede ser costoso)
    let userRank = null;
    if (includeDetails) {
      const usersWithHigherXP = await prisma.user.count({
        where: {
          xp: {
            gt: currentXP
          }
        }
      });
      userRank = usersWithHigherXP + 1;
    }

    // Calcular estadísticas de actividad por día (últimos 30 días)
    const dailyActivity = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as activities,
        COUNT(CASE WHEN type = 'XP_GAINED' THEN 1 END) as xpActivities
      FROM Activity 
      WHERE userId = ${userId} 
        AND createdAt >= ${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT 30
    ` as Array<{ date: string; activities: bigint; xpActivities: bigint }>;

    // Obtener logros próximos (badges con progreso > 50% pero no completados)
    const upcomingAchievements = badgeProgress
      .filter(bp => !bp.isEarned && bp.progressPercentage > 50)
      .sort((a, b) => b.progressPercentage - a.progressPercentage)
      .slice(0, 5);

    // Calcular streaks y tendencias
    const streakData = {
      current: targetUser.streak || 0,
      longest: await this.getLongestStreak(userId),
      lastActivity: targetUser.lastActivity
    };

    return NextResponse.json({
      user: {
        id: targetUser.id,
        username: targetUser.username,
        level: targetUser.level,
        xp: targetUser.xp,
        crolars: targetUser.crolars,
        streak: targetUser.streak,
        lastActivity: targetUser.lastActivity,
        memberSince: targetUser.createdAt
      },
      progress: {
        currentLevel,
        currentXP,
        xpForNextLevel,
        xpNeededForNext,
        progressToNextLevel: Math.round(progressToNextLevel * 100) / 100
      },
      stats: {
        ...userStats,
        rank: userRank,
        xpGainedInPeriod: xpGained,
        badgesEarnedInPeriod: badgesEarned,
        activitiesInPeriod: recentActivities.length
      },
      streaks: streakData,
      progressCounters: progressCounters.map(pc => ({
        id: pc.id,
        type: pc.type,
        value: pc.value,
        updatedAt: pc.updatedAt
      })),
      badgeProgress: badgeProgress.slice(0, includeDetails ? undefined : 10),
      upcomingAchievements,
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        metadata: activity.metadata,
        createdAt: activity.createdAt
      })),
      dailyActivity: dailyActivity.map(day => ({
        date: day.date,
        activities: Number(day.activities),
        xpActivities: Number(day.xpActivities)
      })),
      timeframe,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para obtener el streak más largo
async function getLongestStreak(userId: string): Promise<number> {
  try {
    // Esta es una implementación simplificada
    // En una implementación real, calcularías el streak más largo basado en las actividades
    const activities = await prisma.activity.findMany({
      where: {
        userId,
        type: 'DAILY_LOGIN'
      },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true }
    });

    if (activities.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < activities.length; i++) {
      const prevDate = new Date(activities[i - 1].createdAt);
      const currDate = new Date(activities[i].createdAt);
      
      // Verificar si es el día siguiente
      const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  } catch (error) {
    console.error('Error calculating longest streak:', error);
    return 0;
  }
}

// PUT /api/gamification/user/[userId]/progress - Actualizar progreso manualmente (solo admin)
export async function PUT(
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

    // Verificar permisos de admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { xp, level, crolars, streak, reason } = body;

    // Verificar que el usuario existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar datos del usuario
    const updateData: any = {};
    if (typeof xp === 'number') updateData.xp = Math.max(0, xp);
    if (typeof level === 'number') updateData.level = Math.max(1, level);
    if (typeof crolars === 'number') updateData.crolars = Math.max(0, crolars);
    if (typeof streak === 'number') updateData.streak = Math.max(0, streak);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        level: true,
        xp: true,
        crolars: true,
        streak: true
      }
    });

    // Registrar actividad
    await prisma.activity.create({
      data: {
        userId,
        type: 'ADMIN_UPDATE',
        description: `Progreso actualizado manualmente por admin: ${reason || 'Sin razón especificada'}`,
        metadata: {
          updatedFields: updateData,
          updatedBy: session.user.id,
          reason,
          previousValues: {
            xp: targetUser.xp,
            level: targetUser.level,
            crolars: targetUser.crolars,
            streak: targetUser.streak
          }
        }
      }
    });

    return NextResponse.json({
      user: updatedUser,
      message: 'Progreso actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error updating user progress:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}