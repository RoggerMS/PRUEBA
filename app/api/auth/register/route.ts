import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimitRegister } from '@/lib/rate-limit';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  username: z.string().min(3, 'El username debe tener al menos 3 caracteres').max(20, 'El username no puede tener más de 20 caracteres'),
  displayName: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede tener más de 50 caracteres'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimitRegister(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, username, displayName } = registerSchema.parse(body);

    // Verificar si el email ya existe
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      );
    }

    // Verificar si el username ya existe
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Este username ya está en uso' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await hash(password, 12);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        displayName,
        emailVerified: null, // Se puede implementar verificación por email después
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        createdAt: true,
      }
    });

    return NextResponse.json(
      { 
        message: 'Usuario creado exitosamente',
        user 
      },
      { status: 201 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
