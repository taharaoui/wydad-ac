import 'server-only';
import { redirect } from 'next/navigation';
import { createSessionClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export type Role = 'admin' | 'editor';

/** The signed-in newsroom member, as stored in admin_users */
export interface Member {
  userId: string;
  email: string;
  role: Role;
  canPublish: boolean;
  displayName: string;
  onboarded: boolean;
}

/**
 * The signed-in newsroom member (administrator or editor), checked on the server for every admin
 * page and action: a valid session (getUser asks Supabase Auth, it doesn't trust the cookie alone)
 * and an active row in admin_users. RLS checks the same again on every read and write.
 */
export async function getStaff() {
  if (!isSupabaseConfigured()) return { status: 'unconfigured' as const };
  const supabase = createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'signed-out' as const };
  const { data: row } = await supabase
    .from('admin_users')
    .select('role, can_publish, display_name, email, active, onboarded_at')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!row || !row.active) return { status: 'forbidden' as const, user };
  const role = row.role as Role;
  const member: Member = {
    userId: user.id,
    email: user.email ?? row.email ?? '',
    role,
    canPublish: role === 'admin' || row.can_publish,
    displayName: row.display_name || user.email || '',
    onboarded: !!row.onboarded_at,
  };
  return { status: 'staff' as const, user, supabase, member };
}

type Staff = Extract<Awaited<ReturnType<typeof getStaff>>, { status: 'staff' }>;

/** For pages: the member's session, or a redirect to the login page */
export async function requireStaffPage(): Promise<Staff> {
  const staff = await getStaff();
  if (staff.status !== 'staff') redirect(staff.status === 'forbidden' ? '/admin/login?error=forbidden' : '/admin/login');
  return staff;
}

/** For administrator-only pages (users, categories, settings, site modules) */
export async function requireAdminPage(): Promise<Staff> {
  const staff = await requireStaffPage();
  if (staff.member.role !== 'admin') redirect('/admin?error=admin-only');
  return staff;
}

/** For actions: the member's session, or an error (never trust that the page was protected) */
export async function requireStaffAction(): Promise<Staff> {
  const staff = await getStaff();
  if (staff.status !== 'staff') throw new Error('Accès refusé');
  return staff;
}

export async function requireAdminAction(): Promise<Staff> {
  const staff = await requireStaffAction();
  if (staff.member.role !== 'admin') throw new Error('Réservé aux administrateurs');
  return staff;
}

