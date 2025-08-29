export async function proxyWorkspace(req: Request, path: string) {
  const base = process.env.WORKSPACE_API_BASE;
  if (!base) return null;
  try {
    const url = new URL(req.url);
    const init: RequestInit = {
      method: req.method,
      headers: { 'content-type': req.headers.get('content-type') || 'application/json' },
    };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = await req.text();
    }
    const res = await fetch(`${base}${path}${url.search}`, init);
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') || 'application/json' },
    });
  } catch (e) {
    console.error('[proxy workspace]', e);
    return Response.json({ error: 'Upstream error' }, { status: 502 });
  }
}
