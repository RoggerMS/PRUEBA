import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ClubRole } from '@/shared/types/clubs';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/clubs/[id]/join - Unirse a un club
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para unirte a un club' },
        { status: 401 }
      );
    }
    
    const clubId = params.id;
    
    if (!clubId) {
      return NextResponse.json(
        { error: 'ID de club requerido' },
        { status: 400 }
      );
    }
    
    // Verificar que el club existe
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        name: true,
        isPrivate: true,
        memberCount: true
      }
    });
    
    if (!club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar si el usuario ya es miembro
    const existingMembership = await prisma.clubMember.findFirst({
      where: {
        userId: session.user.id,
        clubId: clubId
      }
    });
    
    if (existingMembership) {
      return NextResponse.json(
        { error: 'Ya eres miembro de este club' },
        { status: 400 }
      );
    }
    
    // Para clubes privados, necesitarías implementar un sistema de invitaciones
    // Por ahora, permitimos unirse a clubes privados directamente
    if (club.isPrivate) {
      // En una implementación completa, aquí verificarías si el usuario tiene una invitación
      // return NextResponse.json(
      //   { error: 'Este club es privado. Necesitas una invitación para unirte.' },
      //   { status: 403 }
      // );
    }
    
    // Crear membresía y actualizar contador en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la membresía
      const membership = await tx.clubMember.create({
        data: {
          userId: session.user.id,
          clubId: clubId,
          role: ClubRole.MEMBER,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              level: true,
            }
          },
          club: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          }
        }
      });
      
      // Actualizar el contador de miembros
      await tx.club.update({
        where: { id: clubId },
        data: {
          memberCount: {
            increment: 1
          }
        }
      });
      
      return membership;
    });
    
    return NextResponse.json({
      message: `Te has unido exitosamente a ${club.name}`,
      membership: {
        role: result.role,
        joinedAt: result.joinedAt,
        club: result.club,
        user: result.user
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error joining club:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/clubs/[id]/join - Abandonar un club
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
    
    if (!clubId) {
      return NextResponse.json(
        { error: 'ID de club requerido' },
        { status: 400 }
      );
    }
    
    // Verificar que el usuario es miembro del club
    const membership = await prisma.clubMember.findFirst({
      where: {
        userId: session.user.id,
        clubId: clubId
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            memberCount: true
          }
        }
      }
    });
    
    if (!membership) {
      return NextResponse.json(
        { error: 'No eres miembro de este club' },
        { status: 400 }
      );
    }
    
    // Verificar si es el último admin
    if (membership.role === ClubRole.ADMIN) {
      const adminCount = await prisma.clubMember.count({
        where: {
          clubId: clubId,
          role: ClubRole.ADMIN
        }
      });
      
      if (adminCount === 1) {
        return NextResponse.json(
          { error: 'No puedes abandonar el club siendo el único administrador. Transfiere la administración a otro miembro primero.' },
          { status: 400 }
        );
      }
    }
    
    // Eliminar membresía y actualizar contador en una transacción
    await prisma.$transaction(async (tx) => {
      // Eliminar la membresía
      await tx.clubMember.delete({
        where: {
          id: membership.id
        }
      });
      
      // Actualizar el contador de miembros
      await tx.club.update({
        where: { id: clubId },
        data: {
          memberCount: {
            decrement: 1
          }
        }
      });
    });
    
    return NextResponse.json({
      message: `Has abandonado exitosamente ${membership.club.name}`
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error leaving club:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}