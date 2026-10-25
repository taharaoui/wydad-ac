import { unsubscribe } from '@/lib/newsletter/service';

export const dynamic = 'force-dynamic';

/**
 * POST { token } from the unsubscribe page, or one-click unsubscribe from mail clients
 * (RFC 8058: POST ?token=… with body "List-Unsubscribe=One-Click").
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  let token = url.searchParams.get('token') ?? '';
  if (!token && request.headers.get('content-type')?.includes('application/json')) {
    token = String(((await request.json().catch(() => ({}))) as { token?: string }).token ?? '');
  }
  const result = await unsubscribe(token);
  return Response.json({ result }, { status: result === 'ok' ? 200 : result === 'unavailable' ? 503 : 400 });
}
