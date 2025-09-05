export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { prisma } from '@/lib/prisma';
import { proxyWorkspace } from '@/lib/workspace-proxy';
import { getSession } from '@/lib/session';

export async function GET(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const proxy = await proxyWorkspace(req, `/boards/${boardId}`);
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const board = await prisma.workspaceBoard.findFirst({
      where: { id: boardId, userId: session.user.id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        blocks: {
          include: {
            docsPages: true,
            kanbanColumns: { include: { cards: true } },
            frasesItems: true,
          },
        },
      },
    });
    if (!board) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    const { user, ...rest } = board as any;
    return Response.json({ board: { ...rest, owner: user } });
  } catch (e) {
    console.error('[GET /api/workspace/boards/:id]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const proxy = await proxyWorkspace(req, `/boards/${boardId}`);
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const existing = await prisma.workspaceBoard.findFirst({
      where: { id: boardId, userId: session.user.id },
    });
    if (!existing) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.json();
    if (data.isDefault) {
      await prisma.workspaceBoard.updateMany({
        where: { userId: session.user.id, isDefault: true, id: { not: boardId } },
        data: { isDefault: false },
      });
    }
    const board = await prisma.workspaceBoard.update({
      where: { id: boardId },
      data,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } }
      }
    });
    const { user, ...rest } = board as any;
    return Response.json({ board: { ...rest, owner: user } });
  } catch (e) {
    console.error('[PUT /api/workspace/boards/:id]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const proxy = await proxyWorkspace(req, `/boards/${boardId}`);
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const existing = await prisma.workspaceBoard.findFirst({
      where: { id: boardId, userId: session.user.id },
    });
    if (!existing) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const count = await prisma.workspaceBoard.count({ where: { userId: session.user.id } });
    if (count === 1) {
      return Response.json({ error: 'Cannot delete the last board' }, { status: 400 });
    }
    await prisma.workspaceBoard.delete({ where: { id: boardId } });
    if (existing.isDefault) {
      const first = await prisma.workspaceBoard.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'asc' },
      });
      if (first) {
        await prisma.workspaceBoard.update({ where: { id: first.id }, data: { isDefault: true } });
      }
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[DELETE /api/workspace/boards/:id]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
