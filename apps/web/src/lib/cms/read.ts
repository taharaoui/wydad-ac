import 'server-only';
import { createPublicClient } from '@/lib/supabase/public';

type Client = NonNullable<ReturnType<typeof createPublicClient>>;

/**
 * Reads published content from Supabase, or returns the content bundled with the site when the CMS
 * isn't live yet (see isCmsLive) or the query fails: a network error never breaks a page. Once
 * live, an empty result is real (the club removed everything) and is returned as is.
 */
export async function cmsRead<T>(label: string, fallback: T, query: (db: Client) => Promise<T | null>): Promise<T> {
  const db = createPublicClient();
  if (!db) return fallback;
  try {
    const result = await query(db);
    return result ?? fallback;
  } catch (err) {
    console.warn(`[cms] ${label} failed, using bundled content:`, err instanceof Error ? err.message : err);
    return fallback;
  }
}

/** Throws on a Supabase error so cmsRead falls back */
export function unwrap<R extends { data: unknown; error: { message: string } | null }>(result: R): Exclude<R['data'], null> | null {
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? null) as Exclude<R['data'], null> | null;
}
