export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { proxyWorkspace } from '@/lib/workspace-proxy';

export async function GET(req: Request) {
  const proxy = await proxyWorkspace(req, '/stats');
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const [boardsCount, blocksCount, docsCount, kanbanCount, frasesCount] = await Promise.all([
      prisma.workspaceBoard.count({ where: { userId } }),
      prisma.workspaceBlock.count({ where: { board: { userId } } }),
      prisma.docsPage.count({ where: { block: { board: { userId } } } }),
      prisma.kanbanColumn.count({ where: { block: { board: { userId } } } }),
      prisma.frasesItem.count({ where: { block: { board: { userId } } } }),
    ]);
    return Response.json({
      stats: { boardsCount, blocksCount, docsCount, kanbanCount, frasesCount },
    });
  } catch (e) {
    console.error('[GET /api/workspace/stats]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
