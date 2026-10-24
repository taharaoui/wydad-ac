/**
 * Supabase is optional until the club's project is connected: while the URL or key is missing or
 * still a placeholder, every reader falls back to the content bundled with the site.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function isSupabaseConfigured(): boolean {
  return /^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$|^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 30;
}

/**
 * Public pages read Supabase only once the import of the bundled content has been checked
 * (CMS_SOURCE=supabase). Until then they keep the bundled content, so connecting the project
 * never shows an empty site. The admin works as soon as Supabase is configured.
 */
export function isCmsLive(): boolean {
  return isSupabaseConfigured() && process.env.CMS_SOURCE === 'supabase';
}

/** Cache tag shared by every public CMS read; admin writes revalidate it */
export const CMS_TAG = 'cms';
