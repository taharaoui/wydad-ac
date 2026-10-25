import { subscribe } from '@/lib/newsletter/service';

export const dynamic = 'force-dynamic';

/** POST { email, topics, locale, consent, startedAt, website } → SubscribeResult */
export async function POST(request: Request) {
  // Same-origin form posts only
  const origin = request.headers.get('origin');
  const self = new URL(request.url).origin;
  if (origin && origin !== self && origin !== process.env.NEXT_PUBLIC_SITE_URL) {
    return Response.json({ result: 'error', code: 'invalid' }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ result: 'error', code: 'invalid' }, { status: 400 });
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const result = await subscribe(body, { ip, userAgent: request.headers.get('user-agent') ?? '', origin: self });
  const status =
    result.result === 'error'
      ? { invalid: 400, consent: 400, topics: 400, rate_limited: 429, unavailable: 503, server: 500 }[result.code]
      : 200;
  return Response.json(result, { status });
}
