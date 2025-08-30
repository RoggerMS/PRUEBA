import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para actualización de perfil
const updateProfileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario es muy largo')
    .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos')
});

// GET - Obtener información del perfil del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
        verified: true,
        role: true,
        university: true,
        career: true,
        semester: true,
        graduationYear: true,
        emailVerified: true,
        createdAt: true,
        lastActivity: true,
        // Campos de gamificación
        crolars: true,
        level: true,
        xp: true,
        streak: true,
        // Estadísticas
        _count: {
          select: {
            posts: true,
            comments: true,
            // Agregar más conteos según sea necesario
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        ...user,
        stats: {
          posts: user._count.posts,
          comments: user._count.comments
        }
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar información del perfil
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Verificar si el username ya existe (excluyendo el usuario actual)
    const existingUser = await prisma.user.findFirst({
      where: {
        username: validatedData.username,
        NOT: {
          id: session.user.id
        }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El nombre de usuario ya está en uso' },
        { status: 400 }
      );
    }

    // Actualizar el perfil del usuario
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        username: validatedData.username,
        lastActivity: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
        verified: true,
        role: true,
        university: true,
        career: true,
        lastActivity: true
      }
    });

    // Crear notificación de actualización de perfil
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'PROFILE_UPDATE',
        title: 'Perfil actualizado',
        message: 'Tu información de perfil ha sido actualizada correctamente.',
        data: {
          updatedFields: Object.keys(validatedData),
          timestamp: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      message: 'Perfil actualizado correctamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar campos específicos del perfil
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { field, value } = body;

    // Campos permitidos para actualización parcial
    const allowedFields = ['name', 'username', 'image'];
    
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { error: 'Campo no permitido para actualización' },
        { status: 400 }
      );
    }

    // Validaciones específicas por campo
    if (field === 'username') {
      if (typeof value !== 'string' || value.length < 3 || value.length > 30) {
        return NextResponse.json(
          { error: 'Nombre de usuario inválido' },
          { status: 400 }
        );
      }

      // Verificar disponibilidad del username
      const existingUser = await prisma.user.findFirst({
        where: {
          username: value,
          NOT: { id: session.user.id }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'El nombre de usuario ya está en uso' },
          { status: 400 }
        );
      }
    }

    if (field === 'name') {
      if (typeof value !== 'string' || value.length < 1 || value.length > 100) {
        return NextResponse.json(
          { error: 'Nombre inválido' },
          { status: 400 }
        );
      }
    }

    // Actualizar el campo específico
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        [field]: value,
        lastActivity: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
        verified: true,
        role: true,
        university: true,
        career: true
      }
    });

    return NextResponse.json({
      message: `${field} actualizado correctamente`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user field:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}