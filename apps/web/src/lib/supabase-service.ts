import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client for server routes only (newsletter). Bypasses RLS, so it is never imported by
 * client code and the key has no NEXT_PUBLIC_ prefix. Null when Supabase isn't configured.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/.test(url)) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
