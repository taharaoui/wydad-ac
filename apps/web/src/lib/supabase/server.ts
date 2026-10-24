import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

/**
 * Client acting as the signed-in user (admin pages and actions). Session cookies are httpOnly and
 * refreshed by the middleware; every write still goes through RLS, so a non-admin session can't
 * change anything even if it reaches an action.
 */
export function createSessionClient() {
  const store = cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: the middleware refreshes the session instead
        }
      },
    },
  });
}
