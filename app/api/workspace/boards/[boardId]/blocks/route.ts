export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { prisma } from '@/lib/prisma';
import { proxyWorkspace } from '@/lib/workspace-proxy';
import { getSession } from '@/lib/session';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;
  const proxy = await proxyWorkspace(req, `/boards/${boardId}/blocks`);
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const blocks = await prisma.workspaceBlock.findMany({
      where: {
        boardId: boardId,
        board: { userId: session.user.id }
      },
      orderBy: { createdAt: 'asc' },
      include: {
        docsPages: true,
        kanbanColumns: { include: { cards: true } },
        frasesItems: true
      }
    });
    return Response.json({ blocks });
  } catch (e) {
    console.error('[GET /api/workspace/boards/:boardId/blocks]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
