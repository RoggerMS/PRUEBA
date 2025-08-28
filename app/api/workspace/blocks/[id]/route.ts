import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for block update
const updateBlockSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es muy largo').optional(),
  x: z.number().int().min(0).optional(),
  y: z.number().int().min(0).optional(),
  w: z.number().int().min(200).max(800).optional(),
  h: z.number().int().min(150).max(600).optional(),
  zIndex: z.number().int().min(1).optional(),
  locked: z.boolean().optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/workspace/blocks/[id] - Get a specific block
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

    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: params.id,
        board: {
          userId: session.user.id,
        },
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

    if (!block) {
      return NextResponse.json(
        { error: 'Bloque no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ block });
  } catch (error) {
    console.error('Error fetching block:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/workspace/blocks/[id] - Update a block
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
    const validatedData = updateBlockSchema.parse(body);

    // Check if block exists and belongs to user
    const existingBlock = await prisma.workspaceBlock.findFirst({
      where: {
        id: params.id,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Bloque no encontrado' },
        { status: 404 }
      );
    }

    // If updating zIndex, ensure it doesn't conflict
    if (validatedData.zIndex !== undefined) {
      const conflictingBlock = await prisma.workspaceBlock.findFirst({
        where: {
          boardId: existingBlock.boardId,
          zIndex: validatedData.zIndex,
          id: { not: params.id },
        },
      });

      if (conflictingBlock) {
        // Swap zIndex values
        await prisma.workspaceBlock.update({
          where: {
            id: conflictingBlock.id,
          },
          data: {
            zIndex: existingBlock.zIndex,
          },
        });
      }
    }

    const updatedBlock = await prisma.workspaceBlock.update({
      where: {
        id: params.id,
      },
      data: validatedData,
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

    return NextResponse.json({ block: updatedBlock });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating block:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/workspace/blocks/[id] - Delete a block
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

    // Check if block exists and belongs to user
    const existingBlock = await prisma.workspaceBlock.findFirst({
      where: {
        id: params.id,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Bloque no encontrado' },
        { status: 404 }
      );
    }

    // Delete the block (cascade will delete related content)
    await prisma.workspaceBlock.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting block:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}