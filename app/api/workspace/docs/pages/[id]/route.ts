export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { prisma } from '@/lib/prisma';
import { proxyWorkspace } from '@/lib/workspace-proxy';
import { getSession } from '@/lib/session';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const proxy = await proxyWorkspace(req, `/docs/pages/${params.id}`);
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const page = await prisma.docsPage.findFirst({
      where: { id: params.id, block: { board: { userId: session.user.id } } }
    });
    if (!page) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.json();
    const updated = await prisma.docsPage.update({ where: { id: params.id }, data });
    return Response.json({ page: updated });
  } catch (e) {
    console.error('[PATCH /api/workspace/docs/pages/:id]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const proxy = await proxyWorkspace(req, `/docs/pages/${params.id}`);
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const page = await prisma.docsPage.findFirst({
      where: { id: params.id, block: { board: { userId: session.user.id } } }
    });
    if (!page) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await prisma.docsPage.delete({ where: { id: params.id } });
    return Response.json({ ok: true });
  } catch (e) {
    console.error('[DELETE /api/workspace/docs/pages/:id]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
