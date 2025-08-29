export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const blocks = await prisma.workspaceBlock.findMany({
      where: {
        boardId: params.boardId,
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
