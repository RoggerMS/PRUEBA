import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para actualizar badge
const updateBadgeSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().min(10).max(200).optional(),
  icon: z.string().min(1).optional(),
  rarity: z.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).optional(),
  category: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional()
});

// GET /api/admin/gamification/badges/[badgeId] - Obtener badge específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ badgeId: string }> }
) {
  const { badgeId } = await params;
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

    const badge = await prisma.badge.findUnique({
      where: {
        id: badgeId
      },
      include: {
        _count: {
          select: {
            userBadges: true
          }
        }
      }
    });

    if (!badge) {
      return NextResponse.json(
        { error: 'Badge no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(badge);
  } catch (error) {
    console.error('Error fetching badge:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/gamification/badges/[badgeId] - Actualizar badge
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ badgeId: string }> }
) {
  const { badgeId } = await params;
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
    const validatedData = updateBadgeSchema.parse(body);

    // Verificar que el badge existe
    const existingBadge = await prisma.badge.findUnique({
      where: { id: badgeId }
    });

    if (!existingBadge) {
      return NextResponse.json(
        { error: 'Badge no encontrado' },
        { status: 404 }
      );
    }

    // Verificar nombre único si se está actualizando
    if (validatedData.name && validatedData.name !== existingBadge.name) {
      const nameExists = await prisma.badge.findFirst({
        where: {
          name: validatedData.name,
          id: { not: badgeId }
        }
      });

      if (nameExists) {
        return NextResponse.json(
          { error: 'Ya existe un badge con ese nombre' },
          { status: 400 }
        );
      }
    }

    // Actualizar badge
    const updatedBadge = await prisma.badge.update({
      where: {
        id: badgeId
      },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            userBadges: true
          }
        }
      }
    });

    return NextResponse.json(updatedBadge);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating badge:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/gamification/badges/[badgeId] - Eliminar badge
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ badgeId: string }> }
) {
  const { badgeId } = await params;
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
        { error: 'Solo los administradores pueden eliminar badges' },
        { status: 403 }
      );
    }

    // Verificar que el badge existe
    const existingBadge = await prisma.badge.findUnique({
      where: { id: badgeId },
      include: {
        _count: {
          select: {
            userBadges: true,
            achievements: true
          }
        }
      }
    });

    if (!existingBadge) {
      return NextResponse.json(
        { error: 'Badge no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el badge está siendo usado
    if (existingBadge._count.userBadges > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el badge porque ya ha sido otorgado a usuarios',
          suggestion: 'Considera desactivarlo en lugar de eliminarlo'
        },
        { status: 400 }
      );
    }

    if (existingBadge._count.achievements > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el badge porque está asociado a logros',
          suggestion: 'Primero elimina o modifica los logros asociados'
        },
        { status: 400 }
      );
    }

    // Eliminar badge
    await prisma.badge.delete({
      where: {
        id: badgeId
      }
    });

    return NextResponse.json(
      { message: 'Badge eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}