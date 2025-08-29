export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { proxyWorkspace } from '@/lib/workspace-proxy';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const proxy = await proxyWorkspace(req, `/kanban/cards/${params.id}`);
  if (proxy) return proxy;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const card = await prisma.kanbanCard.findFirst({
      where: { id: params.id, column: { block: { board: { userId: session.user.id } } } }
    });
    if (!card) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.json();
    const updated = await prisma.kanbanCard.update({ where: { id: params.id }, data });
    return Response.json({ card: updated });
  } catch (e) {
    console.error('[PATCH /api/workspace/kanban/cards/:id]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const proxy = await proxyWorkspace(req, `/kanban/cards/${params.id}`);
  if (proxy) return proxy;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const card = await prisma.kanbanCard.findFirst({
      where: { id: params.id, column: { block: { board: { userId: session.user.id } } } }
    });
    if (!card) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await prisma.kanbanCard.delete({ where: { id: params.id } });
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[DELETE /api/workspace/kanban/cards/:id]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
