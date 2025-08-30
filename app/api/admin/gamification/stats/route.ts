import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/gamification/stats - Obtener estadísticas del panel de administración
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos de administrador
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    // Obtener estadísticas en paralelo
    const [badgeStats, achievementStats, userStats, activityStats, topEarners] = await Promise.all([
      // Estadísticas de badges
      prisma.badge.groupBy({
        by: ['rarity'],
        _count: {
          id: true
        }
      }),
      
      // Estadísticas de achievements
      prisma.achievement.groupBy({
        by: ['type'],
        _count: {
          id: true
        }
      }),
      
      // Estadísticas de usuarios
      prisma.user.count({
        where: {
          userBadges: {
            some: {}
          }
        }
      }),
      
      // Actividades recientes (últimas 24 horas)
      prisma.activity.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Top usuarios por badges
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          level: true,
          totalXP: true,
          _count: {
            select: {
              userBadges: true
            }
          }
        },
        where: {
          userBadges: {
            some: {}
          }
        },
        orderBy: [
          {
            userBadges: {
              _count: 'desc'
            }
          },
          {
            totalXP: 'desc'
          }
        ],
        take: 10
      })
    ]);

    // Contar totales
    const [totalBadges, totalAchievements] = await Promise.all([
      prisma.badge.count(),
      prisma.achievement.count()
    ]);

    // Procesar estadísticas de badges por rareza
    const badgesByRarity = badgeStats.reduce((acc, stat) => {
      acc[stat.rarity] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Procesar estadísticas de achievements por tipo
    const achievementsByType = achievementStats.reduce((acc, stat) => {
      acc[stat.type] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Procesar top earners
    const processedTopEarners = topEarners.map(user => ({
      userId: user.id,
      username: user.username || 'Usuario sin nombre',
      badgeCount: user._count.userBadges,
      totalXP: user.totalXP || 0
    }));

    // Obtener estadísticas adicionales
    const additionalStats = await Promise.all([
      // Badges más populares
      prisma.userBadge.groupBy({
        by: ['badgeId'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 5
      }),
      
      // Actividades por tipo
      prisma.activity.groupBy({
        by: ['type'],
        _count: {
          id: true
        },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Última semana
          }
        }
      })
    ]);

    const [popularBadges, activityByType] = additionalStats;

    // Obtener nombres de badges populares
    const badgeIds = popularBadges.map(b => b.badgeId);
    const badgeNames = await prisma.badge.findMany({
      where: {
        id: {
          in: badgeIds
        }
      },
      select: {
        id: true,
        name: true,
        icon: true
      }
    });

    const popularBadgesWithNames = popularBadges.map(badge => {
      const badgeInfo = badgeNames.find(b => b.id === badge.badgeId);
      return {
        badgeId: badge.badgeId,
        name: badgeInfo?.name || 'Badge desconocido',
        icon: badgeInfo?.icon || '🏆',
        count: badge._count.id
      };
    });

    const activityByTypeProcessed = activityByType.reduce((acc, activity) => {
      acc[activity.type] = activity._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalBadges,
      totalAchievements,
      totalUsers: userStats,
      recentActivities: activityStats,
      badgesByRarity,
      achievementsByType,
      topEarners: processedTopEarners,
      popularBadges: popularBadgesWithNames,
      activityByType: activityByTypeProcessed,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}