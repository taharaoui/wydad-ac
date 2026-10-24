import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireAdminPage } from '@/lib/admin/auth';
import { getResource } from '@/lib/admin/resources';
import { isCmsLive } from '@/lib/supabase/config';
import { getRecentMatches } from '@/services/matches';
import { pick } from '@/lib/cms/l10n';

export const metadata = { title: 'Tableau de bord' };

const fmt = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Casablanca' }).format(new Date(iso));

/** Tables whose latest edits are listed, with the column naming each row */
const RECENT: { resource: string; label: string; l10n?: boolean }[] = [
  { resource: 'news', label: 'title', l10n: true },
  { resource: 'pages', label: 'title', l10n: true },
  { resource: 'highlights', label: 'title', l10n: true },
  { resource: 'staff', label: 'name' },
  { resource: 'galleries', label: 'title', l10n: true },
  { resource: 'matches', label: 'slug' },
  { resource: 'announcements', label: 'message', l10n: true },
  { resource: 'memberships', label: 'name', l10n: true },
];

export default async function Dashboard() {
  const { supabase } = await requireAdminPage();
  const db = supabase as unknown as SupabaseClient;
  const count = async (table: string, filter?: [string, string]) => {
    let q = db.from(table).select('*', { count: 'exact', head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    const { count: n } = await q;
    return n ?? 0;
  };

  const now = new Date().toISOString();
  const [published, drafts, players, staff, pages, media, manualMatches, botola, recentLists] = await Promise.all([
    count('news_articles', ['status', 'published']),
    count('news_articles', ['status', 'draft']),
    count('players'),
    count('staff_members', ['status', 'published']),
    count('pages', ['status', 'published']),
    count('media'),
    db.from('matches').select('id, slug, kickoff, sport, status').gte('kickoff', now).order('kickoff').limit(5),
    getRecentMatches(8).catch(() => []),
    Promise.all(
      RECENT.map(async (r) => {
        const def = getResource(r.resource)!;
        const { data } = await db.from(def.table).select(`id, updated_at, ${r.label}` as '*').order('updated_at', { ascending: false }).limit(5);
        return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
          href: `/admin/${def.key}/${row.id}`,
          module: def.label,
          label: (r.l10n ? pick(row[r.label] as never, 'fr') : String(row[r.label] ?? '')) || '(sans titre)',
          updated: String(row.updated_at),
        }));
      }),
    ),
  ]);
  const recent = recentLists.flat().sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 8);
  const nextBotola = botola.filter((m) => m.status === 'scheduled' || m.status === 'live').sort((a, b) => a.kickoff.localeCompare(b.kickoff)).slice(0, 3);

  const stats = [
    { label: 'Articles publiés', value: published, href: '/admin/news?status=published' },
    { label: 'Brouillons', value: drafts, href: '/admin/news?status=draft' },
    { label: 'Joueurs enregistrés', value: players, href: '/admin/players' },
    { label: 'Membres du staff', value: staff, href: '/admin/staff' },
    { label: 'Pages publiées', value: pages, href: '/admin/pages' },
    { label: 'Médias', value: media, href: '/admin/media' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-condensed text-4xl font-extrabold uppercase italic">Tableau de bord</h1>
        <p className="mt-1 text-fg-secondary">Contenus du site enregistrés dans Supabase.</p>
      </header>

      {!isCmsLive() && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <p className="font-semibold">Le site public affiche encore le contenu intégré au code.</p>
          <p className="mt-1">
            Vos modifications sont bien enregistrées. Pour que le site les affiche, vérifiez l’import puis définissez <code className="rounded bg-white px-1">CMS_SOURCE=supabase</code> sur Vercel (voir docs/ADMIN.md).
          </p>
        </div>
      )}

      <section aria-label="Raccourcis" className="flex flex-wrap gap-2">
        {[
          ['/admin/news/new', 'Nouvel article'],
          ['/admin/highlights/new', 'Actualité de section'],
          ['/admin/announcements/new', 'Annonce'],
          ['/admin/pages/new', 'Nouvelle page'],
          ['/admin/media', 'Importer des images'],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="rounded-lg bg-wydad-logo px-4 py-2.5 text-sm font-semibold text-white hover:bg-wydad-red-hover">
            + {label}
          </Link>
        ))}
      </section>

      <section aria-label="Chiffres" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl border border-border bg-white p-4 shadow-sm hover:border-wydad-logo">
            <p className="font-condensed text-4xl font-extrabold tabular-nums text-wydad-red">{s.value}</p>
            <p className="mt-1 text-sm text-fg-secondary">{s.label}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-condensed text-2xl font-bold uppercase">Prochains matchs</h2>
          <ul className="mt-4 divide-y divide-border">
            {nextBotola.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="font-medium">
                  {m.home_team.short_name || m.home_team.name} – {m.away_team.short_name || m.away_team.name}
                  <span className="ms-2 rounded bg-surface-secondary px-1.5 py-0.5 text-xs text-fg-muted">Botola · TheStatsAPI</span>
                </span>
                <span className="shrink-0 text-fg-muted">{fmt(m.kickoff)}</span>
              </li>
            ))}
            {(manualMatches.data ?? []).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <Link href={`/admin/matches/${m.id}`} className="font-medium hover:text-wydad-red">
                  {m.slug}
                  <span className="ms-2 rounded bg-surface-secondary px-1.5 py-0.5 text-xs text-fg-muted">{m.sport}</span>
                </Link>
                <span className="shrink-0 text-fg-muted">{fmt(m.kickoff)}</span>
              </li>
            ))}
            {nextBotola.length === 0 && !(manualMatches.data ?? []).length && <li className="py-2.5 text-sm text-fg-muted">Aucun match à venir.</li>}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-condensed text-2xl font-bold uppercase">Dernières modifications</h2>
          <ul className="mt-4 divide-y divide-border">
            {recent.map((r) => (
              <li key={r.href} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <Link href={r.href} className="min-w-0 truncate font-medium hover:text-wydad-red">
                  {r.label}
                </Link>
                <span className="shrink-0 text-xs text-fg-muted">
                  {r.module} · {fmt(r.updated)}
                </span>
              </li>
            ))}
            {recent.length === 0 && <li className="py-2.5 text-sm text-fg-muted">Rien pour l’instant.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
