import { requireAdminPage } from '@/lib/admin/auth';
import { GROUPS, RESOURCES } from '@/lib/admin/resources';
import { AdminNav } from '@/components/admin/AdminNav';
import { signOut } from '../actions';

export const dynamic = 'force-dynamic';

/** Every admin page: checks the administrator on the server before rendering anything */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdminPage();
  const groups = GROUPS.map((g) => ({
    label: g.label,
    items: [
      ...RESOURCES.filter((r) => r.group === g.key).map((r) => ({ href: `/admin/${r.key}`, label: r.label })),
      ...(g.key === 'site' ? [{ href: '/admin/media', label: 'Médiathèque' }] : []),
    ],
  }));
  return (
    <div className="min-h-screen lg:ps-64">
      <AdminNav groups={groups} email={user.email ?? ''} signOut={signOut} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
