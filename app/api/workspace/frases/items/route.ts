import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for frases item creation
const createFrasesItemSchema = z.object({
  content: z.string().min(1, 'El contenido es requerido').max(500, 'El contenido es muy largo'),
  blockId: z.string().cuid('ID de bloque inválido'),
});

// GET /api/workspace/frases/items - Get frases items for a specific frases block
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

    // Verify block belongs to user and is a FRASES block
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: blockId,
        type: 'FRASES',
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: 'Bloque de Frases no encontrado' },
        { status: 404 }
      );
    }

    const items = await prisma.frasesItem.findMany({
      where: {
        blockId: blockId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching frases items:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/workspace/frases/items - Create a new frases item
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
    const validatedData = createFrasesItemSchema.parse(body);

    // Verify block belongs to user and is a FRASES block
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: validatedData.blockId,
        type: 'FRASES',
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: 'Bloque de Frases no encontrado' },
        { status: 404 }
      );
    }

    // Check item limit (200 per frases block)
    const itemCount = await prisma.frasesItem.count({
      where: {
        blockId: validatedData.blockId,
      },
    });

    if (itemCount >= 200) {
      return NextResponse.json(
        { error: 'Límite de frases alcanzado (máximo 200 por bloque)' },
        { status: 400 }
      );
    }

    const item = await prisma.frasesItem.create({
      data: {
        content: validatedData.content,
        blockId: validatedData.blockId,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating frases item:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}