import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
// Use shared auth options directly from the lib folder instead of importing
// from the NextAuth route, which doesn't re-export them. This prevents build
// errors when compiling API routes.
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/clubs/[id]/manage - Get club management data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const clubId = params.id;

    // Get club with members and check if user is president or admin
    const club = await prisma.club.findUnique({
      where: { id: clubId },
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
          orderBy: [
            { role: 'asc' }, // PRESIDENT first, then ADMIN, then MEMBER
            { joinedAt: 'asc' },
          ],
        },
        _count: {
          select: {
            posts: true,
            events: true,
          },
        },
      },
    });

    if (!club) {
      return NextResponse.json(
        { error: 'Club no encontrado' },
        { status: 404 }
      );
    }

    // Check if user is president or admin of the club
    const userMembership = club.members.find(
      (member) => member.userId === session.user.id
    );

    if (!userMembership || (userMembership.role !== 'PRESIDENT' && userMembership.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'No tienes permisos para gestionar este club' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      club,
      userRole: userMembership.role,
    });
  } catch (error) {
    console.error('Error fetching club management data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/clubs/[id]/manage - Update club settings (only for presidents)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const clubId = params.id;
    const body = await request.json();

    // Validate request body
    const updateSchema = z.object({
      name: z.string().min(3).max(100).optional(),
      description: z.string().min(10).max(500).optional(),
      category: z.string().min(1).optional(),
      subject: z.string().optional(),
      level: z.string().optional(),
      location: z.string().optional(),
      rules: z.string().optional(),
      visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
      maxMembers: z.number().min(2).max(1000).nullable().optional(),
    });

    const validatedData = updateSchema.parse(body);

    // Check if user is president of the club
    const userMembership = await prisma.clubMember.findFirst({
      where: {
        clubId,
        userId: session.user.id,
        role: 'PRESIDENT',
      },
    });

    if (!userMembership) {
      return NextResponse.json(
        { error: 'Solo el presidente puede actualizar la configuración del club' },
        { status: 403 }
      );
    }

    // Update club
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        ...validatedData,
        maxMembers: validatedData.maxMembers === null ? null : validatedData.maxMembers,
      },
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
          orderBy: [
            { role: 'asc' },
            { joinedAt: 'asc' },
          ],
        },
        _count: {
          select: {
            posts: true,
            events: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Club actualizado exitosamente',
      club: updatedClub,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating club:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}