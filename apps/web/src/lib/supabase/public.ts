import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { CMS_TAG, SUPABASE_ANON_KEY, SUPABASE_URL, isCmsLive } from './config';

/**
 * Anonymous client for public pages: it only ever sees what RLS lets visitors see (published
 * content). Responses go through Next's data cache under the `cms` tag, refreshed every 5 minutes
 * and immediately after an admin edit.
 */
export function createPublicClient() {
  if (!isCmsLive()) return null;
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { tags: [CMS_TAG], revalidate: 300 } }),
    },
  });
}
