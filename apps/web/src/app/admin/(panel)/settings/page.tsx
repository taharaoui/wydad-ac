import Link from 'next/link';
import { requireAdminPage } from '@/lib/admin/auth';
import { GROUPS, RESOURCES } from '@/lib/admin/resources';
import { isCmsLive } from '@/lib/supabase/config';
import { COVER, DEVICES, MAX_IMAGE_BYTES } from '@/lib/editorial/spec';

export const metadata = { title: 'Réglages du site' };

/** Administrator hub: the site modules (menus, home page, pages, sport data) and the newsroom settings */
export default async function SettingsPage() {
  await requireAdminPage();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-condensed text-4xl font-extrabold uppercase italic">Réglages du site</h1>
        <p className="mt-1 max-w-3xl text-fg-secondary">Les autres contenus du site, réservés aux administrateurs.</p>
      </header>

      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="font-condensed text-2xl font-extrabold uppercase">Rédaction</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-fg-muted">Site public</dt>
            <dd className="font-semibold">{isCmsLive() ? 'Lit les articles publiés ici' : 'Contenu intégré (CMS_SOURCE ≠ supabase)'}</dd>
          </div>
          <div>
            <dt className="text-fg-muted">Image d’article</dt>
            <dd className="font-semibold">{COVER.label}, {MAX_IMAGE_BYTES / 1024 / 1024} Mo max</dd>
          </div>
          <div>
            <dt className="text-fg-muted">Écrans vérifiés</dt>
            <dd className="font-semibold">{DEVICES.map((d) => `${d.label} ${d.width} px`).join(' · ')}</dd>
          </div>
        </dl>
        <p className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/admin/users" className="font-semibold text-wydad-logo underline">Utilisateurs et droits</Link>
          <Link href="/admin/categories" className="font-semibold text-wydad-logo underline">Catégories</Link>
        </p>
      </section>

      {GROUPS.map((g) => {
        const list = RESOURCES.filter((r) => r.group === g.key);
        if (!list.length) return null;
        return (
          <section key={g.key}>
            <h2 className="mb-3 font-condensed text-2xl font-extrabold uppercase">{g.label}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((r) => (
                <li key={r.key}>
                  <Link href={`/admin/${r.key}`} className="block h-full rounded-2xl border border-border bg-white p-4 shadow-sm hover:border-wydad-logo">
                    <span className="font-semibold text-fg">{r.label}</span>
                    <span className="mt-1 block text-sm text-fg-secondary">{r.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
