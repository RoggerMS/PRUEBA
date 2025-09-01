import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  startDate: z.string().datetime('Invalid start date').optional(),
  endDate: z.string().datetime('Invalid end date').optional(),
  location: z.string().optional(),
  isOnline: z.boolean().optional(),
  category: z.enum(['Académico', 'Tecnología', 'Arte', 'Deportivo', 'Extracurricular', 'Social']).optional(),
  maxAttendees: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  tags: z.string().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
          },
        },
        attendances: {
          select: {
            userId: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const formattedEvent = {
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
      canEdit: userId === event.organizerId,
      organizer: event.organizer,
      club: event.club,
      attendees: event.attendances.map(a => ({
        ...a.user,
        status: a.status,
      })),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };

    return NextResponse.json({ event: formattedEvent });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if event exists and user is the organizer
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
      select: { organizerId: true, startDate: true },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (existingEvent.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to edit this event' },
        { status: 403 }
      );
    }

    // Check if event has already started
    if (existingEvent.startDate <= new Date()) {
      return NextResponse.json(
        { error: 'Cannot edit event that has already started' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    // Validate dates if provided
    if (validatedData.startDate || validatedData.endDate) {
      const startDate = validatedData.startDate ? new Date(validatedData.startDate) : existingEvent.startDate;
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
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
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

    return NextResponse.json({
      success: true,
      event: {
        ...updatedEvent,
        currentAttendees: updatedEvent._count.attendances,
        isRegistered: false,
        canEdit: true,
      },
      message: 'Event updated successfully',
    });
  } catch (error) {
    console.error('Error updating event:', error);
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

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if event exists and user is the organizer
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
      select: { 
        organizerId: true, 
        startDate: true,
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (existingEvent.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this event' },
        { status: 403 }
      );
    }

    // Check if event has already started
    if (existingEvent.startDate <= new Date()) {
      return NextResponse.json(
        { error: 'Cannot delete event that has already started' },
        { status: 400 }
      );
    }

    // Check if there are registered attendees
    if (existingEvent._count.attendances > 0) {
      return NextResponse.json(
        { error: 'Cannot delete event with registered attendees. Please contact attendees first.' },
        { status: 400 }
      );
    }

    // Delete event
    await prisma.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}