import { YOUTUBE_TOPIC } from '@/lib/videos';

/**
 * Subscribes the site to YouTube push notifications for the club's channel. Leases last 10 days;
 * the Vercel cron in vercel.json calls this daily so the subscription never lapses.
 * With CRON_SECRET set (Vercel sends it as a bearer token), other callers are refused.
 */
export const dynamic = 'force-dynamic';

const HUB = 'https://pubsubhubbub.appspot.com/subscribe';

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const origin = host ? `https://${host}` : new URL(request.url).origin;
  const form = new URLSearchParams({
    'hub.mode': 'subscribe',
    'hub.topic': YOUTUBE_TOPIC,
    'hub.callback': `${origin}/api/websub/youtube`,
    'hub.lease_seconds': String(10 * 24 * 3600),
    'hub.verify': 'async',
  });
  if (process.env.WEBSUB_SECRET) form.set('hub.secret', process.env.WEBSUB_SECRET);
  const res = await fetch(HUB, { method: 'POST', body: form, cache: 'no-store' });
  // 202: accepted, the hub will call the callback to confirm
  return Response.json({ hub: res.status, callback: `${origin}/api/websub/youtube` }, { status: res.ok ? 200 : 502 });
}
