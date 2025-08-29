export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { proxyWorkspace } from '@/lib/workspace-proxy';

export async function GET(req: Request) {
  const proxy = await proxyWorkspace(req, '/boards');
  if (proxy) return proxy;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const boards = await prisma.workspaceBoard.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
      include: {
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
          blocks: {
            include: {
              docsPages: true,
              kanbanColumns: { include: { cards: true } },
              frasesItems: true
            }
          }
        }
      });
      return Response.json({ boards: [created], defaultBoard: created.id });
    }
    return Response.json({ boards, defaultBoard });
  } catch (e) {
    console.error('[GET /api/workspace/boards]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const proxy = await proxyWorkspace(req, '/boards');
  if (proxy) return proxy;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { name } = await req.json();
    const board = await prisma.workspaceBoard.create({
      data: { userId: session.user.id, name: name || 'Pizarra 1', isDefault: false }
    });
    return Response.json({ board }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/workspace/boards]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
