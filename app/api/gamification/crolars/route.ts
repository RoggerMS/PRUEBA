import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para transacciones de Crolars
const CrolarTransactionSchema = z.object({
  amount: z.number().int().positive(),
  type: z.enum(['EARNED', 'SPENT', 'BONUS', 'PENALTY']),
  description: z.string().min(1).max(255),
  relatedId: z.string().optional(),
  relatedType: z.enum(['POST', 'NOTE', 'QUESTION', 'ANSWER', 'PURCHASE', 'REWARD']).optional()
});

// GET /api/gamification/crolars - Obtener balance y historial de Crolars
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');

    // Obtener usuario con balance actual
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        crolars: true,
        level: true,
        xp: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Construir filtros para el historial
    const whereClause: any = {
      userId: session.user.id
    };

    if (type && ['EARNED', 'SPENT', 'BONUS', 'PENALTY'].includes(type)) {
      whereClause.type = type;
    }

    // Obtener historial de transacciones
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          amount: true,
          type: true,
          description: true,
          relatedId: true,
          relatedType: true,
          createdAt: true
        }
      }),
      prisma.transaction.count({ where: whereClause })
    ]);

    // Calcular estadísticas
    const stats = await prisma.transaction.groupBy({
      by: ['type'],
      where: { userId: session.user.id },
      _sum: { amount: true },
      _count: { _all: true }
    });

    const statsFormatted = stats.reduce((acc, stat) => {
      acc[stat.type] = {
        total: stat._sum.amount || 0,
        count: stat._count._all
      };
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return NextResponse.json({
      user: {
        id: user.id,
        crolars: user.crolars,
        level: user.level,
        xp: user.xp
      },
      transactions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats: statsFormatted
    });

  } catch (error) {
    console.error('Error fetching crolars data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/crolars - Crear transacción de Crolars
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CrolarTransactionSchema.parse(body);

    // Verificar si el usuario tiene suficientes Crolars para gastos
    if (validatedData.type === 'SPENT') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { crolars: true }
      });

      if (!user || user.crolars < validatedData.amount) {
        return NextResponse.json(
          { error: 'Crolars insuficientes' },
          { status: 400 }
        );
      }
    }

    // Crear transacción y actualizar balance en una transacción de DB
    const result = await prisma.$transaction(async (tx) => {
      // Crear registro de transacción
      const transaction = await tx.transaction.create({
        data: {
          userId: session.user.id,
          amount: validatedData.amount,
          type: validatedData.type,
          description: validatedData.description,
          relatedId: validatedData.relatedId,
          relatedType: validatedData.relatedType
        }
      });

      // Calcular nuevo balance
      let balanceChange = 0;
      switch (validatedData.type) {
        case 'EARNED':
        case 'BONUS':
          balanceChange = validatedData.amount;
          break;
        case 'SPENT':
        case 'PENALTY':
          balanceChange = -validatedData.amount;
          break;
      }

      // Actualizar balance del usuario
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          crolars: {
            increment: balanceChange
          },
          lastActivity: new Date()
        },
        select: {
          id: true,
          crolars: true,
          level: true,
          xp: true
        }
      });

      return { transaction, user: updatedUser };
    });

    // Crear notificación para transacciones importantes
    if (validatedData.amount >= 100) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'GAMIFICATION',
          title: validatedData.type === 'EARNED' || validatedData.type === 'BONUS' 
            ? '🪙 ¡Crolars ganados!' 
            : '🪙 Crolars utilizados',
          message: `${validatedData.type === 'EARNED' || validatedData.type === 'BONUS' ? '+' : '-'}${validatedData.amount} Crolars - ${validatedData.description}`,
          read: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      user: result.user
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating crolar transaction:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}