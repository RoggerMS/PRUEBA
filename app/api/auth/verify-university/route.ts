import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para verificación universitaria
const verifyUniversitySchema = z.object({
  universityEmail: z.string().email('Email inválido'),
  university: z.string().min(1, 'Universidad requerida'),
  career: z.string().min(1, 'Carrera requerida'),
  studentId: z.string().optional(),
  graduationYear: z.number().int().min(2020).max(2030).optional()
});

// Lista de dominios universitarios válidos en Perú
const VALID_UNIVERSITY_DOMAINS = [
  'unmsm.edu.pe',
  'uni.edu.pe',
  'pucp.edu.pe',
  'ulima.edu.pe',
  'upc.edu.pe',
  'usil.edu.pe',
  'utp.edu.pe',
  'upn.edu.pe',
  'usmp.edu.pe',
  'unfv.edu.pe',
  'unac.edu.pe',
  'unjfsc.edu.pe',
  'uncp.edu.pe',
  'unsaac.edu.pe',
  'unsa.edu.pe',
  'unt.edu.pe',
  'untrm.edu.pe',
  'unh.edu.pe',
  'unheval.edu.pe',
  'uancv.edu.pe'
];

// Función para validar dominio universitario
function isValidUniversityEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return VALID_UNIVERSITY_DOMAINS.includes(domain);
}

// Función para generar código de verificación
function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// POST - Solicitar verificación universitaria
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = verifyUniversitySchema.parse(body);

    // Validar que el email sea de una universidad válida
    if (!isValidUniversityEmail(validatedData.universityEmail)) {
      return NextResponse.json(
        { error: 'El email debe ser de una universidad peruana válida' },
        { status: 400 }
      );
    }

    // Verificar que el email universitario no esté ya en uso
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.universityEmail,
        id: { not: session.user.id }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email universitario ya está registrado' },
        { status: 400 }
      );
    }

    // Generar código de verificación
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear token de verificación
    await prisma.verificationToken.create({
      data: {
        identifier: session.user.id,
        token: verificationCode,
        expires: expiresAt
      }
    });

    // Actualizar información universitaria del usuario (pendiente de verificación)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        university: validatedData.university,
        career: validatedData.career,
        graduationYear: validatedData.graduationYear,
        // Guardamos el email universitario temporalmente en un campo personalizado
        // En un sistema real, enviarías un email de verificación aquí
      }
    });

    // En un sistema real, aquí enviarías el email de verificación
    // Por ahora, simulamos el proceso
    console.log(`Código de verificación para ${validatedData.universityEmail}: ${verificationCode}`);

    return NextResponse.json({
      message: 'Código de verificación enviado a tu email universitario',
      verificationCode, // En producción, esto NO se devolvería
      expiresAt
    });

  } catch (error) {
    console.error('Error en verificación universitaria:', error);
    
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

// PUT - Confirmar verificación universitaria
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { verificationCode, universityEmail } = await request.json();

    if (!verificationCode || !universityEmail) {
      return NextResponse.json(
        { error: 'Código de verificación y email universitario requeridos' },
        { status: 400 }
      );
    }

    // Buscar token de verificación válido
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: session.user.id,
        token: verificationCode.toUpperCase(),
        expires: { gt: new Date() }
      }
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Código de verificación inválido o expirado' },
        { status: 400 }
      );
    }

    // Actualizar usuario como verificado y cambiar email principal
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: universityEmail,
        emailVerified: new Date(),
        verified: true,
        role: 'STUDENT' // Confirmar rol de estudiante
      }
    });

    // Eliminar token de verificación usado
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: session.user.id,
          token: verificationCode.toUpperCase()
        }
      }
    });

    // Crear notificación de verificación exitosa
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SYSTEM',
        title: '¡Verificación universitaria completada!',
        message: 'Tu cuenta ha sido verificada exitosamente. Ahora tienes acceso completo a todas las funcionalidades de CRUNEVO.',
        read: false
      }
    });

    // Otorgar bonus por verificación
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        crolars: { increment: 500 }, // Bonus por verificación
        xp: { increment: 100 }
      }
    });

    // Crear transacción de Crolars
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'EARNED',
        amount: 500,
        description: 'Bonus por verificación universitaria',
        category: 'VERIFICATION_BONUS'
      }
    });

    return NextResponse.json({
      message: 'Verificación universitaria completada exitosamente',
      bonusAwarded: {
        crolars: 500,
        xp: 100
      }
    });

  } catch (error) {
    console.error('Error confirmando verificación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET - Obtener estado de verificación
export async function GET(request: NextRequest) {
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
        verified: true,
        emailVerified: true,
        university: true,
        career: true,
        graduationYear: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si hay token de verificación pendiente
    const pendingVerification = await prisma.verificationToken.findFirst({
      where: {
        identifier: session.user.id,
        expires: { gt: new Date() }
      }
    });

    return NextResponse.json({
      isVerified: user.verified,
      emailVerified: !!user.emailVerified,
      university: user.university,
      career: user.career,
      graduationYear: user.graduationYear,
      email: user.email,
      hasPendingVerification: !!pendingVerification,
      isUniversityEmail: user.email ? isValidUniversityEmail(user.email) : false
    });

  } catch (error) {
    console.error('Error obteniendo estado de verificación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}