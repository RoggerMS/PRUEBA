export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { proxyWorkspace } from '@/lib/workspace-proxy';
import { getSession } from '@/lib/session';

export async function GET(req: Request) {
  const proxy = await proxyWorkspace(req, '/debug');
  if (proxy) return proxy;
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ ok: true, userId: session.user.id, email: session.user.email, ts: Date.now() });
  } catch (e) {
    console.error('[GET /api/workspace/debug]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
