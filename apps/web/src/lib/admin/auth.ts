import 'server-only';
import { redirect } from 'next/navigation';
import { createSessionClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * The signed-in administrator, checked on the server for every admin page and action:
 * a valid session (getUser asks Supabase Auth, it doesn't trust the cookie alone) and a row in
 * admin_users (via is_admin()). RLS checks the same again on every write.
 */
export async function getAdmin() {
  if (!isSupabaseConfigured()) return { status: 'unconfigured' as const };
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'signed-out' as const };
  const { data: isAdmin, error } = await supabase.rpc('is_admin');
  if (error || !isAdmin) return { status: 'forbidden' as const, user };
  return { status: 'admin' as const, user, supabase };
}

/** For pages: the admin session, or a redirect to the login page */
export async function requireAdminPage() {
  const admin = await getAdmin();
  if (admin.status !== 'admin') redirect(admin.status === 'forbidden' ? '/admin/login?error=forbidden' : '/admin/login');
  return admin;
}

/** For actions: the admin session, or an error (never trust that the page was protected) */
export async function requireAdminAction() {
  const admin = await getAdmin();
  if (admin.status !== 'admin') throw new Error('Accès refusé');
  return admin;
}
