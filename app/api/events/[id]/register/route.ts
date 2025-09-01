import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/events/[id]/register - Register for event
export async function POST(
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

    const userId = session.user.id;
    const eventId = params.id;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
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

    // Check if event has already started
    if (event.startDate <= new Date()) {
      return NextResponse.json(
        { error: 'Cannot register for event that has already started' },
        { status: 400 }
      );
    }

    // Check if user is the organizer
    if (event.organizerId === userId) {
      return NextResponse.json(
        { error: 'Organizers are automatically registered for their events' },
        { status: 400 }
      );
    }

    // Check if event is full
    if (event.maxAttendees && event._count.attendances >= event.maxAttendees) {
      return NextResponse.json(
        { error: 'Event is full' },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingAttendance = await prisma.eventAttendance.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      );
    }

    // Create attendance record
    const attendance = await prisma.eventAttendance.create({
      data: {
        userId,
        eventId,
        status: 'INTERESTED',
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
          },
        },
      },
    });

    // Award Crolars for registering
    const crolarsEarned = 10; // 10 Crolars for registering to an event
    await prisma.user.update({
      where: { id: userId },
      data: {
        crolars: {
          increment: crolarsEarned,
        },
      },
    });

    // TODO: Send notification to user about successful registration
    // TODO: Add event to user's calendar if integration is available

    return NextResponse.json({
      success: true,
      attendance: {
        id: attendance.id,
        status: attendance.status,
        createdAt: attendance.createdAt,
        event: attendance.event,
      },
      crolarsEarned,
      message: `Successfully registered for "${event.title}"`,
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/register - Cancel registration
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

    const userId = session.user.id;
    const eventId = params.id;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        startDate: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event has already started
    if (event.startDate <= new Date()) {
      return NextResponse.json(
        { error: 'Cannot cancel registration for event that has already started' },
        { status: 400 }
      );
    }

    // Check if user is registered
    const existingAttendance = await prisma.eventAttendance.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { error: 'Not registered for this event' },
        { status: 400 }
      );
    }

    // Delete attendance record
    await prisma.eventAttendance.delete({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    // Deduct Crolars for canceling (optional - could be configurable)
    const crolarsDeducted = 5; // 5 Crolars penalty for canceling
    await prisma.user.update({
      where: { id: userId },
      data: {
        crolars: {
          decrement: crolarsDeducted,
        },
      },
    });

    // TODO: Send notification to user about cancellation
    // TODO: Remove event from user's calendar if integration is available

    return NextResponse.json({
      success: true,
      crolarsDeducted,
      message: `Registration canceled for "${event.title}"`,
    });
  } catch (error) {
    console.error('Error canceling registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}