export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { proxyWorkspace } from '@/lib/workspace-proxy';

export async function GET(req: Request) {
  const proxy = await proxyWorkspace(req, '/kanban/cards');
  if (proxy) return proxy;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const columnId = searchParams.get('columnId');
    if (!columnId) {
      return Response.json({ error: 'Column ID is required' }, { status: 400 });
    }
    const cards = await prisma.kanbanCard.findMany({
      where: { columnId, column: { block: { board: { userId: session.user.id } } } },
      orderBy: { orderIndex: 'asc' }
    });
    return Response.json({ cards });
  } catch (e) {
    console.error('[GET /api/workspace/kanban/cards]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const proxy = await proxyWorkspace(req, '/kanban/cards');
  if (proxy) return proxy;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const column = await prisma.kanbanColumn.findFirst({
      where: { id: body.columnId, block: { board: { userId: session.user.id } } }
    });
    if (!column) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const card = await prisma.kanbanCard.create({
      data: {
        columnId: body.columnId,
        title: body.title,
        description: body.description ?? '',
        orderIndex: body.orderIndex ?? 0
      }
    });
    return Response.json({ card }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/workspace/kanban/cards]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}