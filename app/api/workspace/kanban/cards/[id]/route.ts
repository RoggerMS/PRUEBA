import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Marcar como ruta dinámica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Schema for card update
const updateCardSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es muy largo').optional(),
  description: z.string().max(500, 'La descripción es muy larga').optional(),
  orderIndex: z.number().int().min(0).optional(),
  columnId: z.string().cuid('ID de columna inválido').optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/workspace/kanban/cards/[id] - Get a specific card
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

    const card = await prisma.kanbanCard.findFirst({
      where: {
        id: params.id,
        column: {
          block: {
            board: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        column: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Tarjeta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error('Error fetching kanban card:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/workspace/kanban/cards/[id] - Update a card
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
    const validatedData = updateCardSchema.parse(body);

    // Check if card exists and belongs to user
    const existingCard = await prisma.kanbanCard.findFirst({
      where: {
        id: params.id,
        column: {
          block: {
            board: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: 'Tarjeta no encontrada' },
        { status: 404 }
      );
    }

    // If moving to a different column, verify the new column belongs to user
    if (validatedData.columnId && validatedData.columnId !== existingCard.columnId) {
      const newColumn = await prisma.kanbanColumn.findFirst({
        where: {
          id: validatedData.columnId,
          block: {
            board: {
              userId: session.user.id,
            },
          },
        },
      });

      if (!newColumn) {
        return NextResponse.json(
          { error: 'Columna de destino no encontrada' },
          { status: 404 }
        );
      }

      // Check card limit in new column
      const cardCount = await prisma.kanbanCard.count({
        where: {
          columnId: validatedData.columnId,
        },
      });

      if (cardCount >= 50) {
        return NextResponse.json(
          { error: 'Límite de tarjetas alcanzado en la columna de destino (máximo 50 por columna)' },
          { status: 400 }
        );
      }
    }

    // Handle reordering within the same column or moving to a different column
    if (validatedData.orderIndex !== undefined || validatedData.columnId) {
      const oldColumnId = existingCard.columnId;
      const newColumnId = validatedData.columnId || oldColumnId;
      const oldIndex = existingCard.orderIndex;
      const newIndex = validatedData.orderIndex !== undefined ? validatedData.orderIndex : oldIndex;

      if (oldColumnId === newColumnId) {
        // Reordering within the same column
        if (newIndex !== oldIndex) {
          if (newIndex > oldIndex) {
            // Moving down: shift cards up
            await prisma.kanbanCard.updateMany({
              where: {
                columnId: oldColumnId,
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
            // Moving up: shift cards down
            await prisma.kanbanCard.updateMany({
              where: {
                columnId: oldColumnId,
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
      } else {
        // Moving to a different column
        // Shift cards up in the old column
        await prisma.kanbanCard.updateMany({
          where: {
            columnId: oldColumnId,
            orderIndex: {
              gt: oldIndex,
            },
          },
          data: {
            orderIndex: {
              decrement: 1,
            },
          },
        });

        // Shift cards down in the new column
        await prisma.kanbanCard.updateMany({
          where: {
            columnId: newColumnId,
            orderIndex: {
              gte: newIndex,
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

    const updatedCard = await prisma.kanbanCard.update({
      where: {
        id: params.id,
      },
      data: validatedData,
      include: {
        column: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ card: updatedCard });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating kanban card:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/workspace/kanban/cards/[id] - Delete a card
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

    // Check if card exists and belongs to user
    const existingCard = await prisma.kanbanCard.findFirst({
      where: {
        id: params.id,
        column: {
          block: {
            board: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: 'Tarjeta no encontrada' },
        { status: 404 }
      );
    }

    // Delete the card
    await prisma.kanbanCard.delete({
      where: {
        id: params.id,
      },
    });

    // Reorder remaining cards in the column
    await prisma.kanbanCard.updateMany({
      where: {
        columnId: existingCard.columnId,
        orderIndex: {
          gt: existingCard.orderIndex,
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
    console.error('Error deleting kanban card:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}