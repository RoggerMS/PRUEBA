import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { BadgeRarity } from '@prisma/client';

// Schema de validación para crear badge
const createBadgeSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(200),
  icon: z.string().min(1).max(100),
  rarity: z.nativeEnum(BadgeRarity),
  category: z.string().min(1).max(50),
  isActive: z.boolean().default(true)
});

// GET /api/admin/gamification/badges - Listar todos los badges
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
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity') as BadgeRarity | null;
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (rarity) {
      where.rarity = rarity;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Obtener badges con paginación
    const [badges, total] = await Promise.all([
      prisma.badge.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        },
        include: {
          _count: {
            select: {
              userBadges: true,
              achievements: true
            }
          }
        }
      }),
      prisma.badge.count({ where })
    ]);

    // Obtener estadísticas generales
    const stats = await prisma.badge.groupBy({
      by: ['rarity', 'category', 'isActive'],
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      badges,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/gamification/badges - Crear nuevo badge
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
    const validatedData = createBadgeSchema.parse(body);

    // Verificar nombre único
    const existingBadge = await prisma.badge.findFirst({
      where: {
        name: validatedData.name
      }
    });

    if (existingBadge) {
      return NextResponse.json(
        { error: 'Ya existe un badge con ese nombre' },
        { status: 400 }
      );
    }

    // Crear badge
    const newBadge = await prisma.badge.create({
      data: {
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            userBadges: true,
            achievements: true
          }
        }
      }
    });

    return NextResponse.json(newBadge, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating badge:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}