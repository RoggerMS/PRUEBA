export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { prisma } from '@/lib/prisma';
import { proxyWorkspace } from '@/lib/workspace-proxy';
import { getSession } from '@/lib/session';

export async function GET(req: Request) {
  const proxy = await proxyWorkspace(req, '/blocks');
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const boardId = searchParams.get('boardId');
    if (!boardId) {
      return Response.json({ error: 'boardId is required' }, { status: 400 });
    }
    const blocks = await prisma.workspaceBlock.findMany({
      where: { boardId, board: { userId: session.user.id } },
      orderBy: { createdAt: 'asc' },
      include: {
        docsPages: true,
        kanbanColumns: { include: { cards: true } },
        frasesItems: true,
      },
    });
    return Response.json({ blocks });
  } catch (e) {
    console.error('[GET /api/workspace/blocks]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const proxy = await proxyWorkspace(req, '/blocks');
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const board = await prisma.workspaceBoard.findFirst({
      where: { id: body.boardId, userId: session.user.id }
    });
    if (!board) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const maxZ = await prisma.workspaceBlock.findFirst({
      where: { boardId: body.boardId },
      orderBy: { zIndex: 'desc' },
      select: { zIndex: true },
    });

    const block = await prisma.workspaceBlock.create({
      data: {
        boardId: body.boardId,
        type: body.type,
        title: body.title || '',
        x: body.x ?? 0,
        y: body.y ?? 0,
        w: body.w ?? 300,
        h: body.h ?? 200,
        zIndex: maxZ ? maxZ.zIndex + 1 : 1,
      },
    });

    switch (block.type) {
      case 'DOCS':
        await prisma.docsPage.create({
          data: { blockId: block.id, title: 'Untitled Document', content: '' },
        });
        break;
      case 'KANBAN':
        await prisma.kanbanColumn.createMany({
          data: [
            { blockId: block.id, title: 'To Do', orderIndex: 0 },
            { blockId: block.id, title: 'In Progress', orderIndex: 1 },
            { blockId: block.id, title: 'Done', orderIndex: 2 },
          ],
        });
        break;
      case 'FRASES':
        await prisma.frasesItem.create({
          data: { blockId: block.id, content: 'Welcome to your new frases block!' },
        });
        break;
    }

    const fullBlock = await prisma.workspaceBlock.findUnique({
      where: { id: block.id },
      include: {
        docsPages: true,
        kanbanColumns: { include: { cards: true } },
        frasesItems: true,
      },
    });
    return Response.json({ block: fullBlock }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/workspace/blocks]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
