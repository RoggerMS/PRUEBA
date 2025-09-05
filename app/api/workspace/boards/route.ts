export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { prisma } from '@/lib/prisma';
import { proxyWorkspace } from '@/lib/workspace-proxy';
import { getSession } from '@/lib/session';

export async function GET(req: Request) {
  const proxy = await proxyWorkspace(req, '/boards');
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const boards = await prisma.workspaceBoard.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        },
        blocks: {
          include: {
            docsPages: true,
            kanbanColumns: { include: { cards: true } },
            frasesItems: true
          }
        }
      }
    });
    const defaultBoard = boards.find(b => b.isDefault)?.id ?? null;
    if (!boards.length) {
      const created = await prisma.workspaceBoard.create({
        data: { userId: session.user.id, name: 'Pizarra 1', isDefault: true },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true }
          },
          blocks: {
            include: {
              docsPages: true,
              kanbanColumns: { include: { cards: true } },
              frasesItems: true
            }
          }
        }
      });
      return Response.json({ boards: [{ ...created, owner: created.user }], defaultBoard: created.id });
    }
    const formattedBoards = boards.map(({ user, ...rest }) => ({ ...rest, owner: user }));
    return Response.json({ boards: formattedBoards, defaultBoard });
  } catch (e) {
    console.error('[GET /api/workspace/boards]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const proxy = await proxyWorkspace(req, '/boards');
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { name } = await req.json();
    const board = await prisma.workspaceBoard.create({
      data: { userId: session.user.id, name: name || 'Pizarra 1', isDefault: false },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } }
      }
    });
    return Response.json({ board: { ...board, owner: board.user } }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/workspace/boards]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
