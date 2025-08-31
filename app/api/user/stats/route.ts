import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const stats = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        crolars: true,
        level: true,
        xp: true,
        _count: {
          select: {
            notes: true,
            answers: true,
          },
        },
      },
    });

    const level = stats?.level ?? 1;
    const xp = stats?.xp ?? 0;
    const xpToNext = level * 100 - xp;

    return NextResponse.json({
      crolars: stats?.crolars ?? 0,
      level,
      xp,
      xpToNext,
      notesShared: stats?._count.notes ?? 0,
      questionsAnswered: stats?._count.answers ?? 0,
      reputation: 0,
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
