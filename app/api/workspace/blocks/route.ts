export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const board = await prisma.workspaceBoard.findFirst({
      where: { id: body.boardId, userId: session.user.id }
    });
    if (!board) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const block = await prisma.workspaceBlock.create({
      data: {
        boardId: body.boardId,
        type: body.type,
        title: body.title || '',
        x: body.x ?? 0,
        y: body.y ?? 0,
        w: body.w ?? 300,
        h: body.h ?? 200,
        zIndex: body.zIndex ?? 1
      }
    });
    return Response.json({ block }, { status: 201 });
  } catch (e) {
    console.error('[POST /api/workspace/blocks]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
