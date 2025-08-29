export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const item = await prisma.frasesItem.findFirst({
      where: { id: params.id, block: { board: { userId: session.user.id } } }
    });
    if (!item) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.json();
    const updated = await prisma.frasesItem.update({ where: { id: params.id }, data });
    return Response.json({ item: updated });
  } catch (e) {
    console.error('[PATCH /api/workspace/frases/items/:id]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const item = await prisma.frasesItem.findFirst({
      where: { id: params.id, block: { board: { userId: session.user.id } } }
    });
    if (!item) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await prisma.frasesItem.delete({ where: { id: params.id } });
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[DELETE /api/workspace/frases/items/:id]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
