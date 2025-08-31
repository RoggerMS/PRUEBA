import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ClubsResponse, CreateClubRequest, ClubRole } from '@/shared/types/clubs';

// Schema de validación para crear club
const createClubSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(1000, 'La descripción no puede exceder 1000 caracteres'),
  category: z.string().min(1, 'La categoría es requerida'),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional().default(false),
  avatar: z.string().url().optional(),
  banner: z.string().url().optional(),
});

// Schema de validación para filtros de búsqueda
const searchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
  isPrivate: z.string().optional().transform(val => val === 'true'),
  memberCountMin: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  memberCountMax: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  sortBy: z.enum(['name', 'memberCount', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 50) : 12),
});

// GET /api/clubs - Obtener lista de clubes con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const validatedParams = searchSchema.parse(params);
    const { search, category, tags, isPrivate, memberCountMin, memberCountMax, sortBy, sortOrder, page, limit } = validatedParams;
    
    // Construir filtros de búsqueda
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      where.tags = {
        contains: tagArray.join(','),
        mode: 'insensitive'
      };
    }
    
    if (isPrivate !== undefined) {
      where.isPrivate = isPrivate;
    }
    
    if (memberCountMin !== undefined || memberCountMax !== undefined) {
      where.memberCount = {};
      if (memberCountMin !== undefined) where.memberCount.gte = memberCountMin;
      if (memberCountMax !== undefined) where.memberCount.lte = memberCountMax;
    }
    
    // Calcular offset para paginación
    const offset = (page - 1) * limit;
    
    // Obtener clubes con paginación
    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
        where,
        include: {
          members: {
            take: 3,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                  level: true,
                }
              }
            },
            orderBy: { joinedAt: 'asc' }
          },
          _count: {
            select: {
              members: true,
              posts: true,
              events: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      prisma.club.count({ where })
    ]);
    
    // Formatear respuesta
    const response: ClubsResponse = {
      clubs: clubs.map(club => ({
        ...club,
        memberCount: club._count?.members || 0,
      })),
      total,
      hasMore: offset + limit < total,
      page,
      limit,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching clubs:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parámetros de búsqueda inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/clubs - Crear nuevo club
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para crear un club' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validatedData = createClubSchema.parse(body) as CreateClubRequest;
    
    // Convertir tags array a string separado por comas
    const tagsString = validatedData.tags?.join(',') || null;
    
    // Crear club en una transacción
    const club = await prisma.$transaction(async (tx) => {
      // Crear el club
      const newClub = await tx.club.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          category: validatedData.category,
          tags: tagsString,
          isPrivate: validatedData.isPrivate || false,
          avatar: validatedData.avatar,
          banner: validatedData.banner,
          memberCount: 1, // El creador es el primer miembro
        },
      });
      
      // Agregar al creador como ADMIN del club
      await tx.clubMember.create({
        data: {
          userId: session.user.id,
          clubId: newClub.id,
          role: ClubRole.ADMIN,
        },
      });
      
      return newClub;
    });
    
    // Obtener el club completo con relaciones
    const clubWithDetails = await prisma.club.findUnique({
      where: { id: club.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                level: true,
              }
            }
          }
        },
        posts: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        events: {
          take: 3,
          where: { startDate: { gte: new Date() } },
          orderBy: { startDate: 'asc' }
        }
      },
    });
    
    return NextResponse.json(clubWithDetails, { status: 201 });
    
  } catch (error) {
    console.error('Error creating club:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de club inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}