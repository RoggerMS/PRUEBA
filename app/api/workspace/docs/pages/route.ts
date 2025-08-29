export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { proxyWorkspace } from '@/lib/workspace-proxy';

export async function GET(req: Request) {
  const proxy = await proxyWorkspace(req, '/docs/pages');
  if (proxy) return proxy;
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
    const pages = await prisma.docsPage.findMany({
      where: { blockId, block: { board: { userId: session.user.id } } },
      orderBy: { orderIndex: 'asc' }
    });
    return Response.json({ pages });
  } catch (e) {
    console.error('[GET /api/workspace/docs/pages]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const proxy = await proxyWorkspace(req, '/docs/pages');
  if (proxy) return proxy;
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
    const page = await prisma.docsPage.create({
      data: {
        blockId: body.blockId,
        title: body.title ?? 'Sin título',
        content: body.content ?? '',
        orderIndex: body.orderIndex ?? 0
      }
    });
    return Response.json({ page }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/workspace/docs/pages]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
