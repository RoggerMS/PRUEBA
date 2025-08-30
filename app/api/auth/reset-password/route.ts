import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimitResetPassword } from '@/lib/rate-limit';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimitResetPassword(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Buscar el token de restablecimiento
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Verificar si el token ha expirado
    if (resetToken.expiresAt < new Date()) {
      // Eliminar el token expirado
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });
      
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      );
    }

    // Hash de la nueva contraseña
    const hashedPassword = await hash(password, 12);

    // Actualizar la contraseña del usuario
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    });

    // Eliminar el token usado
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    });

    // Eliminar todos los tokens de restablecimiento del usuario por seguridad
    await prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId }
    });

    return NextResponse.json(
      { message: 'Contraseña restablecida exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error en reset password:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}