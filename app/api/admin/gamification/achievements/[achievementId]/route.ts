import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para actualizar achievement
const updateAchievementSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().min(10).max(200).optional(),
  type: z.string().min(1).optional(),
  targetValue: z.number().min(1).max(1000000).optional(),
  xpReward: z.number().min(0).max(10000).optional(),
  crolarsReward: z.number().min(0).max(10000).optional(),
  badgeId: z.string().optional().nullable(),
  isActive: z.boolean().optional()
});

// GET /api/admin/gamification/achievements/[achievementId] - Obtener achievement específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ achievementId: string }> }
) {
  const { achievementId } = await params;
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

    const achievement = await prisma.achievement.findUnique({
      where: {
        id: achievementId
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

    if (!achievement) {
      return NextResponse.json(
        { error: 'Logro no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(achievement);
  } catch (error) {
    console.error('Error fetching achievement:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/gamification/achievements/[achievementId] - Actualizar achievement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ achievementId: string }> }
) {
  const { achievementId } = await params;
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
    const validatedData = updateAchievementSchema.parse(body);

    // Verificar que el achievement existe
    const existingAchievement = await prisma.achievement.findUnique({
      where: { id: achievementId }
    });

    if (!existingAchievement) {
      return NextResponse.json(
        { error: 'Logro no encontrado' },
        { status: 404 }
      );
    }

    // Verificar nombre único si se está actualizando
    if (validatedData.name && validatedData.name !== existingAchievement.name) {
      const nameExists = await prisma.achievement.findFirst({
        where: {
          name: validatedData.name,
          id: { not: achievementId }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'Ya existe un logro con ese nombre' },
          { status: 400 }
        );
      }
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

    // Actualizar achievement
    const updatedAchievement = await prisma.achievement.update({
      where: {
        id: achievementId
      },
      data: {
        ...validatedData,
        badgeId: validatedData.badgeId || null,
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

    return NextResponse.json(updatedAchievement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/gamification/achievements/[achievementId] - Eliminar achievement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ achievementId: string }> }
) {
  const { achievementId } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos de administrador
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo los administradores pueden eliminar logros' },
        { status: 403 }
      );
    }

    // Verificar que el achievement existe
    const existingAchievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
      include: {
        _count: {
          select: {
            userBadges: true
          }
        }
      }
    });

    if (!existingAchievement) {
      return NextResponse.json(
        { error: 'Logro no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el achievement está siendo usado
    if (existingAchievement._count.userBadges > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el logro porque ya ha sido completado por usuarios',
          suggestion: 'Considera desactivarlo en lugar de eliminarlo'
        },
        { status: 400 }
      );
    }

    // Eliminar achievement
    await prisma.achievement.delete({
      where: {
        id: achievementId
      }
    });

    return NextResponse.json(
      { message: 'Logro eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}