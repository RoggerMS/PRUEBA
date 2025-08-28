import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for page creation
const createPageSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es muy largo'),
  content: z.string().default(''),
  blockId: z.string().cuid('ID de bloque inválido'),
});

// GET /api/workspace/docs/pages - Get pages for a specific docs block
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

    // Verify block belongs to user and is a DOCS block
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: blockId,
        type: 'DOCS',
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: 'Bloque de documentos no encontrado' },
        { status: 404 }
      );
    }

    const pages = await prisma.docsPage.findMany({
      where: {
        blockId: blockId,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error fetching docs pages:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/workspace/docs/pages - Create a new page
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
    const validatedData = createPageSchema.parse(body);

    // Verify block belongs to user and is a DOCS block
    const block = await prisma.workspaceBlock.findFirst({
      where: {
        id: validatedData.blockId,
        type: 'DOCS',
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: 'Bloque de documentos no encontrado' },
        { status: 404 }
      );
    }

    // Check page limit (20 per docs block)
    const pageCount = await prisma.docsPage.count({
      where: {
        blockId: validatedData.blockId,
      },
    });

    if (pageCount >= 20) {
      return NextResponse.json(
        { error: 'Límite de páginas alcanzado (máximo 20 por documento)' },
        { status: 400 }
      );
    }

    // Get next order index
    const maxOrderIndex = await prisma.docsPage.findFirst({
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

    const page = await prisma.docsPage.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        orderIndex: nextOrderIndex,
        blockId: validatedData.blockId,
      },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating docs page:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}