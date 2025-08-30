import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/gamification/catalog - Obtener catálogo de badges y logros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'badges' | 'achievements' | 'all'
    const rarity = searchParams.get('rarity'); // 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    let badges = [];
    let achievements = [];

    // Obtener badges si se solicitan
    if (!type || type === 'badges' || type === 'all') {
      const badgeWhere: any = {};
      
      if (rarity) {
        badgeWhere.rarity = rarity;
      }
      
      if (category) {
        badgeWhere.category = category;
      }

      badges = await prisma.badge.findMany({
        where: badgeWhere,
        skip: type === 'badges' ? skip : 0,
        take: type === 'badges' ? limit : undefined,
        orderBy: [
          { rarity: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          _count: {
            select: {
              userBadges: true
            }
          }
        }
      });
    }

    // Obtener achievements si se solicitan
    if (!type || type === 'achievements' || type === 'all') {
      const achievementWhere: any = {};
      
      if (category) {
        achievementWhere.category = category;
      }

      achievements = await prisma.achievement.findMany({
        where: achievementWhere,
        skip: type === 'achievements' ? skip : 0,
        take: type === 'achievements' ? limit : undefined,
        orderBy: [
          { xpReward: 'desc' },
          { createdAt: 'desc' }
        ],
        include: {
          _count: {
            select: {
              userBadges: {
                where: {
                  achievementId: {
                    not: null
                  }
                }
              }
            }
          }
        }
      });
    }

    // Obtener conteos totales para paginación
    const totalBadges = type === 'badges' || type === 'all' ? 
      await prisma.badge.count() : 0;
    const totalAchievements = type === 'achievements' || type === 'all' ? 
      await prisma.achievement.count() : 0;

    // Obtener categorías disponibles
    const badgeCategories = await prisma.badge.findMany({
      select: { category: true },
      distinct: ['category']
    });

    const achievementCategories = await prisma.achievement.findMany({
      select: { category: true },
      distinct: ['category']
    });

    const categories = [
      ...new Set([
        ...badgeCategories.map(b => b.category),
        ...achievementCategories.map(a => a.category)
      ])
    ];

    return NextResponse.json({
      badges: badges.map(badge => ({
        ...badge,
        earnedByCount: badge._count.userBadges
      })),
      achievements: achievements.map(achievement => ({
        ...achievement,
        earnedByCount: achievement._count.userBadges
      })),
      pagination: {
        page,
        limit,
        totalBadges,
        totalAchievements,
        totalPagesBadges: Math.ceil(totalBadges / limit),
        totalPagesAchievements: Math.ceil(totalAchievements / limit)
      },
      filters: {
        categories,
        rarities: ['COMMON', 'RARE', 'EPIC', 'LEGENDARY']
      }
    });

  } catch (error) {
    console.error('Error fetching gamification catalog:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/catalog - Crear nuevo badge o achievement (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar si el usuario es admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'badge') {
      const { name, description, icon, rarity, category, criteria } = data;
      
      if (!name || !description || !icon || !rarity || !category) {
        return NextResponse.json(
          { error: 'Campos requeridos: name, description, icon, rarity, category' },
          { status: 400 }
        );
      }

      const badge = await prisma.badge.create({
        data: {
          name,
          description,
          icon,
          rarity,
          category,
          criteria: criteria || {}
        }
      });

      return NextResponse.json(badge, { status: 201 });
    }

    if (type === 'achievement') {
      const { name, description, icon, category, xpReward, criteria, badgeId } = data;
      
      if (!name || !description || !icon || !category || !xpReward) {
        return NextResponse.json(
          { error: 'Campos requeridos: name, description, icon, category, xpReward' },
          { status: 400 }
        );
      }

      const achievement = await prisma.achievement.create({
        data: {
          name,
          description,
          icon,
          category,
          xpReward,
          criteria: criteria || {},
          badgeId
        }
      });

      return NextResponse.json(achievement, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Tipo no válido. Use "badge" o "achievement"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error creating gamification item:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}