import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { SUPABASE_URL } from './config';

/**
 * Service-role client: bypasses RLS. Server-only and never used for a request on behalf of a
 * visitor; reserved for maintenance (import script, provisioning). SUPABASE_SERVICE_ROLE_KEY has
 * no NEXT_PUBLIC_ prefix, so Next never ships it to the browser.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient<Database>(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
