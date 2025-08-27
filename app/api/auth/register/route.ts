import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'Los apellidos son requeridos'),
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  birthDate: z.string(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'])
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    });
    
    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return NextResponse.json(
          { message: 'Ya existe una cuenta con este correo electrónico' },
          { status: 400 }
        );
      }
      if (existingUser.username === validatedData.username) {
        return NextResponse.json(
          { message: 'Este nombre de usuario ya está en uso' },
          { status: 400 }
        );
      }
    }
    
    // Hash password
    const hashedPassword = await hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: `${validatedData.firstName} ${validatedData.lastName}`.trim(),
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        birthDate: new Date(validatedData.birthDate),
        gender: validatedData.gender,
        crolars: 100, // Welcome bonus
        emailVerified: null, // Will be set when email is verified
        role: 'STUDENT'
      }
    });
    
    // Create welcome transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: 'ADMIN_ADJUSTMENT',
        amount: 1000,
        description: '¡Bienvenido a CRUNEVO! Bonus de registro'
      }
    });
    
    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM',
        title: '¡Bienvenido a CRUNEVO!',
        message: 'Tu cuenta ha sido creada exitosamente. ¡Comienza a explorar la comunidad educativa!',
        read: false
      }
    });
    
    // TODO: Send verification email using Resend
    // await sendVerificationEmail(user.email, user.id);
    
    return NextResponse.json(
      { 
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}