import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para crear achievement
const createAchievementSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(200),
  type: z.string().min(1).max(50),
  targetValue: z.number().min(1).max(1000000),
  xpReward: z.number().min(0).max(10000),
  crolarsReward: z.number().min(0).max(10000),
  badgeId: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
});

// GET /api/admin/gamification/achievements - Listar todos los achievements
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const hasBadge = searchParams.get('hasBadge');

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    
    if (hasBadge !== null) {
      if (hasBadge === 'true') {
        where.badgeId = { not: null };
      } else if (hasBadge === 'false') {
        where.badgeId = null;
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Obtener achievements con paginación
    const [achievements, total] = await Promise.all([
      prisma.achievement.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        },
        include: {
          badge: {
            select: {
              id: true,
              name: true,
              icon: true,
              rarity: true
            }
          },
          _count: {
            select: {
              userBadges: true
            }
          }
        }
      }),
      prisma.achievement.count({ where })
    ]);

    // Obtener estadísticas generales
    const stats = await prisma.achievement.groupBy({
      by: ['type', 'isActive'],
      _count: {
        id: true
      },
      _avg: {
        targetValue: true,
        xpReward: true,
        crolarsReward: true
      }
    });

    // Obtener tipos únicos
    const types = await prisma.achievement.findMany({
      select: {
        type: true
      },
      distinct: ['type'],
      orderBy: {
        type: 'asc'
      }
    });

    return NextResponse.json({
      achievements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats,
      types: types.map(t => t.type)
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/gamification/achievements - Crear nuevo achievement
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = createAchievementSchema.parse(body);

    // Verificar nombre único
    const existingAchievement = await prisma.achievement.findFirst({
      where: {
        name: validatedData.name
      }
    });

    if (existingAchievement) {
      return NextResponse.json(
        { error: 'Ya existe un logro con ese nombre' },
        { status: 400 }
      );
    }

    // Verificar que el badge existe si se proporciona
    if (validatedData.badgeId) {
      const badgeExists = await prisma.badge.findUnique({
        where: { id: validatedData.badgeId }
      });

      if (!badgeExists) {
        return NextResponse.json(
          { error: 'El badge especificado no existe' },
          { status: 400 }
        );
      }
    }

    // Crear achievement
    const newAchievement = await prisma.achievement.create({
      data: {
        ...validatedData,
        badgeId: validatedData.badgeId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        badge: {
          select: {
            id: true,
            name: true,
            icon: true,
            rarity: true
          }
        },
        _count: {
          select: {
            userBadges: true
          }
        }
      }
    });

    return NextResponse.json(newAchievement, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating achievement:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}