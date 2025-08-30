import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/gamification/user/[userId]/badges - Obtener badges del usuario
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

    // Verificar si el usuario puede ver estos badges (propio perfil o público)
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');
    const earned = searchParams.get('earned'); // 'true' | 'false' | null (all)
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Construir filtros
    const badgeWhere: any = {};
    if (category) badgeWhere.category = category;
    if (rarity) badgeWhere.rarity = rarity;

    const userBadgeWhere: any = { userId };
    if (earned === 'true') {
      userBadgeWhere.earnedAt = { not: null };
    } else if (earned === 'false') {
      userBadgeWhere.earnedAt = null;
    }

    // Obtener badges del usuario con información de progreso
    const userBadges = await prisma.userBadge.findMany({
      where: userBadgeWhere,
      skip,
      take: limit,
      include: {
        badge: {
          where: badgeWhere
        },
        achievement: true
      },
      orderBy: [
        { earnedAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' }
      ]
    });

    // Filtrar badges que no coinciden con los criterios de badge
    const filteredUserBadges = userBadges.filter(ub => ub.badge !== null);

    // Obtener estadísticas del usuario
    const userStats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        xp: true,
        crolars: true,
        streak: true,
        _count: {
          select: {
            userBadges: {
              where: {
                earnedAt: { not: null }
              }
            }
          }
        }
      }
    });

    // Obtener contadores de progreso
    const progressCounters = await prisma.progressCounter.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    // Calcular estadísticas de badges
    const badgeStats = {
      total: await prisma.userBadge.count({ where: { userId } }),
      earned: await prisma.userBadge.count({ 
        where: { 
          userId, 
          earnedAt: { not: null } 
        } 
      }),
      byRarity: await prisma.userBadge.groupBy({
        by: ['badge'],
        where: { 
          userId,
          earnedAt: { not: null }
        },
        _count: true
      })
    };

    // Obtener distribución por rareza
    const rarityDistribution = await prisma.$queryRaw`
      SELECT b.rarity, COUNT(*) as count
      FROM UserBadge ub
      JOIN Badge b ON ub.badgeId = b.id
      WHERE ub.userId = ${userId} AND ub.earnedAt IS NOT NULL
      GROUP BY b.rarity
    ` as Array<{ rarity: string; count: bigint }>;

    const rarityStats = rarityDistribution.reduce((acc, item) => {
      acc[item.rarity] = Number(item.count);
      return acc;
    }, {} as Record<string, number>);

    // Obtener actividades recientes relacionadas con badges
    const recentActivities = await prisma.activity.findMany({
      where: {
        userId,
        type: {
          in: ['BADGE_EARNED', 'ACHIEVEMENT_UNLOCKED', 'LEVEL_UP']
        }
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        metadata: true
      }
    });

    const totalCount = await prisma.userBadge.count({
      where: {
        ...userBadgeWhere,
        badge: badgeWhere
      }
    });

    return NextResponse.json({
      userBadges: filteredUserBadges.map(ub => ({
        id: ub.id,
        badge: ub.badge,
        achievement: ub.achievement,
        progress: ub.progress,
        earnedAt: ub.earnedAt,
        createdAt: ub.createdAt,
        isEarned: ub.earnedAt !== null,
        progressPercentage: ub.progress && ub.badge?.criteria ? 
          Math.min(100, (ub.progress / (ub.badge.criteria as any).target || 1) * 100) : 0
      })),
      userStats,
      progressCounters: progressCounters.map(pc => ({
        id: pc.id,
        type: pc.type,
        value: pc.value,
        updatedAt: pc.updatedAt
      })),
      badgeStats: {
        ...badgeStats,
        earnedPercentage: badgeStats.total > 0 ? 
          Math.round((badgeStats.earned / badgeStats.total) * 100) : 0,
        rarityDistribution: rarityStats
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        metadata: activity.metadata,
        createdAt: activity.createdAt
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching user badges:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/user/[userId]/badges - Otorgar badge manualmente (solo admin)
export async function POST(
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
    const { badgeId, achievementId, reason } = body;

    if (!badgeId && !achievementId) {
      return NextResponse.json(
        { error: 'Se requiere badgeId o achievementId' },
        { status: 400 }
      );
    }

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

    // Verificar que el badge/achievement existe
    if (badgeId) {
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId }
      });

      if (!badge) {
        return NextResponse.json(
          { error: 'Badge no encontrado' },
          { status: 404 }
        );
      }
    }

    if (achievementId) {
      const achievement = await prisma.achievement.findUnique({
        where: { id: achievementId }
      });

      if (!achievement) {
        return NextResponse.json(
          { error: 'Achievement no encontrado' },
          { status: 404 }
        );
      }
    }

    // Verificar si ya tiene el badge
    const existingUserBadge = await prisma.userBadge.findFirst({
      where: {
        userId,
        badgeId: badgeId || undefined,
        achievementId: achievementId || undefined
      }
    });

    if (existingUserBadge && existingUserBadge.earnedAt) {
      return NextResponse.json(
        { error: 'El usuario ya tiene este badge/achievement' },
        { status: 400 }
      );
    }

    // Otorgar el badge
    const userBadge = await prisma.userBadge.upsert({
      where: {
        id: existingUserBadge?.id || ''
      },
      update: {
        earnedAt: new Date(),
        progress: 100
      },
      create: {
        userId,
        badgeId,
        achievementId,
        earnedAt: new Date(),
        progress: 100
      },
      include: {
        badge: true,
        achievement: true
      }
    });

    // Registrar actividad
    await prisma.activity.create({
      data: {
        userId,
        type: badgeId ? 'BADGE_EARNED' : 'ACHIEVEMENT_UNLOCKED',
        description: `Badge otorgado manualmente por admin: ${reason || 'Sin razón especificada'}`,
        metadata: {
          badgeId,
          achievementId,
          grantedBy: session.user.id,
          reason
        }
      }
    });

    return NextResponse.json({
      userBadge,
      message: 'Badge otorgado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error granting badge:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}