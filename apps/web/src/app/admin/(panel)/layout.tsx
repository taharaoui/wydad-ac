import { requireStaffPage } from '@/lib/admin/auth';
import { AdminNav, type NavGroup } from '@/components/admin/AdminNav';
import { ToastProvider } from '@/components/admin/Toast';
import { signOut } from '../actions';

export const dynamic = 'force-dynamic';

/**
 * Every admin page: checks the newsroom member on the server before rendering anything. Editors see
 * the newsroom; administrators also see users, categories, settings and the site modules.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { member, supabase } = await requireStaffPage();
  const isAdmin = member.role === 'admin';
  const { count: toReview } = isAdmin
    ? await supabase.from('news_articles').select('id', { count: 'exact', head: true }).eq('status', 'review')
    : { count: 0 };

  const groups: NavGroup[] = [
    {
      items: [
        { href: '/admin', label: 'Tableau de bord' },
        { href: '/admin/articles/new', label: 'Créer un article', primary: true },
        { href: '/admin/articles', label: 'Articles', badge: toReview ?? 0 },
        ...(isAdmin ? [{ href: '/admin/categories', label: 'Catégories' }] : []),
        { href: '/admin/media', label: 'Médiathèque' },
        { href: '/admin/guidelines', label: 'Consignes éditoriales' },
      ],
    },
    ...(isAdmin
      ? [
          {
            label: 'Administration',
            items: [
              { href: '/admin/users', label: 'Utilisateurs' },
              { href: '/admin/settings', label: 'Réglages du site' },
            ],
          },
        ]
      : []),
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen lg:ps-64">
        <AdminNav groups={groups} email={member.email} role={member.role} signOut={signOut} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </ToastProvider>
  );
}
