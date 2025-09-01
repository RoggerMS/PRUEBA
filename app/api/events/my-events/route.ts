import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  type: z.enum(['registered', 'organized', 'past', 'all']).default('all'),
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)),
});

// GET /api/events/my-events - Get user's events
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));
    const userId = session.user.id;
    const now = new Date();

    const skip = (query.page - 1) * query.limit;

    let registeredEvents = [];
    let organizedEvents = [];
    let pastEvents = [];

    // Get registered events (where user is attendee)
    if (query.type === 'registered' || query.type === 'all') {
      const registeredData = await prisma.event.findMany({
        where: {
          attendances: {
            some: {
              userId,
            },
          },
          startDate: {
            gte: now, // Only future events
          },
        },
        orderBy: {
          startDate: 'asc',
        },
        skip: query.type === 'registered' ? skip : 0,
        take: query.type === 'registered' ? query.limit : undefined,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          club: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          attendances: {
            where: {
              userId,
            },
            select: {
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              attendances: true,
            },
          },
        },
      });

      registeredEvents = registeredData.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        isOnline: event.isOnline,
        category: event.category,
        tags: event.tags,
        maxAttendees: event.maxAttendees,
        currentAttendees: event._count.attendances,
        imageUrl: event.imageUrl,
        isRegistered: true,
        registrationStatus: event.attendances[0]?.status,
        registeredAt: event.attendances[0]?.createdAt,
        organizer: event.organizer,
        club: event.club,
        createdAt: event.createdAt,
      }));
    }

    // Get organized events (where user is organizer)
    if (query.type === 'organized' || query.type === 'all') {
      const organizedData = await prisma.event.findMany({
        where: {
          organizerId: userId,
          startDate: {
            gte: now, // Only future events
          },
        },
        orderBy: {
          startDate: 'asc',
        },
        skip: query.type === 'organized' ? skip : 0,
        take: query.type === 'organized' ? query.limit : undefined,
        include: {
          club: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              attendances: true,
            },
          },
        },
      });

      organizedEvents = organizedData.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        isOnline: event.isOnline,
        category: event.category,
        tags: event.tags,
        maxAttendees: event.maxAttendees,
        currentAttendees: event._count.attendances,
        imageUrl: event.imageUrl,
        isOrganizer: true,
        club: event.club,
        createdAt: event.createdAt,
      }));
    }

    // Get past events (both registered and organized)
    if (query.type === 'past' || query.type === 'all') {
      const pastData = await prisma.event.findMany({
        where: {
          OR: [
            {
              organizerId: userId,
            },
            {
              attendances: {
                some: {
                  userId,
                },
              },
            },
          ],
          startDate: {
            lt: now, // Only past events
          },
        },
        orderBy: {
          startDate: 'desc',
        },
        skip: query.type === 'past' ? skip : 0,
        take: query.type === 'past' ? query.limit : undefined,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          club: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          attendances: {
            where: {
              userId,
            },
            select: {
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              attendances: true,
            },
          },
        },
      });

      pastEvents = pastData.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        isOnline: event.isOnline,
        category: event.category,
        tags: event.tags,
        maxAttendees: event.maxAttendees,
        currentAttendees: event._count.attendances,
        imageUrl: event.imageUrl,
        isRegistered: event.attendances.length > 0,
        isOrganizer: event.organizerId === userId,
        registrationStatus: event.attendances[0]?.status,
        organizer: event.organizer,
        club: event.club,
        createdAt: event.createdAt,
      }));
    }

    // Get user statistics
    const stats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: {
            eventsOrganized: true,
            eventAttendances: true,
          },
        },
      },
    });

    const response: any = {
      stats: {
        totalOrganized: stats?._count.eventsOrganized || 0,
        totalAttended: stats?._count.eventAttendances || 0,
        upcomingRegistered: registeredEvents.length,
        upcomingOrganized: organizedEvents.length,
      },
    };

    // Return data based on query type
    switch (query.type) {
      case 'registered':
        response.events = registeredEvents;
        response.total = registeredEvents.length;
        break;
      case 'organized':
        response.events = organizedEvents;
        response.total = organizedEvents.length;
        break;
      case 'past':
        response.events = pastEvents;
        response.total = pastEvents.length;
        break;
      default: // 'all'
        response.registered = registeredEvents;
        response.organized = organizedEvents;
        response.past = pastEvents.slice(0, 5); // Limit past events in 'all' view
        break;
    }

    if (query.type !== 'all') {
      const totalPages = Math.ceil((response.total || 0) / query.limit);
      response.page = query.page;
      response.totalPages = totalPages;
      response.hasNext = query.page < totalPages;
      response.hasPrev = query.page > 1;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user events:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}