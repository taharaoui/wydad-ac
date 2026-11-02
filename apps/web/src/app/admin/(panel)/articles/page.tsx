import Link from 'next/link';
import { requireStaffPage } from '@/lib/admin/auth';
import { articleTitle, getTaxonomy } from '@/lib/editorial/data';
import { LANGUAGES } from '@/lib/editorial/spec';
import { StatusBadge, statusOf } from '@/components/admin/editorial/StatusBadge';
import { ArticleRowActions } from '@/components/admin/editorial/ArticleRowActions';

export const metadata = { title: 'Articles' };
const PER_PAGE = 25;

const fmt = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Casablanca' }).format(new Date(iso)) : '—';

type Search = { q?: string; category?: string; language?: string; status?: string; mine?: string; page?: string };

export default async function ArticlesPage({ searchParams }: { searchParams: Search }) {
  const { supabase, member } = await requireStaffPage();
  const isAdmin = member.role === 'admin';
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { groups, categories } = await getTaxonomy(supabase);
  const catName = new Map(categories.map((c) => [c.id, c.name.fr]));

  let query = supabase
    .from('news_articles')
    .select('id, slug, title, language, category_id, status, published_at, updated_at, author, cover_url, created_by', { count: 'exact' })
    .order('updated_at', { ascending: false });
  const q = (searchParams.q ?? '').replace(/[%,()*\\]/g, ' ').trim();
  if (q) query = query.or(`title->>fr.ilike.%${q}%,title->>ar.ilike.%${q}%,title->>en.ilike.%${q}%,slug.ilike.%${q}%`);
  if (searchParams.category) query = query.eq('category_id', searchParams.category);
  if (searchParams.language === 'multi') query = query.is('language', null);
  else if (searchParams.language) query = query.eq('language', searchParams.language);
  const now = new Date().toISOString();
  if (searchParams.status === 'scheduled') query = query.eq('status', 'published').gt('published_at', now);
  else if (searchParams.status === 'published') query = query.eq('status', 'published').lte('published_at', now);
  else if (searchParams.status) query = query.eq('status', searchParams.status as 'draft' | 'review');
  if (searchParams.mine) query = query.eq('created_by', member.userId);
  const { data: rows, count, error } = await query.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  const pages = Math.max(1, Math.ceil((count ?? 0) / PER_PAGE));
  const filtered = !!(q || searchParams.category || searchParams.language || searchParams.status || searchParams.mine);
  const link = (p: number) => `/admin/articles?${new URLSearchParams({ ...(searchParams as Record<string, string>), page: String(p) })}`;
  const select = 'min-h-11 rounded-lg border border-border bg-white px-3 text-[15px]';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-condensed text-4xl font-extrabold uppercase italic">Articles</h1>
          <p className="mt-1 text-fg-secondary">{count ?? 0} article(s){filtered ? ' correspondant aux filtres' : ''}. Seuls les articles publiés sont visibles sur le site.</p>
        </div>
        <Link href="/admin/articles/new" className="inline-flex min-h-11 items-center rounded-lg bg-wydad-logo px-5 font-semibold text-white hover:bg-wydad-red-hover">
          + Créer un article
        </Link>
      </header>

      <form className="grid gap-3 rounded-2xl border border-border bg-white p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto]" role="search">
        <label className="sr-only" htmlFor="q">Rechercher</label>
        <input id="q" name="q" defaultValue={searchParams.q} placeholder="Rechercher un titre…" className={`${select} w-full`} />
        <label className="sr-only" htmlFor="f-category">Catégorie</label>
        <select id="f-category" name="category" defaultValue={searchParams.category ?? ''} className={select}>
          <option value="">Toutes les catégories</option>
          {groups.map((g) => (
            <optgroup key={g.id} label={g.name.fr}>
              {categories.filter((c) => c.parentId === g.id).map((c) => (
                <option key={c.id} value={c.id}>{c.name.fr}</option>
              ))}
            </optgroup>
          ))}
          {categories.some((c) => !c.parentId) && (
            <optgroup label="Anciennes catégories">
              {categories.filter((c) => !c.parentId).map((c) => (
                <option key={c.id} value={c.id}>{c.name.fr}</option>
              ))}
            </optgroup>
          )}
        </select>
        <label className="sr-only" htmlFor="f-language">Langue</label>
        <select id="f-language" name="language" defaultValue={searchParams.language ?? ''} className={select}>
          <option value="">Toutes les langues</option>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
          <option value="multi">Trilingues (anciens)</option>
        </select>
        <label className="sr-only" htmlFor="f-status">Statut</label>
        <select id="f-status" name="status" defaultValue={searchParams.status ?? ''} className={select}>
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillons</option>
          <option value="review">À relire</option>
          <option value="scheduled">Programmés</option>
          <option value="published">Publiés</option>
        </select>
        <div className="flex items-center gap-2">
          <button type="submit" className="min-h-11 rounded-lg bg-wydad-charcoal px-4 font-semibold text-white">Filtrer</button>
          {filtered && <Link href="/admin/articles" className="text-sm font-semibold text-fg-muted hover:text-fg">Effacer</Link>}
        </div>
        <label className="flex items-center gap-2 text-sm text-fg-secondary sm:col-span-2 lg:col-span-5">
          <input type="checkbox" name="mine" value="1" defaultChecked={!!searchParams.mine} className="h-4 w-4 accent-wydad-logo" />
          Seulement mes articles
        </label>
      </form>

      {error && <p className="text-sm text-wydad-red">Chargement impossible : {error.message}</p>}

      {(rows ?? []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center">
          <p className="font-semibold text-fg">{filtered ? 'Aucun article ne correspond.' : 'Aucun article pour l’instant.'}</p>
          <Link href="/admin/articles/new" className="mt-3 inline-block font-semibold text-wydad-logo underline">Écrire le premier article</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="hidden border-b border-border bg-surface-secondary/60 text-start text-xs uppercase tracking-wide text-fg-muted lg:table-header-group">
              <tr>
                <th className="w-24 px-4 py-3 text-start font-semibold"><span className="sr-only">Image</span></th>
                <th className="px-2 py-3 text-start font-semibold">Titre</th>
                <th className="px-2 py-3 text-start font-semibold">Catégorie</th>
                <th className="px-2 py-3 text-start font-semibold">Langue</th>
                <th className="px-2 py-3 text-start font-semibold">Auteur</th>
                <th className="px-2 py-3 text-start font-semibold">Statut</th>
                <th className="px-2 py-3 text-start font-semibold">Publication</th>
                <th className="px-2 py-3 text-start font-semibold">Modifié</th>
                <th className="px-4 py-3 text-start font-semibold"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(rows ?? []).map((r) => {
                const title = articleTitle(r) || '(sans titre)';
                const own = r.created_by === member.userId;
                const display = statusOf(r.status, r.published_at);
                const canEdit = isAdmin || (own && (r.status !== 'published' || member.canPublish));
                const lang = LANGUAGES.find((l) => l.code === r.language);
                const publicUrl = display === 'published' ? `${r.language === 'ar' ? '' : `/${r.language ?? 'fr'}`}/news/${r.slug}` : undefined;
                return (
                  <tr key={r.id} className="grid grid-cols-[72px_minmax(0,1fr)] gap-x-3 gap-y-1 px-4 py-4 lg:table-row lg:p-0">
                    <td className="row-span-4 lg:px-4 lg:py-3">
                      {r.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.cover_url} alt="" className="aspect-video w-[72px] rounded-md object-cover" />
                      ) : (
                        <span className="flex aspect-video w-[72px] items-center justify-center rounded-md bg-surface-secondary text-[10px] text-fg-muted">Pas d’image</span>
                      )}
                    </td>
                    <td className="lg:px-2 lg:py-3">
                      <Link href={`/admin/articles/${r.id}`} dir={r.language === 'ar' ? 'rtl' : undefined} className="line-clamp-2 font-semibold text-fg hover:text-wydad-logo">
                        {title}
                      </Link>
                    </td>
                    <td className="text-fg-secondary lg:px-2 lg:py-3">{catName.get(r.category_id) ?? '—'}</td>
                    <td className="lg:px-2 lg:py-3">
                      <span className="inline-flex rounded-md bg-surface-secondary px-2 py-0.5 text-xs font-bold uppercase text-fg">{lang ? `${lang.code} · ${lang.label}` : 'FR·AR·EN'}</span>
                    </td>
                    <td className="text-fg-secondary lg:px-2 lg:py-3">{r.author || '—'}</td>
                    <td className="lg:px-2 lg:py-3"><StatusBadge status={display} /></td>
                    <td className="text-fg-secondary lg:px-2 lg:py-3"><span className="lg:hidden">Publication : </span>{fmt(r.published_at)}</td>
                    <td className="text-fg-muted lg:px-2 lg:py-3"><span className="lg:hidden">Modifié : </span>{fmt(r.updated_at)}</td>
                    <td className="col-span-2 pt-2 lg:px-4 lg:py-3">
                      <ArticleRowActions id={r.id} title={title} publicUrl={publicUrl} canEdit={canEdit} canDelete={isAdmin || (own && (r.status === 'draft' || r.status === 'review'))} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-2 text-sm">
          {page > 1 && <Link href={link(page - 1)} className="rounded-lg border border-border bg-white px-3 py-2 font-semibold">Précédente</Link>}
          <span className="text-fg-muted">Page {page} / {pages}</span>
          {page < pages && <Link href={link(page + 1)} className="rounded-lg border border-border bg-white px-3 py-2 font-semibold">Suivante</Link>}
        </nav>
      )}
    </div>
  );
}
