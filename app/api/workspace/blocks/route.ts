import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { WorkspaceBlockType } from '@prisma/client';

// Schema for block creation
const createBlockSchema = z.object({
  type: z.nativeEnum(WorkspaceBlockType),
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es muy largo'),
  boardId: z.string().cuid('ID de pizarra inválido'),
  x: z.number().int().min(0).default(0),
  y: z.number().int().min(0).default(0),
  w: z.number().int().min(200).max(800).default(300),
  h: z.number().int().min(150).max(600).default(200),
});

// GET /api/workspace/blocks - Get blocks for a specific board
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
    const boardId = searchParams.get('boardId');

    if (!boardId) {
      return NextResponse.json(
        { error: 'ID de pizarra requerido' },
        { status: 400 }
      );
    }

    // Verify board belongs to user
    const board = await prisma.workspaceBoard.findFirst({
      where: {
        id: boardId,
        userId: session.user.id,
      },
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Pizarra no encontrada' },
        { status: 404 }
      );
    }

    const blocks = await prisma.workspaceBlock.findMany({
      where: {
        boardId: boardId,
      },
      include: {
        docsPages: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        kanbanColumns: {
          include: {
            cards: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        frasesItems: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        zIndex: 'asc',
      },
    });

    return NextResponse.json({ blocks });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/workspace/blocks - Create a new block
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
    const validatedData = createBlockSchema.parse(body);

    // Verify board belongs to user
    const board = await prisma.workspaceBoard.findFirst({
      where: {
        id: validatedData.boardId,
        userId: session.user.id,
      },
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Pizarra no encontrada' },
        { status: 404 }
      );
    }

    // Check block limit (100 per board)
    const blockCount = await prisma.workspaceBlock.count({
      where: {
        boardId: validatedData.boardId,
      },
    });

    if (blockCount >= 100) {
      return NextResponse.json(
        { error: 'Límite de bloques alcanzado (máximo 100 por pizarra)' },
        { status: 400 }
      );
    }

    // Get next zIndex
    const maxZIndex = await prisma.workspaceBlock.findFirst({
      where: {
        boardId: validatedData.boardId,
      },
      orderBy: {
        zIndex: 'desc',
      },
      select: {
        zIndex: true,
      },
    });

    const nextZIndex = (maxZIndex?.zIndex || 0) + 1;

    // Create block with initial content based on type
    const block = await prisma.workspaceBlock.create({
      data: {
        type: validatedData.type,
        title: validatedData.title,
        x: validatedData.x,
        y: validatedData.y,
        w: validatedData.w,
        h: validatedData.h,
        zIndex: nextZIndex,
        boardId: validatedData.boardId,
      },
    });

    // Create initial content based on block type
    if (validatedData.type === 'DOCS') {
      await prisma.docsPage.create({
        data: {
          title: 'Página 1',
          content: '',
          orderIndex: 0,
          blockId: block.id,
        },
      });
    } else if (validatedData.type === 'KANBAN') {
      // Create default columns
      const defaultColumns = [
        { title: 'Por hacer', orderIndex: 0 },
        { title: 'En progreso', orderIndex: 1 },
        { title: 'Completado', orderIndex: 2 },
      ];

      for (const column of defaultColumns) {
        await prisma.kanbanColumn.create({
          data: {
            title: column.title,
            orderIndex: column.orderIndex,
            blockId: block.id,
          },
        });
      }
    }
    // FRASES type doesn't need initial content

    // Fetch the created block with its content
    const createdBlock = await prisma.workspaceBlock.findUnique({
      where: {
        id: block.id,
      },
      include: {
        docsPages: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        kanbanColumns: {
          include: {
            cards: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        frasesItems: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return NextResponse.json({ block: createdBlock }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating block:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}