import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for board creation
const createBoardSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
});

// Schema for board update
const updateBoardSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo').optional(),
  isDefault: z.boolean().optional(),
});

// GET /api/workspace/boards - Get all boards for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const boards = await prisma.workspaceBoard.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        blocks: {
          select: {
            id: true,
            type: true,
            title: true,
            x: true,
            y: true,
            w: true,
            h: true,
            zIndex: true,
            locked: true,
          },
        },
        _count: {
          select: {
            blocks: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({ boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/workspace/boards - Create a new board
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createBoardSchema.parse(body);

    // Check if user already has 10 boards (limit)
    const boardCount = await prisma.workspaceBoard.count({
      where: {
        userId: session.user.id,
      },
    });

    if (boardCount >= 10) {
      return NextResponse.json(
        { error: 'Límite de pizarras alcanzado (máximo 10)' },
        { status: 400 }
      );
    }

    // If this is the first board, make it default
    const isFirstBoard = boardCount === 0;

    const board = await prisma.workspaceBoard.create({
      data: {
        name: validatedData.name,
        isDefault: isFirstBoard,
        userId: session.user.id,
      },
      include: {
        blocks: {
          select: {
            id: true,
            type: true,
            title: true,
            x: true,
            y: true,
            w: true,
            h: true,
            zIndex: true,
            locked: true,
          },
        },
        _count: {
          select: {
            blocks: true,
          },
        },
      },
    });

    return NextResponse.json({ board }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}