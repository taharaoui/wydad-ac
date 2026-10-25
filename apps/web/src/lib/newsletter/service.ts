import 'server-only';
import { createServiceClient } from '@/lib/supabase-service';
import { CONSENT_VERSION, MIN_FILL_MS, SubscribeSchema, type SubscribeResult } from './schema';
import { confirmationMail, sendMail } from './mailer';
import { newToken, privateHash, sha256 } from './tokens';

/**
 * Newsletter subscriptions: double opt-in, duplicates, unsubscribe, rate limits.
 * Pure server code (no React), reusable by a future admin or mobile backend.
 */

const CONFIRM_TTL_MS = 48 * 3_600_000;
/** Don't resend a confirmation more often than this */
const RESEND_AFTER_MS = 2 * 60_000;
const LIMITS = { perIp: 5, perEmail: 3, windowMs: 15 * 60_000 };

/** Path of a localized page (Arabic is the default locale, without prefix) */
export const localePath = (locale: string, path: string) => (locale === 'ar' ? path : `/${locale}${path}`);

/** First line of defence, per server instance: absorbs bursts before they reach the database */
const recent = new Map<string, number[]>();
function burst(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > limit;
}

export interface RequestMeta {
  ip: string;
  userAgent: string;
  origin: string;
}

export async function subscribe(raw: unknown, meta: RequestMeta): Promise<SubscribeResult> {
  const parsed = SubscribeSchema.safeParse(raw);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path[0]);
    if (fields.includes('consent')) return { result: 'error', code: 'consent' };
    if (fields.includes('topics')) return { result: 'error', code: 'topics' };
    return { result: 'error', code: 'invalid' };
  }
  const input = parsed.data;
  const db = createServiceClient();
  if (!db) return { result: 'error', code: 'unavailable' };

  const ipHash = privateHash(meta.ip);
  const emailHash = privateHash(input.email);
  // Bots: honeypot filled or form sent faster than a person could type
  const suspicious = !!input.website || Date.now() - input.startedAt < MIN_FILL_MS;

  if (burst(`ip:${ipHash}`, LIMITS.perIp, LIMITS.windowMs)) return { result: 'error', code: 'rate_limited' };
  const since = new Date(Date.now() - LIMITS.windowMs).toISOString();
  const [{ count: ipCount }, { count: emailCount }] = await Promise.all([
    db.from('newsletter_events').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since),
    db.from('newsletter_events').select('id', { count: 'exact', head: true }).eq('email_hash', emailHash).gte('created_at', since),
  ]);
  if ((ipCount ?? 0) >= LIMITS.perIp || (emailCount ?? 0) >= LIMITS.perEmail) return { result: 'error', code: 'rate_limited' };

  await db.from('newsletter_events').insert({ kind: suspicious ? 'rejected' : 'subscribe', ip_hash: ipHash, email_hash: emailHash });
  // Bots get the same answer as people, but nothing is stored or sent
  if (suspicious) return { result: 'pending', emailSent: false };

  const { data: existing, error: readError } = await db
    .from('newsletter_subscribers')
    .select('id, status, confirm_sent_at, unsubscribe_token')
    .eq('email_normalized', input.email)
    .maybeSingle();
  if (readError) return { result: 'error', code: 'server' };

  const token = newToken();
  const pending = {
    status: 'pending',
    topics: input.topics,
    locale: input.locale,
    source: input.source ?? null,
    consent_at: new Date().toISOString(),
    consent_text: CONSENT_VERSION,
    confirm_token_hash: sha256(token),
    confirm_expires_at: new Date(Date.now() + CONFIRM_TTL_MS).toISOString(),
    ip_hash: ipHash,
    user_agent: meta.userAgent.slice(0, 300),
    updated_at: new Date().toISOString(),
  };

  let unsubscribeToken: string;
  if (!existing) {
    unsubscribeToken = newToken();
    const { error } = await db.from('newsletter_subscribers').insert({ email: input.email, ...pending, unsubscribe_token: unsubscribeToken });
    if (error) return error.code === '23505' ? { result: 'exists' } : { result: 'error', code: 'server' };
  } else if (existing.status === 'confirmed') {
    // Already subscribed: change nothing (preferences aren't editable without the confirmation link)
    return { result: 'exists' };
  } else {
    // Pending or unsubscribed: renew consent and send a fresh link, not too often
    const sentRecently = existing.confirm_sent_at && Date.now() - new Date(existing.confirm_sent_at).getTime() < RESEND_AFTER_MS;
    if (existing.status === 'pending' && sentRecently) return { result: 'exists' };
    unsubscribeToken = existing.unsubscribe_token;
    const { error } = await db.from('newsletter_subscribers').update(pending).eq('id', existing.id);
    if (error) return { result: 'error', code: 'server' };
    if (existing.status === 'pending') {
      const sent = await sendConfirmation(input.email, input.locale, token, unsubscribeToken, meta.origin);
      if (sent) await db.from('newsletter_subscribers').update({ confirm_sent_at: new Date().toISOString() }).eq('id', existing.id);
      return { result: 'exists' };
    }
  }

  const emailSent = await sendConfirmation(input.email, input.locale, token, unsubscribeToken, meta.origin);
  if (emailSent) await db.from('newsletter_subscribers').update({ confirm_sent_at: new Date().toISOString() }).eq('email_normalized', input.email);
  return { result: 'pending', emailSent };
}

function sendConfirmation(email: string, locale: 'ar' | 'fr' | 'en', token: string, unsubscribeToken: string, origin: string) {
  const confirmUrl = `${origin}/api/newsletter/confirm?token=${encodeURIComponent(token)}&lang=${locale}`;
  const unsubscribeUrl = `${origin}${localePath(locale, '/newsletter/unsubscribe')}?token=${encodeURIComponent(unsubscribeToken)}`;
  return sendMail(confirmationMail(email, locale, confirmUrl, unsubscribeUrl));
}

/** Confirmation link: valid once, for 48 hours */
export async function confirm(token: string): Promise<'ok' | 'invalid' | 'unavailable'> {
  const db = createServiceClient();
  if (!db) return 'unavailable';
  if (!/^[\w-]{20,100}$/.test(token)) return 'invalid';
  const { data } = await db
    .from('newsletter_subscribers')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString(), confirm_token_hash: null, confirm_expires_at: null, updated_at: new Date().toISOString() })
    .eq('confirm_token_hash', sha256(token))
    .eq('status', 'pending')
    .gt('confirm_expires_at', new Date().toISOString())
    .select('id');
  if (data?.length) await db.from('newsletter_events').insert({ kind: 'confirm' });
  return data?.length ? 'ok' : 'invalid';
}

/** Unsubscribe link (in every email): works any time, idempotent */
export async function unsubscribe(token: string): Promise<'ok' | 'invalid' | 'unavailable'> {
  const db = createServiceClient();
  if (!db) return 'unavailable';
  if (!/^[\w-]{20,100}$/.test(token)) return 'invalid';
  const { data } = await db
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString(), confirm_token_hash: null, updated_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
    .select('id');
  if (data?.length) await db.from('newsletter_events').insert({ kind: 'unsubscribe' });
  return data?.length ? 'ok' : 'invalid';
}
