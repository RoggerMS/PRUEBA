export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const blockId = searchParams.get('blockId');
    if (!blockId) {
      return Response.json({ error: 'Block ID is required' }, { status: 400 });
    }
    const columns = await prisma.kanbanColumn.findMany({
      where: { blockId, block: { board: { userId: session.user.id } } },
      orderBy: { orderIndex: 'asc' },
      include: { cards: { orderBy: { orderIndex: 'asc' } } }
    });
    return Response.json({ columns });
  } catch (e) {
    console.error('[GET /api/workspace/kanban/columns]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const block = await prisma.workspaceBlock.findFirst({
      where: { id: body.blockId, board: { userId: session.user.id } }
    });
    if (!block) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const column = await prisma.kanbanColumn.create({
      data: {
        blockId: body.blockId,
        title: body.title,
        orderIndex: body.orderIndex ?? 0
      }
    });
    return Response.json({ column }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/workspace/kanban/columns]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
