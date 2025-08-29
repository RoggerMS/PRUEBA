export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { prisma } from '@/lib/prisma';
import { proxyWorkspace } from '@/lib/workspace-proxy';
import { getSession } from '@/lib/session';

export async function GET(req: Request) {
  const proxy = await proxyWorkspace(req, '/frases/items');
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const blockId = searchParams.get('blockId');
    if (!blockId) {
      return Response.json({ error: 'Block ID is required' }, { status: 400 });
    }
    const items = await prisma.frasesItem.findMany({
      where: { blockId, block: { board: { userId: session.user.id } } },
      orderBy: { createdAt: 'asc' }
    });
    return Response.json({ items });
  } catch (e) {
    console.error('[GET /api/workspace/frases/items]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const proxy = await proxyWorkspace(req, '/frases/items');
  if (proxy) return proxy;
  try {
    const session = await getSession();
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
    const item = await prisma.frasesItem.create({
      data: {
        blockId: body.blockId,
        content: body.content,
        tags: body.tags ?? '[]'
      }
    });
    return Response.json({ item }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/workspace/frases/items]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
