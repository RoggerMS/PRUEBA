import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { rateLimitForgotPassword } from '@/lib/rate-limit';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting más estricto para forgot password
    const rateLimitResult = await rateLimitForgotPassword(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Buscar el usuario por email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Por seguridad, siempre devolvemos el mismo mensaje
    // independientemente de si el usuario existe o no
    const successMessage = 'Si el email existe en nuestro sistema, recibirás un enlace de restablecimiento.';

    if (!user) {
      return NextResponse.json(
        { message: successMessage },
        { status: 200 }
      );
    }

    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Eliminar tokens anteriores del usuario
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // Crear nuevo token de restablecimiento
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: resetTokenExpiry,
      }
    });

    // TODO: Aquí se enviaría el email con el enlace de restablecimiento
    // Por ahora solo logueamos el token para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`Reset token para ${email}: ${resetToken}`);
      console.log(`URL de restablecimiento: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`);
    }

    return NextResponse.json(
      { message: successMessage },
      { status: 200 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error en forgot password:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}