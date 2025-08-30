import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para crear logros
const CreateAchievementSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: z.enum(['MILESTONE', 'STREAK', 'SOCIAL', 'ACADEMIC', 'SPECIAL']),
  criteria: z.object({
    metric: z.string(),
    threshold: z.number().positive(),
    period: z.enum(['all', 'daily', 'weekly', 'monthly']).optional()
  }),
  rewards: z.object({
    crolars: z.number().int().min(0).default(0),
    xp: z.number().int().min(0).default(0),
    badge: z.string().optional()
  }),
  icon: z.string().optional(),
  rarity: z.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).default('COMMON')
});

// GET /api/gamification/achievements - Obtener logros del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true';
    const category = searchParams.get('category');

    // Obtener todos los logros disponibles
    const allAchievements = await prisma.achievement.findMany({
      where: category ? { type: category.toUpperCase() } : {},
      orderBy: [{ rarity: 'desc' }, { createdAt: 'asc' }]
    });

    // Obtener logros desbloqueados por el usuario
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: {
        achievement: true
      },
      orderBy: { unlockedAt: 'desc' }
    });

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

    // Verificar progreso hacia logros no desbloqueados
    const achievementsWithProgress = await Promise.all(
      allAchievements.map(async (achievement) => {
        const isUnlocked = unlockedIds.has(achievement.id);
        const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
        
        let progress = 0;
        if (!isUnlocked) {
          progress = await calculateAchievementProgress(session.user.id, achievement);
        }

        return {
          ...achievement,
          isUnlocked,
          unlockedAt: userAchievement?.unlockedAt || null,
          progress: isUnlocked ? 100 : progress,
          progressValue: isUnlocked ? achievement.criteria.threshold : Math.floor((progress / 100) * achievement.criteria.threshold)
        };
      })
    );

    // Filtrar según parámetros
    const filteredAchievements = includeAll 
      ? achievementsWithProgress
      : achievementsWithProgress.filter(a => a.isUnlocked);

    // Estadísticas del usuario
    const stats = {
      totalAchievements: allAchievements.length,
      unlockedAchievements: userAchievements.length,
      completionRate: Math.round((userAchievements.length / allAchievements.length) * 100),
      totalCrolarsEarned: userAchievements.reduce((sum, ua) => sum + ua.achievement.rewards.crolars, 0),
      totalXPEarned: userAchievements.reduce((sum, ua) => sum + ua.achievement.rewards.xp, 0),
      rarityBreakdown: {
        COMMON: userAchievements.filter(ua => ua.achievement.rarity === 'COMMON').length,
        RARE: userAchievements.filter(ua => ua.achievement.rarity === 'RARE').length,
        EPIC: userAchievements.filter(ua => ua.achievement.rarity === 'EPIC').length,
        LEGENDARY: userAchievements.filter(ua => ua.achievement.rarity === 'LEGENDARY').length
      }
    };

    return NextResponse.json({
      achievements: filteredAchievements,
      stats,
      recentUnlocks: userAchievements.slice(0, 5)
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/gamification/achievements - Crear nuevo logro (solo admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si el usuario es admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = CreateAchievementSchema.parse(body);

    const achievement = await prisma.achievement.create({
      data: {
        ...validatedData,
        criteria: validatedData.criteria as any,
        rewards: validatedData.rewards as any
      }
    });

    return NextResponse.json(achievement, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating achievement:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función para calcular el progreso hacia un logro
async function calculateAchievementProgress(userId: string, achievement: any): Promise<number> {
  const { metric, threshold, period } = achievement.criteria;
  
  // Calcular fecha de inicio según el período
  let dateFilter: Date | undefined;
  if (period === 'daily') {
    dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
  } else if (period === 'weekly') {
    dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === 'monthly') {
    dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  let currentValue = 0;

  try {
    switch (metric) {
      case 'notes_shared':
        currentValue = await prisma.note.count({
          where: {
            authorId: userId,
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          }
        });
        break;

      case 'questions_asked':
        currentValue = await prisma.question.count({
          where: {
            authorId: userId,
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          }
        });
        break;

      case 'answers_given':
        currentValue = await prisma.answer.count({
          where: {
            authorId: userId,
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          }
        });
        break;

      case 'likes_received':
        const likesOnPosts = await prisma.like.count({
          where: {
            post: { authorId: userId },
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          }
        });
        const likesOnAnswers = await prisma.vote.count({
          where: {
            answer: { authorId: userId },
            type: 'UP',
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          }
        });
        currentValue = likesOnPosts + likesOnAnswers;
        break;

      case 'crolars_earned':
        if (dateFilter) {
          const transactions = await prisma.crolarTransaction.aggregate({
            where: {
              userId,
              type: 'EARNED',
              createdAt: { gte: dateFilter }
            },
            _sum: { amount: true }
          });
          currentValue = transactions._sum.amount || 0;
        } else {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { crolars: true }
          });
          currentValue = user?.crolars || 0;
        }
        break;

      case 'streak_days':
        // Calcular racha de días consecutivos de actividad
        currentValue = await calculateUserStreak(userId);
        break;

      case 'helpful_answers':
        currentValue = await prisma.answer.count({
          where: {
            authorId: userId,
            isAccepted: true,
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          }
        });
        break;

      case 'note_ratings':
        const ratings = await prisma.noteRating.aggregate({
          where: {
            note: { authorId: userId },
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          },
          _avg: { rating: true }
        });
        currentValue = Math.round((ratings._avg.rating || 0) * 10); // Convertir a escala 0-50
        break;

      default:
        currentValue = 0;
    }
  } catch (error) {
    console.error(`Error calculating progress for metric ${metric}:`, error);
    currentValue = 0;
  }

  return Math.min(Math.round((currentValue / threshold) * 100), 100);
}

// Función para calcular la racha de días consecutivos
async function calculateUserStreak(userId: string): Promise<number> {
  const activities = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lastActivity: true,
      posts: {
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100
      },
      notes: {
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100
      },
      questions: {
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100
      },
      answers: {
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100
      }
    }
  });

  if (!activities) return 0;

  // Combinar todas las actividades y ordenar por fecha
  const allActivities = [
    ...activities.posts.map(p => p.createdAt),
    ...activities.notes.map(n => n.createdAt),
    ...activities.questions.map(q => q.createdAt),
    ...activities.answers.map(a => a.createdAt)
  ].sort((a, b) => b.getTime() - a.getTime());

  if (allActivities.length === 0) return 0;

  // Calcular días únicos de actividad
  const uniqueDays = new Set(
    allActivities.map(date => 
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    )
  );

  const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);
  
  let streak = 0;
  const today = new Date();
  const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < sortedDays.length; i++) {
    const expectedDay = todayTime - (i * oneDayMs);
    if (sortedDays[i] === expectedDay) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}