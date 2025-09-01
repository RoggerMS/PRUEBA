import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date').optional(),
  location: z.string().optional(),
  isOnline: z.boolean().default(false),
  category: z.enum(['Académico', 'Tecnología', 'Arte', 'Deportivo', 'Extracurricular', 'Social']),
  maxAttendees: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  tags: z.string().optional(),
  clubId: z.string().optional(),
});

const querySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)),
  category: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['date', 'title', 'popularity']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// GET /api/events - List events with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));
    
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Build where clause for filtering
    const where: any = {};
    
    if (query.category) {
      where.category = query.category;
    }
    
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    
    if (query.startDate) {
      where.startDate = { gte: new Date(query.startDate) };
    }
    
    if (query.endDate) {
      where.startDate = { 
        ...where.startDate,
        lte: new Date(query.endDate)
      };
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (query.sortBy) {
      case 'date':
        orderBy = { startDate: query.sortOrder };
        break;
      case 'title':
        orderBy = { title: query.sortOrder };
        break;
      case 'popularity':
        orderBy = { attendances: { _count: query.sortOrder } };
        break;
    }

    const skip = (query.page - 1) * query.limit;

    // Get events with attendee count and user registration status
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
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
            select: {
              userId: true,
              status: true,
            },
          },
          _count: {
            select: {
              attendances: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    // Format events with registration status
    const formattedEvents = events.map(event => ({
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
      isRegistered: userId ? event.attendances.some(a => a.userId === userId) : false,
      organizer: event.organizer,
      club: event.club,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    const totalPages = Math.ceil(total / query.limit);

    return NextResponse.json({
      events: formattedEvents,
      total,
      page: query.page,
      totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
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

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    // Validate dates
    const startDate = new Date(validatedData.startDate);
    const endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    
    if (endDate && endDate <= startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    if (startDate <= new Date()) {
      return NextResponse.json(
        { error: 'Event must be scheduled for the future' },
        { status: 400 }
      );
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        ...validatedData,
        startDate,
        endDate,
        organizerId: session.user.id,
      },
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
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    // Award Crolars for creating event
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        crolars: {
          increment: 50, // 50 Crolars for creating an event
        },
      },
    });

    return NextResponse.json({
      success: true,
      event: {
        ...event,
        currentAttendees: event._count.attendances,
        isRegistered: false,
      },
      crolarsEarned: 50,
      message: 'Event created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid event data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}