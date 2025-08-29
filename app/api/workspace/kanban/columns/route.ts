import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Marcar como ruta dinámica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Schema for column creation
const createColumnSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(50, 'El título es muy largo'),
  blockId: z.string().cuid('ID de bloque inválido'),
});

// GET /api/workspace/kanban/columns - Get columns for a specific kanban block
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
    const blockId = searchParams.get('blockId');

    if (!blockId) {
      return NextResponse.json(
        { error: 'ID de bloque requerido' },
        { status: 400 }
      );
    }

    // Verify block belongs to user and is a KANBAN block
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: blockId,
        type: 'KANBAN',
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: 'Bloque de Kanban no encontrado' },
        { status: 404 }
      );
    }

    const columns = await prisma.kanbanColumn.findMany({
      where: {
        blockId: blockId,
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
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return NextResponse.json({ columns });
  } catch (error) {
    console.error('Error fetching kanban columns:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/workspace/kanban/columns - Create a new column
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
    const validatedData = createColumnSchema.parse(body);

    // Verify block belongs to user and is a KANBAN block
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: validatedData.blockId,
        type: 'KANBAN',
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: 'Bloque de Kanban no encontrado' },
        { status: 404 }
      );
    }

    // Check column limit (10 per kanban block)
    const columnCount = await prisma.kanbanColumn.count({
      where: {
        blockId: validatedData.blockId,
      },
    });

    if (columnCount >= 10) {
      return NextResponse.json(
        { error: 'Límite de columnas alcanzado (máximo 10 por Kanban)' },
        { status: 400 }
      );
    }

    // Get next order index
    const maxOrderIndex = await prisma.kanbanColumn.findFirst({
      where: {
        blockId: validatedData.blockId,
      },
      orderBy: {
        orderIndex: 'desc',
      },
      select: {
        orderIndex: true,
      },
    });

    const nextOrderIndex = (maxOrderIndex?.orderIndex || -1) + 1;

    const column = await prisma.kanbanColumn.create({
      data: {
        title: validatedData.title,
        orderIndex: nextOrderIndex,
        blockId: validatedData.blockId,
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

    return NextResponse.json({ column }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating kanban column:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}