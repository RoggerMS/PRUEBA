import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para parámetros de ranking
const RankingQuerySchema = z.object({
  type: z.enum(['crolars', 'xp', 'level', 'reputation', 'notes', 'questions', 'answers']).default('crolars'),
  period: z.enum(['all', 'month', 'week']).default('all'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20)
});

// GET /api/gamification/rankings - Obtener rankings de usuarios
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      type: searchParams.get('type') || 'crolars',
      period: searchParams.get('period') || 'all',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20'
    };

    const validatedParams = RankingQuerySchema.parse(queryParams);
    const { type, period, page, limit } = validatedParams;

    // Calcular fecha de inicio según el período
    let dateFilter: Date | undefined;
    if (period === 'week') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    let rankings: any[] = [];
    let currentUserRank: any = null;

    switch (type) {
      case 'crolars':
        rankings = await getCrolarsRanking(page, limit, dateFilter);
        currentUserRank = await getCurrentUserCrolarsRank(session.user.id, dateFilter);
        break;
      
      case 'xp':
      case 'level':
        rankings = await getXPLevelRanking(type, page, limit);
        currentUserRank = await getCurrentUserXPLevelRank(session.user.id, type);
        break;
      
      case 'reputation':
        rankings = await getReputationRanking(page, limit, dateFilter);
        currentUserRank = await getCurrentUserReputationRank(session.user.id, dateFilter);
        break;
      
      case 'notes':
        rankings = await getNotesRanking(page, limit, dateFilter);
        currentUserRank = await getCurrentUserNotesRank(session.user.id, dateFilter);
        break;
      
      case 'questions':
      case 'answers':
        rankings = await getForumRanking(type, page, limit, dateFilter);
        currentUserRank = await getCurrentUserForumRank(session.user.id, type, dateFilter);
        break;
    }

    // Obtener estadísticas generales
    const totalUsers = await prisma.user.count({
      where: {
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({
      rankings,
      currentUser: currentUserRank,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      },
      metadata: {
        type,
        period,
        totalUsers,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching rankings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Funciones auxiliares para diferentes tipos de ranking

async function getCrolarsRanking(page: number, limit: number, dateFilter?: Date) {
  const whereClause = dateFilter ? {
    status: 'ACTIVE',
    lastActivity: { gte: dateFilter }
  } : {
    status: 'ACTIVE'
  };

  return await prisma.user.findMany({
    where: whereClause,
    orderBy: { crolars: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      crolars: true,
      level: true,
      xp: true,
      career: true,
      university: true,
      lastActivity: true
    }
  });
}

async function getCurrentUserCrolarsRank(userId: string, dateFilter?: Date) {
  const whereClause = dateFilter ? {
    status: 'ACTIVE',
    lastActivity: { gte: dateFilter }
  } : {
    status: 'ACTIVE'
  };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { crolars: true }
  });

  if (!user) return null;

  const rank = await prisma.user.count({
    where: {
      ...whereClause,
      crolars: { gt: user.crolars }
    }
  });

  return { rank: rank + 1, value: user.crolars };
}

async function getXPLevelRanking(type: 'xp' | 'level', page: number, limit: number) {
  return await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    orderBy: type === 'xp' ? { xp: 'desc' } : { level: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      level: true,
      xp: true,
      crolars: true,
      career: true,
      university: true,
      lastActivity: true
    }
  });
}

async function getCurrentUserXPLevelRank(userId: string, type: 'xp' | 'level') {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true }
  });

  if (!user) return null;

  const value = type === 'xp' ? user.xp : user.level;
  const rank = await prisma.user.count({
    where: {
      status: 'ACTIVE',
      [type]: { gt: value }
    }
  });

  return { rank: rank + 1, value };
}

async function getReputationRanking(page: number, limit: number, dateFilter?: Date) {
  // Calcular reputación basada en likes, respuestas aceptadas, etc.
  const users = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      career: true,
      university: true,
      lastActivity: true,
      _count: {
        select: {
          posts: true,
          notes: true,
          questions: true,
          answers: true
        }
      }
    }
  });

  // Calcular reputación para cada usuario
  const usersWithReputation = await Promise.all(
    users.map(async (user) => {
      const [postLikes, noteLikes, answerVotes] = await Promise.all([
        prisma.like.count({
          where: {
            post: { authorId: user.id },
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          }
        }),
        prisma.noteRating.aggregate({
          where: {
            note: { authorId: user.id },
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          },
          _sum: { rating: true }
        }),
        prisma.vote.count({
          where: {
            answer: { authorId: user.id },
            type: 'UP',
            ...(dateFilter && { createdAt: { gte: dateFilter } })
          }
        })
      ]);

      const reputation = postLikes * 2 + (noteLikes._sum.rating || 0) * 5 + answerVotes * 10;
      
      return {
        ...user,
        reputation
      };
    })
  );

  return usersWithReputation.sort((a, b) => b.reputation - a.reputation);
}

async function getCurrentUserReputationRank(userId: string, dateFilter?: Date) {
  // Implementación similar a getReputationRanking pero para un usuario específico
  const [postLikes, noteLikes, answerVotes] = await Promise.all([
    prisma.like.count({
      where: {
        post: { authorId: userId },
        ...(dateFilter && { createdAt: { gte: dateFilter } })
      }
    }),
    prisma.noteRating.aggregate({
      where: {
        note: { authorId: userId },
        ...(dateFilter && { createdAt: { gte: dateFilter } })
      },
      _sum: { rating: true }
    }),
    prisma.vote.count({
      where: {
        answer: { authorId: userId },
        type: 'UP',
        ...(dateFilter && { createdAt: { gte: dateFilter } })
      }
    })
  ]);

  const userReputation = postLikes * 2 + (noteLikes._sum.rating || 0) * 5 + answerVotes * 10;
  
  // Calcular cuántos usuarios tienen más reputación
  const allUsers = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true }
  });

  let betterCount = 0;
  for (const user of allUsers) {
    if (user.id === userId) continue;
    
    const [userPostLikes, userNoteLikes, userAnswerVotes] = await Promise.all([
      prisma.like.count({
        where: {
          post: { authorId: user.id },
          ...(dateFilter && { createdAt: { gte: dateFilter } })
        }
      }),
      prisma.noteRating.aggregate({
        where: {
          note: { authorId: user.id },
          ...(dateFilter && { createdAt: { gte: dateFilter } })
        },
        _sum: { rating: true }
      }),
      prisma.vote.count({
        where: {
          answer: { authorId: user.id },
          type: 'UP',
          ...(dateFilter && { createdAt: { gte: dateFilter } })
        }
      })
    ]);

    const otherReputation = userPostLikes * 2 + (userNoteLikes._sum.rating || 0) * 5 + userAnswerVotes * 10;
    if (otherReputation > userReputation) {
      betterCount++;
    }
  }

  return { rank: betterCount + 1, value: userReputation };
}

async function getNotesRanking(page: number, limit: number, dateFilter?: Date) {
  const whereClause = dateFilter ? {
    status: 'ACTIVE',
    notes: {
      some: {
        createdAt: { gte: dateFilter }
      }
    }
  } : {
    status: 'ACTIVE'
  };

  return await prisma.user.findMany({
    where: whereClause,
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      career: true,
      university: true,
      lastActivity: true,
      _count: {
        select: {
          notes: dateFilter ? {
            where: { createdAt: { gte: dateFilter } }
          } : true
        }
      }
    },
    orderBy: {
      notes: {
        _count: 'desc'
      }
    }
  });
}

async function getCurrentUserNotesRank(userId: string, dateFilter?: Date) {
  const noteCount = await prisma.note.count({
    where: {
      authorId: userId,
      ...(dateFilter && { createdAt: { gte: dateFilter } })
    }
  });

  const rank = await prisma.user.count({
    where: {
      status: 'ACTIVE',
      notes: {
        some: dateFilter ? {
          createdAt: { gte: dateFilter }
        } : {}
      }
    },
    orderBy: {
      notes: {
        _count: 'desc'
      }
    }
  });

  return { rank: rank + 1, value: noteCount };
}

async function getForumRanking(type: 'questions' | 'answers', page: number, limit: number, dateFilter?: Date) {
  const field = type === 'questions' ? 'questions' : 'answers';
  
  const whereClause = dateFilter ? {
    status: 'ACTIVE',
    [field]: {
      some: {
        createdAt: { gte: dateFilter }
      }
    }
  } : {
    status: 'ACTIVE'
  };

  return await prisma.user.findMany({
    where: whereClause,
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      career: true,
      university: true,
      lastActivity: true,
      _count: {
        select: {
          [field]: dateFilter ? {
            where: { createdAt: { gte: dateFilter } }
          } : true
        }
      }
    },
    orderBy: {
      [field]: {
        _count: 'desc'
      }
    }
  });
}

async function getCurrentUserForumRank(userId: string, type: 'questions' | 'answers', dateFilter?: Date) {
  const model = type === 'questions' ? prisma.question : prisma.answer;
  
  const count = await model.count({
    where: {
      authorId: userId,
      ...(dateFilter && { createdAt: { gte: dateFilter } })
    }
  });

  const field = type === 'questions' ? 'questions' : 'answers';
  const betterUsersCount = await prisma.user.count({
    where: {
      status: 'ACTIVE',
      [field]: {
        some: dateFilter ? {
          createdAt: { gte: dateFilter }
        } : {}
      }
    }
  });

  return { rank: betterUsersCount + 1, value: count };
}