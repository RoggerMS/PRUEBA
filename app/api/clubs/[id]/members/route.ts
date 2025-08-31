import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ClubRole } from '@/shared/types/clubs';

interface RouteParams {
  params: {
    id: string;
  };
}

// Schema para actualizar rol de miembro
const updateMemberSchema = z.object({
  userId: z.string().min(1, 'ID de usuario requerido'),
  action: z.enum(['promote', 'demote', 'remove'], {
    errorMap: () => ({ message: 'Acción debe ser: promote, demote, o remove' })
  }),
});

// GET /api/clubs/[id]/members - Obtener lista de miembros del club
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
    
    // Verificar que el club existe
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        name: true,
        isPrivate: true
      }
    });
    
    if (!club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar permisos para clubes privados
    let userMembership = null;
    if (session?.user?.id) {
      userMembership = await prisma.clubMember.findFirst({
        where: {
          userId: session.user.id,
          clubId: clubId
        }
      });
    }
    
    if (club.isPrivate && !userMembership) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver los miembros de este club privado' },
        { status: 403 }
      );
    }
    
    // Obtener miembros del club
    const members = await prisma.clubMember.findMany({
      where: { clubId: clubId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            level: true,
            createdAt: true,
            _count: {
              select: {
                posts: true,
                followers: true,
                following: true
              }
            }
          }
        }
      },
      orderBy: [
        { role: 'asc' }, // ADMIN primero
        { joinedAt: 'asc' }
      ]
    });
    
    return NextResponse.json({
      members: members.map(member => ({
        id: member.id,
        role: member.role,
        joinedAt: member.joinedAt,
        user: {
          ...member.user,
          postCount: member.user._count?.posts || 0,
          followerCount: member.user._count?.followers || 0,
          followingCount: member.user._count?.following || 0
        }
      })),
      userRole: userMembership?.role || null,
      canManageMembers: userMembership?.role === ClubRole.ADMIN
    });
    
  } catch (error) {
    console.error('Error fetching club members:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/clubs/[id]/members - Gestionar miembros (solo admins)
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
    const { userId, action } = updateMemberSchema.parse(body);
    
    // Verificar que el usuario actual es admin del club
    const adminMembership = await prisma.clubMember.findFirst({
      where: {
        userId: session.user.id,
        clubId: clubId,
        role: ClubRole.ADMIN
      }
    });
    
    if (!adminMembership) {
      return NextResponse.json(
        { error: 'No tienes permisos para gestionar miembros de este club' },
        { status: 403 }
      );
    }
    
    // Verificar que el miembro objetivo existe
    const targetMembership = await prisma.clubMember.findFirst({
      where: {
        userId: userId,
        clubId: clubId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        }
      }
    });
    
    if (!targetMembership) {
      return NextResponse.json(
        { error: 'El usuario no es miembro de este club' },
        { status: 404 }
      );
    }
    
    // No permitir que un admin se gestione a sí mismo
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes gestionar tu propia membresía' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'promote':
        if (targetMembership.role === ClubRole.ADMIN) {
          return NextResponse.json(
            { error: 'El usuario ya es administrador' },
            { status: 400 }
          );
        }
        
        result = await prisma.clubMember.update({
          where: { id: targetMembership.id },
          data: { role: ClubRole.ADMIN },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            }
          }
        });
        
        return NextResponse.json({
          message: `${targetMembership.user.name} ha sido promovido a administrador`,
          member: result
        });
        
      case 'demote':
        if (targetMembership.role === ClubRole.MEMBER) {
          return NextResponse.json(
            { error: 'El usuario ya es miembro regular' },
            { status: 400 }
          );
        }
        
        // Verificar que no es el último admin
        const adminCount = await prisma.clubMember.count({
          where: {
            clubId: clubId,
            role: ClubRole.ADMIN
          }
        });
        
        if (adminCount === 1) {
          return NextResponse.json(
            { error: 'No puedes degradar al único administrador del club' },
            { status: 400 }
          );
        }
        
        result = await prisma.clubMember.update({
          where: { id: targetMembership.id },
          data: { role: ClubRole.MEMBER },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            }
          }
        });
        
        return NextResponse.json({
          message: `${targetMembership.user.name} ha sido degradado a miembro regular`,
          member: result
        });
        
      case 'remove':
        // Verificar que no es el último admin si es admin
        if (targetMembership.role === ClubRole.ADMIN) {
          const adminCount = await prisma.clubMember.count({
            where: {
              clubId: clubId,
              role: ClubRole.ADMIN
            }
          });
          
          if (adminCount === 1) {
            return NextResponse.json(
              { error: 'No puedes expulsar al único administrador del club' },
              { status: 400 }
            );
          }
        }
        
        // Eliminar miembro y actualizar contador
        await prisma.$transaction(async (tx) => {
          await tx.clubMember.delete({
            where: { id: targetMembership.id }
          });
          
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
          message: `${targetMembership.user.name} ha sido expulsado del club`
        });
        
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Error managing club member:', error);
    
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