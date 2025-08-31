import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ClubRole } from '@/shared/types/clubs';

// Schema de validación para actualizar club
const updateClubSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
  avatar: z.string().url().optional(),
  banner: z.string().url().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/clubs/[id] - Obtener detalles de un club específico
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    const clubId = params.id;
    
    if (!clubId) {
      return NextResponse.json(
        { error: 'ID de club requerido' },
        { status: 400 }
      );
    }
    
    // Obtener club con todas las relaciones
    const club = await prisma.club.findUnique({
      where: { id: clubId },
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
                createdAt: true,
              }
            }
          },
          orderBy: [
            { role: 'asc' }, // ADMIN primero, luego MEMBER
            { joinedAt: 'asc' }
          ]
        },
        posts: {
          take: 10,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                level: true,
              }
            },
            _count: {
              select: {
                likes: true,
                comments: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        events: {
          where: {
            startDate: { gte: new Date() }
          },
          take: 5,
          orderBy: { startDate: 'asc' }
        },
        _count: {
          select: {
            members: true,
            posts: true,
            events: true
          }
        }
      },
    });
    
    if (!club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar si el club es privado y el usuario no es miembro
    let userMembership = null;
    if (session?.user?.id) {
      userMembership = club.members.find(member => member.userId === session.user.id);
    }
    
    if (club.isPrivate && !userMembership) {
      return NextResponse.json(
        { error: 'Este club es privado' },
        { status: 403 }
      );
    }
    
    // Agregar información de membresía del usuario actual
    const clubWithUserInfo = {
      ...club,
      memberCount: club._count?.members || 0,
      userMembership: userMembership ? {
        role: userMembership.role,
        joinedAt: userMembership.joinedAt,
        isMember: true,
        isAdmin: userMembership.role === ClubRole.ADMIN
      } : {
        isMember: false,
        isAdmin: false
      }
    };
    
    return NextResponse.json(clubWithUserInfo);
    
  } catch (error) {
    console.error('Error fetching club details:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/clubs/[id] - Actualizar club (solo admins)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión' },
        { status: 401 }
      );
    }
    
    const clubId = params.id;
    const body = await request.json();
    const validatedData = updateClubSchema.parse(body);
    
    // Verificar que el usuario es admin del club
    const membership = await prisma.clubMember.findFirst({
      where: {
        userId: session.user.id,
        clubId: clubId,
        role: ClubRole.ADMIN
      }
    });
    
    if (!membership) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este club' },
        { status: 403 }
      );
    }
    
    // Convertir tags array a string si existe
    const updateData: any = { ...validatedData };
    if (validatedData.tags) {
      updateData.tags = validatedData.tags.join(',');
    }
    
    // Actualizar club
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: updateData,
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
        _count: {
          select: {
            members: true,
            posts: true,
            events: true
          }
        }
      },
    });
    
    return NextResponse.json({
      ...updatedClub,
      memberCount: updatedClub._count?.members || 0
    });
    
  } catch (error) {
    console.error('Error updating club:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/clubs/[id] - Eliminar club (solo admins)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión' },
        { status: 401 }
      );
    }
    
    const clubId = params.id;
    
    // Verificar que el usuario es admin del club
    const membership = await prisma.clubMember.findFirst({
      where: {
        userId: session.user.id,
        clubId: clubId,
        role: ClubRole.ADMIN
      }
    });
    
    if (!membership) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este club' },
        { status: 403 }
      );
    }
    
    // Eliminar club y todas sus relaciones (cascade)
    await prisma.club.delete({
      where: { id: clubId }
    });
    
    return NextResponse.json(
      { message: 'Club eliminado exitosamente' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error deleting club:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}