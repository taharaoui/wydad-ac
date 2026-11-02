import Link from 'next/link';
import { requireStaffPage } from '@/lib/admin/auth';
import { articleTitle } from '@/lib/editorial/data';
import { StatusBadge } from '@/components/admin/editorial/StatusBadge';
import { Onboarding } from '@/components/admin/editorial/Onboarding';
import { isCmsLive } from '@/lib/supabase/config';

export const metadata = { title: 'Tableau de bord' };

const fmt = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Casablanca' }).format(new Date(iso));

const ACTIONS: Record<string, string> = {
  created: 'a créé',
  updated: 'a modifié',
  submitted: 'a soumis pour relecture',
  published: 'a publié',
  scheduled: 'a programmé',
  unpublished: 'a retiré du site',
  deleted: 'a supprimé',
};

export default async function Dashboard({ searchParams }: { searchParams: { error?: string; tour?: string } }) {
  const { supabase, member } = await requireStaffPage();
  const isAdmin = member.role === 'admin';
  const now = new Date().toISOString();
  const count = async (build: (q: ReturnType<typeof base>) => ReturnType<typeof base>) => (await build(base())).count ?? 0;
  const base = () => supabase.from('news_articles').select('id', { count: 'exact', head: true });

  const [published, scheduled, drafts, review, mine, recent, toReview, activity] = await Promise.all([
    count((q) => q.eq('status', 'published').lte('published_at', now)),
    count((q) => q.eq('status', 'published').gt('published_at', now)),
    count((q) => q.eq('status', 'draft')),
    count((q) => q.eq('status', 'review')),
    supabase.from('news_articles').select('id, title, language, status, updated_at').eq('created_by', member.userId).in('status', ['draft', 'review']).order('updated_at', { ascending: false }).limit(5),
    supabase.from('news_articles').select('id, slug, title, language, published_at, cover_url').eq('status', 'published').lte('published_at', now).order('published_at', { ascending: false }).limit(5),
    supabase.from('news_articles').select('id, title, language, author, submitted_at').eq('status', 'review').order('submitted_at', { ascending: true }).limit(5),
    supabase.from('editorial_activity').select('*').order('created_at', { ascending: false }).limit(10),
  ]);

  const tiles = [
    { label: 'Publiés', value: published, href: '/admin/articles?status=published', tone: 'text-emerald-700' },
    { label: 'Programmés', value: scheduled, href: '/admin/articles?status=scheduled', tone: 'text-sky-700' },
    { label: 'À relire', value: review, href: '/admin/articles?status=review', tone: 'text-amber-700' },
    { label: 'Brouillons', value: drafts, href: '/admin/articles?status=draft', tone: 'text-fg' },
  ];

  return (
    <div className="space-y-8">
      {(!member.onboarded || searchParams.tour) && <Onboarding name={member.displayName.includes('@') ? '' : member.displayName} />}
      {searchParams.error === 'admin-only' && (
        <p role="alert" className="rounded-xl bg-wydad-red/10 px-4 py-3 text-sm font-medium text-wydad-red">Cette page est réservée aux administrateurs.</p>
      )}
      {isAdmin && !isCmsLive() && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Le site public affiche encore le contenu intégré : les articles publiés ici n’y apparaîtront qu’une fois <code>CMS_SOURCE=supabase</code> activé (voir docs/ADMIN.md).
        </p>
      )}

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-condensed text-4xl font-extrabold uppercase italic">Tableau de bord</h1>
          <p className="mt-1 text-fg-secondary">
            {isAdmin ? 'Administrateur' : member.canPublish ? 'Rédacteur · autorisé à publier' : 'Rédacteur · vos articles sont relus avant publication'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin?tour=1" className="inline-flex min-h-11 items-center rounded-lg border border-border bg-white px-4 font-semibold text-fg hover:border-wydad-logo">Revoir le guide</Link>
          <Link href="/admin/articles/new" className="inline-flex min-h-11 items-center rounded-lg bg-wydad-logo px-5 font-semibold text-white hover:bg-wydad-red-hover">+ Créer un article</Link>
        </div>
      </header>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className="block rounded-2xl border border-border bg-white p-5 shadow-sm transition-colors hover:border-wydad-logo">
              <span className={`block font-condensed text-5xl font-extrabold leading-none ${t.tone}`}>{t.value}</span>
              <span className="mt-2 block text-sm font-semibold text-fg-secondary">{t.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-2">
        {(isAdmin || member.canPublish) && (
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="font-condensed text-2xl font-extrabold uppercase">En attente de relecture</h2>
            {(toReview.data ?? []).length === 0 ? (
              <p className="mt-3 text-sm text-fg-muted">Aucun article à relire.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {toReview.data!.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link href={`/admin/articles/${a.id}`} className="min-w-0 truncate font-semibold text-fg hover:text-wydad-logo" dir={a.language === 'ar' ? 'rtl' : undefined}>{articleTitle(a)}</Link>
                    <span className="shrink-0 text-xs text-fg-muted">{a.author ?? ''}{a.submitted_at ? ` · ${fmt(a.submitted_at)}` : ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-condensed text-2xl font-extrabold uppercase">Mes articles en cours</h2>
          {(mine.data ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-fg-muted">Aucun brouillon. <Link href="/admin/articles/new" className="font-semibold text-wydad-logo underline">Écrire un article</Link></p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {mine.data!.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/articles/${a.id}`} className="min-w-0 truncate font-semibold text-fg hover:text-wydad-logo" dir={a.language === 'ar' ? 'rtl' : undefined}>{articleTitle(a) || '(sans titre)'}</Link>
                  <StatusBadge status={a.status === 'review' ? 'review' : 'draft'} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-condensed text-2xl font-extrabold uppercase">Récemment publiés</h2>
          <ul className="mt-3 divide-y divide-border">
            {(recent.data ?? []).map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2.5">
                {a.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.cover_url} alt="" className="aspect-video w-16 shrink-0 rounded object-cover" />
                ) : (
                  <span className="aspect-video w-16 shrink-0 rounded bg-surface-secondary" />
                )}
                <Link href={`/admin/articles/${a.id}`} className="min-w-0 flex-1 truncate font-semibold text-fg hover:text-wydad-logo" dir={a.language === 'ar' ? 'rtl' : undefined}>{articleTitle(a)}</Link>
                <span className="shrink-0 text-xs text-fg-muted">{a.published_at ? fmt(a.published_at) : ''}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-condensed text-2xl font-extrabold uppercase">Activité de la rédaction</h2>
          {(activity.data ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-fg-muted">Rien pour l’instant.</p>
          ) : (
            <ul className="mt-3 space-y-2.5 text-sm">
              {activity.data!.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="w-24 shrink-0 text-xs text-fg-muted">{fmt(e.created_at)}</span>
                  <span className="min-w-0 text-fg-secondary">
                    <b className="text-fg">{e.actor_name ?? 'Quelqu’un'}</b> {ACTIONS[e.action] ?? e.action}{' '}
                    {e.action !== 'deleted' && e.article_id ? (
                      <Link href={`/admin/articles/${e.article_id}`} className="font-semibold text-fg hover:text-wydad-logo">« {e.article_title} »</Link>
                    ) : (
                      <span>« {e.article_title} »</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
