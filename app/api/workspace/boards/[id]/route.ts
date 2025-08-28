import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for board update
const updateBoardSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo').optional(),
  isDefault: z.boolean().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/workspace/boards/[id] - Get a specific board
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const board = await prisma.workspaceBoard.findFirst({
      where: {
        id: params.id,
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
          orderBy: {
            zIndex: 'asc',
          },
        },
        _count: {
          select: {
            blocks: true,
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Pizarra no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ board });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/workspace/boards/[id] - Update a board
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateBoardSchema.parse(body);

    // Check if board exists and belongs to user
    const existingBoard = await prisma.workspaceBoard.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingBoard) {
      return NextResponse.json(
        { error: 'Pizarra no encontrada' },
        { status: 404 }
      );
    }

    // If setting as default, unset other default boards
    if (validatedData.isDefault === true) {
      await prisma.workspaceBoard.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedBoard = await prisma.workspaceBoard.update({
      where: {
        id: params.id,
      },
      data: validatedData,
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

    return NextResponse.json({ board: updatedBoard });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating board:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/workspace/boards/[id] - Delete a board
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Check if board exists and belongs to user
    const existingBoard = await prisma.workspaceBoard.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingBoard) {
      return NextResponse.json(
        { error: 'Pizarra no encontrada' },
        { status: 404 }
      );
    }

    // Prevent deletion of default board if it's the only one
    if (existingBoard.isDefault) {
      const boardCount = await prisma.workspaceBoard.count({
        where: {
          userId: session.user.id,
        },
      });

      if (boardCount === 1) {
        return NextResponse.json(
          { error: 'No puedes eliminar la única pizarra' },
          { status: 400 }
        );
      }

      // If deleting default board, set another as default
      const nextBoard = await prisma.workspaceBoard.findFirst({
        where: {
          userId: session.user.id,
          id: { not: params.id },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (nextBoard) {
        await prisma.workspaceBoard.update({
          where: {
            id: nextBoard.id,
          },
          data: {
            isDefault: true,
          },
        });
      }
    }

    // Delete the board (cascade will delete blocks and related data)
    await prisma.workspaceBoard.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}