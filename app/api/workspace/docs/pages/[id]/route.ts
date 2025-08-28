import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Marcar como ruta dinámica
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Schema for page update
const updatePageSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es muy largo').optional(),
  content: z.string().optional(),
  orderIndex: z.number().int().min(0).optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/workspace/docs/pages/[id] - Get a specific page
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

    const page = await prisma.docsPage.findFirst({
      where: {
        id: params.id,
        block: {
          board: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Página no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error fetching docs page:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/workspace/docs/pages/[id] - Update a page
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
    const validatedData = updatePageSchema.parse(body);

    // Check if page exists and belongs to user
    const existingPage = await prisma.docsPage.findFirst({
      where: {
        id: params.id,
        block: {
          board: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Página no encontrada' },
        { status: 404 }
      );
    }

    // If updating order index, handle reordering
    if (validatedData.orderIndex !== undefined && validatedData.orderIndex !== existingPage.orderIndex) {
      const blockId = existingPage.blockId;
      const oldIndex = existingPage.orderIndex;
      const newIndex = validatedData.orderIndex;

      if (newIndex > oldIndex) {
        // Moving down: shift pages up
        await prisma.docsPage.updateMany({
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
        // Moving up: shift pages down
        await prisma.docsPage.updateMany({
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

    const updatedPage = await prisma.docsPage.update({
      where: {
        id: params.id,
      },
      data: validatedData,
    });

    return NextResponse.json({ page: updatedPage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating docs page:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/workspace/docs/pages/[id] - Delete a page
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

    // Check if page exists and belongs to user
    const existingPage = await prisma.docsPage.findFirst({
      where: {
        id: params.id,
        block: {
          board: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Página no encontrada' },
        { status: 404 }
      );
    }

    // Check if this is the last page in the block
    const pageCount = await prisma.docsPage.count({
      where: {
        blockId: existingPage.blockId,
      },
    });

    if (pageCount === 1) {
      return NextResponse.json(
        { error: 'No puedes eliminar la única página del documento' },
        { status: 400 }
      );
    }

    // Delete the page
    await prisma.docsPage.delete({
      where: {
        id: params.id,
      },
    });

    // Reorder remaining pages
    await prisma.docsPage.updateMany({
      where: {
        blockId: existingPage.blockId,
        orderIndex: {
          gt: existingPage.orderIndex,
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
    console.error('Error deleting docs page:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}