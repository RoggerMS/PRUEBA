import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for column update
const updateColumnSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(50, 'El título es muy largo').optional(),
  orderIndex: z.number().int().min(0).optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/workspace/kanban/columns/[id] - Get a specific column
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

    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id: params.id,
        block: {
          board: {
            userId: session.user.id,
          },
        },
      },
      include: {
        cards: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            cards: true,
          },
        },
      },
    });

    if (!column) {
      return NextResponse.json(
        { error: 'Columna no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ column });
  } catch (error) {
    console.error('Error fetching kanban column:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/workspace/kanban/columns/[id] - Update a column
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
    const validatedData = updateColumnSchema.parse(body);

    // Check if column exists and belongs to user
    const existingColumn = await prisma.kanbanColumn.findFirst({
      where: {
        id: params.id,
        block: {
          board: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!existingColumn) {
      return NextResponse.json(
        { error: 'Columna no encontrada' },
        { status: 404 }
      );
    }

    // If updating order index, handle reordering
    if (validatedData.orderIndex !== undefined && validatedData.orderIndex !== existingColumn.orderIndex) {
      const blockId = existingColumn.blockId;
      const oldIndex = existingColumn.orderIndex;
      const newIndex = validatedData.orderIndex;

      if (newIndex > oldIndex) {
        // Moving right: shift columns left
        await prisma.kanbanColumn.updateMany({
          where: {
            blockId: blockId,
            orderIndex: {
              gt: oldIndex,
              lte: newIndex,
            },
          },
          data: {
            orderIndex: {
              decrement: 1,
            },
          },
        });
      } else {
        // Moving left: shift columns right
        await prisma.kanbanColumn.updateMany({
          where: {
            blockId: blockId,
            orderIndex: {
              gte: newIndex,
              lt: oldIndex,
            },
          },
          data: {
            orderIndex: {
              increment: 1,
            },
          },
        });
      }
    }

    const updatedColumn = await prisma.kanbanColumn.update({
      where: {
        id: params.id,
      },
      data: validatedData,
      include: {
        cards: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            cards: true,
          },
        },
      },
    });

    return NextResponse.json({ column: updatedColumn });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating kanban column:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/workspace/kanban/columns/[id] - Delete a column
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

    // Check if column exists and belongs to user
    const existingColumn = await prisma.kanbanColumn.findFirst({
      where: {
        id: params.id,
        block: {
          board: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!existingColumn) {
      return NextResponse.json(
        { error: 'Columna no encontrada' },
        { status: 404 }
      );
    }

    // Check if this is the last column in the block
    const columnCount = await prisma.kanbanColumn.count({
      where: {
        blockId: existingColumn.blockId,
      },
    });

    if (columnCount === 1) {
      return NextResponse.json(
        { error: 'No puedes eliminar la única columna del Kanban' },
        { status: 400 }
      );
    }

    // Delete the column (cascade will delete cards)
    await prisma.kanbanColumn.delete({
      where: {
        id: params.id,
      },
    });

    // Reorder remaining columns
    await prisma.kanbanColumn.updateMany({
      where: {
        blockId: existingColumn.blockId,
        orderIndex: {
          gt: existingColumn.orderIndex,
        },
      },
      data: {
        orderIndex: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting kanban column:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}