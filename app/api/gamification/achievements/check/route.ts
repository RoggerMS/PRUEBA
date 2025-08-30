import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/gamification/achievements/check - Verificar y desbloquear logros
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const newlyUnlocked = await checkAndUnlockAchievements(userId);

    return NextResponse.json({
      success: true,
      newlyUnlocked,
      count: newlyUnlocked.length
    });

  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función principal para verificar y desbloquear logros
export async function checkAndUnlockAchievements(userId: string) {
  const newlyUnlocked = [];

  try {
    // Obtener logros no desbloqueados por el usuario
    const unlockedAchievementIds = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true }
    }).then(results => results.map(r => r.achievementId));

    const availableAchievements = await prisma.achievement.findMany({
      where: {
        id: { notIn: unlockedAchievementIds }
      }
    });

    // Verificar cada logro disponible
    for (const achievement of availableAchievements) {
      const isEligible = await checkAchievementEligibility(userId, achievement);
      
      if (isEligible) {
        // Desbloquear el logro
        const userAchievement = await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            unlockedAt: new Date()
          },
          include: {
            achievement: true
          }
        });

        // Otorgar recompensas
        await grantAchievementRewards(userId, achievement);

        // Crear notificación
        await createAchievementNotification(userId, achievement);

        newlyUnlocked.push(userAchievement);
      }
    }

    return newlyUnlocked;

  } catch (error) {
    console.error('Error in checkAndUnlockAchievements:', error);
    return [];
  }
}

// Verificar si un usuario es elegible para un logro específico
async function checkAchievementEligibility(userId: string, achievement: any): Promise<boolean> {
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
            rating: { gte: 4 }, // Solo ratings altos
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          },
          _count: { rating: true }
        });
        currentValue = ratings._count.rating || 0;
        break;

      case 'forum_participation':
        const posts = await prisma.post.count({
          where: {
            authorId: userId,
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          }
        });
        const questions = await prisma.question.count({
          where: {
            authorId: userId,
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          }
        });
        const answers = await prisma.answer.count({
          where: {
            authorId: userId,
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          }
        });
        currentValue = posts + questions + answers;
        break;

      case 'marketplace_sales':
        currentValue = await prisma.marketplaceTransaction.count({
          where: {
            sellerId: userId,
            status: 'COMPLETED',
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          }
        });
        break;

      case 'profile_completion':
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            name: true,
            image: true,
            bio: true,
            career: true,
            university: true,
            semester: true
          }
        });
        
        if (!user) return false;
        
        const completedFields = [
          user.name,
          user.image,
          user.bio,
          user.career,
          user.university,
          user.semester
        ].filter(field => field && field.trim().length > 0).length;
        
        currentValue = Math.round((completedFields / 6) * 100);
        break;

      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking eligibility for metric ${metric}:`, error);
    return false;
  }

  return currentValue >= threshold;
}

// Otorgar recompensas por logro desbloqueado
async function grantAchievementRewards(userId: string, achievement: any) {
  const { crolars, xp } = achievement.rewards;

  if (crolars > 0 || xp > 0) {
    // Actualizar Crolars y XP del usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        crolars: { increment: crolars },
        xp: { increment: xp }
      }
    });

    // Crear transacción de Crolars si aplica
    if (crolars > 0) {
      await prisma.crolarTransaction.create({
        data: {
          userId,
          type: 'EARNED',
          amount: crolars,
          description: `Logro desbloqueado: ${achievement.name}`,
          metadata: {
            achievementId: achievement.id,
            source: 'achievement'
          }
        }
      });
    }

    // Verificar si subió de nivel
    const newLevel = Math.floor(updatedUser.xp / 1000) + 1;
    if (newLevel > updatedUser.level) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel }
      });

      // Crear notificación de subida de nivel
      await prisma.notification.create({
        data: {
          userId,
          type: 'LEVEL_UP',
          title: '¡Subiste de nivel!',
          message: `¡Felicidades! Ahora eres nivel ${newLevel}`,
          metadata: {
            newLevel,
            oldLevel: updatedUser.level
          }
        }
      });
    }
  }
}

// Crear notificación de logro desbloqueado
async function createAchievementNotification(userId: string, achievement: any) {
  await prisma.notification.create({
    data: {
      userId,
      type: 'ACHIEVEMENT_UNLOCKED',
      title: '¡Logro desbloqueado!',
      message: `Has desbloqueado: ${achievement.name}`,
      metadata: {
        achievementId: achievement.id,
        achievementName: achievement.name,
        achievementRarity: achievement.rarity,
        rewards: achievement.rewards
      }
    }
  });
}

// Función para calcular la racha de días consecutivos (reutilizada)
async function calculateUserStreak(userId: string): Promise<number> {
  const activities = await prisma.user.findUnique({
    where: { id: userId },
    select: {
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

  const allActivities = [
    ...activities.posts.map(p => p.createdAt),
    ...activities.notes.map(n => n.createdAt),
    ...activities.questions.map(q => q.createdAt),
    ...activities.answers.map(a => a.createdAt)
  ].sort((a, b) => b.getTime() - a.getTime());

  if (allActivities.length === 0) return 0;

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