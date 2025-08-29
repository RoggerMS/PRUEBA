export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { proxyWorkspace } from '@/lib/workspace-proxy';

export async function GET(req: Request) {
  const proxy = await proxyWorkspace(req, '/debug');
  if (proxy) return proxy;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return Response.json({ ok: true, userId: session.user.id, email: session.user.email, ts: Date.now() });
  } catch (e) {
    console.error('[GET /api/workspace/debug]', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
