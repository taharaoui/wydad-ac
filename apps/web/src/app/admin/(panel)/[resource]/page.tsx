import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireAdminPage } from '@/lib/admin/auth';
import { getResource } from '@/lib/admin/resources';
import { relationLabels } from '@/lib/admin/data';
import { STATUS_OPTIONS, type ListColumn } from '@/lib/admin/types';
import { pick } from '@/lib/cms/l10n';
import { EditPage } from './EditPage';

const PER_PAGE = 20;

export async function generateMetadata({ params }: { params: { resource: string } }) {
  return { title: getResource(params.resource)?.label ?? 'Admin' };
}

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-amber-50 text-amber-800',
  archived: 'bg-surface-secondary text-fg-muted',
};

function Cell({ column, value, labels }: { column: ListColumn; value: unknown; labels?: Map<string, string> }) {
  if (value == null || value === '') return <span className="text-fg-muted">—</span>;
  switch (column.type) {
    case 'l10n':
      return <>{pick(value as never, 'fr') || <span className="text-fg-muted">—</span>}</>;
    case 'status':
      return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[String(value)] ?? ''}`}>{STATUS_OPTIONS.find((o) => o.value === value)?.label ?? String(value)}</span>;
    case 'boolean':
      return <>{value ? 'Oui' : 'Non'}</>;
    case 'date':
      return <>{new Date(String(value)).toLocaleDateString('fr-FR', { timeZone: 'UTC' })}</>;
    case 'datetime':
      return <>{new Date(String(value)).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Casablanca' })}</>;
    case 'relation':
      return <>{labels?.get(String(value)) ?? '—'}</>;
    case 'image':
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={String(value)} alt="" className="h-10 w-10 rounded-md object-cover" />;
    default:
      return <>{String(value)}</>;
  }
}

export default async function ResourceList({ params, searchParams }: { params: { resource: string }; searchParams: { q?: string; status?: string; page?: string; deleted?: string } }) {
  const resource = getResource(params.resource);
  if (!resource) notFound();
  if (resource.singleton) return <EditPage resource={resource} id={resource.singleton} />;

  const { supabase } = await requireAdminPage();
  const db = supabase as unknown as SupabaseClient;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = (searchParams.q ?? '').trim().slice(0, 100);
  const status = STATUS_OPTIONS.some((o) => o.value === searchParams.status) ? searchParams.status : undefined;

  let query = db.from(resource.table).select('*', { count: 'exact' });
  if (q && resource.search) {
    // Escape PostgREST pattern characters typed by the user
    const like = `%${q.replace(/[%_,()]/g, ' ')}%`;
    query = resource.search.l10n
      ? query.or(['fr', 'ar', 'en'].map((l) => `${resource.search!.column}->>${l}.ilike.${like}`).join(','))
      : query.ilike(resource.search.column, like);
  }
  if (status && resource.statusFilter) query = query.eq('status', status);
  for (const o of resource.order) query = query.order(o.column, { ascending: o.ascending ?? true, nullsFirst: false });
  const { data, count, error } = await query.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  const rows = (data ?? []) as Record<string, unknown>[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PER_PAGE));

  const relationMaps = new Map<string, Map<string, string>>();
  await Promise.all(
    resource.list
      .filter((c) => c.type === 'relation' && c.relation)
      .map(async (c) => relationMaps.set(c.column, new Map((await relationLabels(db, c.relation!)).map((o) => [o.value, o.label])))),
  );

  const idOf = (row: Record<string, unknown>) => encodeURIComponent(String(row[resource.idColumn ?? 'id']));
  const href = (p: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { q: q || undefined, status, page: undefined as number | undefined, ...p };
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== '' && !(k === 'page' && v === 1)) sp.set(k, String(v));
    const s = sp.toString();
    return `/admin/${resource.key}${s ? `?${s}` : ''}`;
  };
  const [first, ...rest] = resource.list.filter((c) => c.type !== 'image');
  const image = resource.list.find((c) => c.type === 'image');

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-condensed text-4xl font-extrabold uppercase italic">{resource.label}</h1>
          <p className="mt-1 max-w-2xl text-fg-secondary">{resource.description}</p>
        </div>
        {resource.canCreate !== false && (
          <Link href={`/admin/${resource.key}/new`} className="inline-flex min-h-11 items-center rounded-lg bg-wydad-logo px-5 font-semibold text-white hover:bg-wydad-red-hover">
            + Ajouter
          </Link>
        )}
      </header>

      {searchParams.deleted && (
        <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Supprimé. Le site est à jour.
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-wydad-red/10 px-4 py-3 text-sm font-medium text-wydad-red">
          Chargement impossible : {error.message}
        </p>
      )}

      {(resource.search || resource.statusFilter) && (
        <form className="flex flex-wrap gap-2" role="search">
          {resource.search && (
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Rechercher…"
              aria-label={`Rechercher dans ${resource.label}`}
              className="min-h-11 w-full max-w-xs rounded-lg border border-border bg-white px-3 text-[15px] outline-none focus:border-wydad-logo"
            />
          )}
          {resource.statusFilter && (
            <select name="status" defaultValue={status ?? ''} aria-label="Statut" className="min-h-11 rounded-lg border border-border bg-white px-3 text-[15px]">
              <option value="">Tous les statuts</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          <button type="submit" className="min-h-11 rounded-lg border border-border bg-white px-4 font-semibold hover:border-wydad-logo">
            Filtrer
          </button>
          {(q || status) && (
            <Link href={`/admin/${resource.key}`} className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-fg-muted hover:text-fg">
              Effacer
            </Link>
          )}
        </form>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
          <p className="font-semibold text-fg">{q || status ? 'Aucun résultat.' : 'Rien pour l’instant.'}</p>
          {resource.canCreate !== false && !q && !status && (
            <Link href={`/admin/${resource.key}/new`} className="mt-3 inline-block font-semibold text-wydad-red hover:underline">
              Ajouter le premier élément
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Table on larger screens */}
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-secondary/60 text-xs uppercase tracking-wide text-fg-muted">
                <tr>
                  {resource.list.map((c) => (
                    <th key={c.column} scope="col" className="px-4 py-3 font-semibold">
                      {c.label || <span className="sr-only">Image</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={idOf(row)} className="hover:bg-surface-secondary/40">
                    {resource.list.map((c) => (
                      <td key={c.column} className={`px-4 py-3 ${c.type === 'image' ? 'w-14' : ''}`}>
                        {c === first ? (
                          <Link href={`/admin/${resource.key}/${idOf(row)}`} className="font-semibold text-fg hover:text-wydad-red">
                            <Cell column={c} value={row[c.column]} labels={relationMaps.get(c.column)} />
                          </Link>
                        ) : (
                          <Cell column={c} value={row[c.column]} labels={relationMaps.get(c.column)} />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards on phones */}
          <ul className="space-y-2 md:hidden">
            {rows.map((row) => (
              <li key={idOf(row)}>
                <Link href={`/admin/${resource.key}/${idOf(row)}`} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 shadow-sm">
                  {image && row[image.column] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={String(row[image.column])} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
                  ) : null}
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      <Cell column={first} value={row[first.column]} labels={relationMaps.get(first.column)} />
                    </span>
                    <span className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-fg-muted">
                      {rest.slice(0, 3).map((c) => (
                        <span key={c.column}>
                          <Cell column={c} value={row[c.column]} labels={relationMaps.get(c.column)} />
                        </span>
                      ))}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
              <span className="text-fg-muted">
                Page {page} sur {pages} · {count} éléments
              </span>
              <span className="flex gap-2">
                {page > 1 && (
                  <Link href={href({ page: page - 1 })} className="rounded-lg border border-border bg-white px-3 py-2 font-semibold hover:border-wydad-logo">
                    Précédente
                  </Link>
                )}
                {page < pages && (
                  <Link href={href({ page: page + 1 })} className="rounded-lg border border-border bg-white px-3 py-2 font-semibold hover:border-wydad-logo">
                    Suivante
                  </Link>
                )}
              </span>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
