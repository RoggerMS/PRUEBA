import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  includeStats: z.string().nullish().transform(val => val === 'true'),
  includeActivity: z.string().nullish().transform(val => val === 'true'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const { includeStats, includeActivity } = querySchema.parse({
      includeStats: searchParams.get('includeStats'),
      includeActivity: searchParams.get('includeActivity'),
    });

    // Get user's clubs with their role
    const userClubs = await prisma.clubMember.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        club: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
            _count: {
              select: {
                posts: true,
                events: true,
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    // Transform the data to include user role
    const clubs = userClubs.map(userClub => ({
      ...userClub.club,
      userRole: userClub.role,
    }));

    let stats = null;
    if (includeStats) {
      const totalClubs = clubs.length;
      const presidingClubs = clubs.filter(club => club.userRole === 'PRESIDENT').length;
      const adminClubs = clubs.filter(club => club.userRole === 'ADMIN').length;
      const memberClubs = clubs.filter(club => club.userRole === 'MEMBER').length;
      const totalMembers = clubs.reduce((sum, club) => sum + club._count.members, 0);
      const totalPosts = clubs.reduce((sum, club) => sum + club._count.posts, 0);
      const totalEvents = clubs.reduce((sum, club) => sum + club._count.events, 0);

      stats = {
        totalClubs,
        presidingClubs,
        adminClubs,
        memberClubs,
        totalMembers,
        totalPosts,
        totalEvents,
      };
    }

    // Add recent activity if requested
    if (includeActivity) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      for (const club of clubs) {
        // Get recent posts count
        const recentPosts = await prisma.clubPost.count({
          where: {
            clubId: club.id,
            createdAt: {
              gte: oneWeekAgo,
            },
          },
        });

        // Get recent events count
        const recentEvents = await prisma.clubEvent.count({
          where: {
            clubId: club.id,
            createdAt: {
              gte: oneWeekAgo,
            },
          },
        });

        // Get new members count
        const newMembers = await prisma.clubMember.count({
          where: {
            clubId: club.id,
            joinedAt: {
              gte: oneWeekAgo,
            },
          },
        });

        (club as any).recentActivity = {
          posts: recentPosts,
          events: recentEvents,
          newMembers,
        };
      }
    }

    return NextResponse.json({
      clubs,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching user clubs:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}