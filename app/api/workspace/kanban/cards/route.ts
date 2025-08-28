import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for card creation
const createCardSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es muy largo'),
  description: z.string().max(500, 'La descripción es muy larga').optional(),
  columnId: z.string().cuid('ID de columna inválido'),
});

// GET /api/workspace/kanban/cards - Get cards for a specific column
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
    const columnId = searchParams.get('columnId');

    if (!columnId) {
      return NextResponse.json(
        { error: 'ID de columna requerido' },
        { status: 400 }
      );
    }

    // Verify column belongs to user
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id: columnId,
        block: {
          board: {
            userId: session.user.id,
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

    const cards = await prisma.kanbanCard.findMany({
      where: {
        columnId: columnId,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Error fetching kanban cards:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/workspace/kanban/cards - Create a new card
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
    const validatedData = createCardSchema.parse(body);

    // Verify column belongs to user
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id: validatedData.columnId,
        block: {
          board: {
            userId: session.user.id,
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

    // Check card limit (50 per column)
    const cardCount = await prisma.kanbanCard.count({
      where: {
        columnId: validatedData.columnId,
      },
    });

    if (cardCount >= 50) {
      return NextResponse.json(
        { error: 'Límite de tarjetas alcanzado (máximo 50 por columna)' },
        { status: 400 }
      );
    }

    // Get next order index
    const maxOrderIndex = await prisma.kanbanCard.findFirst({
      where: {
        columnId: validatedData.columnId,
      },
      orderBy: {
        orderIndex: 'desc',
      },
      select: {
        orderIndex: true,
      },
    });

    const nextOrderIndex = (maxOrderIndex?.orderIndex || -1) + 1;

    const card = await prisma.kanbanCard.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || '',
        orderIndex: nextOrderIndex,
        columnId: validatedData.columnId,
      },
    });

    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating kanban card:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}