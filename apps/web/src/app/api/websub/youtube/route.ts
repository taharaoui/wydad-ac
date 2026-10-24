import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { WAC_CHANNEL_ID, YOUTUBE_TAG, YOUTUBE_TOPIC } from '@/lib/videos';

/**
 * YouTube push notifications (WebSub, pubsubhubbub.appspot.com): the hub calls this when the club's
 * channel publishes or edits a video, and Wydad TV, the news and the hero refresh at once instead of
 * waiting for the 10-minute feed refresh. The subscription is renewed daily by ../subscribe.
 */
export const dynamic = 'force-dynamic';

/** The hub confirms a (re)subscription: echo its challenge, only for our channel */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const challenge = params.get('hub.challenge');
  if (!challenge || params.get('hub.topic') !== YOUTUBE_TOPIC) return new Response('Unknown topic', { status: 404 });
  return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
}

/** A new or updated video: check the hub's signature, then drop the cached channel feed */
export async function POST(request: Request) {
  const body = await request.text();
  const secret = process.env.WEBSUB_SECRET;
  if (secret) {
    const signature = request.headers.get('x-hub-signature') ?? '';
    const expected = `sha1=${createHmac('sha1', secret).update(body).digest('hex')}`;
    const valid = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    // The spec asks to acknowledge anyway, and ignore notifications that fail verification
    if (!valid) return new Response(null, { status: 202 });
  }
  if (body.includes(WAC_CHANNEL_ID)) revalidateTag(YOUTUBE_TAG);
  return new Response(null, { status: 204 });
}
