export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { prisma } from '@/lib/prisma';
import { proxyWorkspace } from '@/lib/workspace-proxy';
import { getSession } from '@/lib/session';

export async function POST(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const proxy = await proxyWorkspace(req, `/boards/${boardId}/duplicate`);
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const source = await prisma.workspaceBoard.findFirst({
      where: { id: boardId, userId: session.user.id },
      include: {
        blocks: {
          include: {
            docsPages: true,
            kanbanColumns: { include: { cards: true } },
            frasesItems: true,
          },
        },
      },
    });
    if (!source) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const newBoard = await prisma.workspaceBoard.create({
      data: {
        userId: session.user.id,
        name: `${source.name} (Copia)`,
        isDefault: false,
      },
    });
    for (const block of source.blocks) {
      const createdBlock = await prisma.workspaceBlock.create({
        data: {
          boardId: newBoard.id,
          type: block.type,
          title: block.title,
          x: block.x,
          y: block.y,
          w: block.w,
          h: block.h,
          zIndex: block.zIndex,
          locked: block.locked,
          completed: block.completed,
        },
      });
      switch (block.type) {
        case 'DOCS':
          for (const page of block.docsPages) {
            await prisma.docsPage.create({
              data: {
                blockId: createdBlock.id,
                title: page.title,
                content: page.content,
                orderIndex: page.orderIndex,
              },
            });
          }
          break;
        case 'KANBAN':
          for (const column of block.kanbanColumns) {
            const newColumn = await prisma.kanbanColumn.create({
              data: {
                blockId: createdBlock.id,
                title: column.title,
                orderIndex: column.orderIndex,
              },
            });
            for (const card of column.cards) {
              await prisma.kanbanCard.create({
                data: {
                  columnId: newColumn.id,
                  title: card.title,
                  description: card.description,
                  orderIndex: card.orderIndex,
                },
              });
            }
          }
          break;
        case 'FRASES':
          for (const item of block.frasesItems) {
            await prisma.frasesItem.create({
              data: {
                blockId: createdBlock.id,
                content: item.content,
                tags: item.tags,
              },
            });
          }
          break;
      }
    }
    const fullBoard = await prisma.workspaceBoard.findUnique({
      where: { id: newBoard.id },
      include: {
        blocks: {
          include: {
            docsPages: true,
            kanbanColumns: { include: { cards: true } },
            frasesItems: true,
          },
        },
      },
    });
    return Response.json({ board: fullBoard }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/workspace/boards/:id/duplicate]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
