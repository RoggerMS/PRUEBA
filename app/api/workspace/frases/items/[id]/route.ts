import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for frases item update
const updateFrasesItemSchema = z.object({
  text: z.string().min(1, 'El texto es requerido').max(500, 'El texto es muy largo').optional(),
  author: z.string().max(100, 'El autor es muy largo').optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/workspace/frases/items/[id] - Get a specific frases item
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

    const item = await prisma.frasesItem.findFirst({
      where: {
        id: params.id,
        block: {
          board: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Frase no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error fetching frases item:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/workspace/frases/items/[id] - Update a frases item
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
    const validatedData = updateFrasesItemSchema.parse(body);

    // Check if item exists and belongs to user
    const existingItem = await prisma.frasesItem.findFirst({
      where: {
        id: params.id,
        block: {
          board: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Frase no encontrada' },
        { status: 404 }
      );
    }

    const updatedItem = await prisma.frasesItem.update({
      where: {
        id: params.id,
      },
      data: validatedData,
    });

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating frases item:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/workspace/frases/items/[id] - Delete a frases item
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

    // Check if item exists and belongs to user
    const existingItem = await prisma.frasesItem.findFirst({
      where: {
        id: params.id,
        block: {
          board: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Frase no encontrada' },
        { status: 404 }
      );
    }

    // Delete the item
    await prisma.frasesItem.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting frases item:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}