import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireAdminPage } from '@/lib/admin/auth';
import { formRelationOptions } from '@/lib/admin/data';
import type { ResourceDef } from '@/lib/admin/types';
import { pick } from '@/lib/cms/l10n';
import { ResourceForm } from '@/components/admin/ResourceForm';

/** Create (id = null) or edit form of a resource, with its relation choices and child rows */
export async function EditPage({ resource, id, saved }: { resource: ResourceDef; id: string | null; saved?: boolean }) {
  const { supabase } = await requireAdminPage();
  const db = supabase as unknown as SupabaseClient;
  const idColumn = resource.idColumn ?? 'id';

  let row: Record<string, unknown> = {};
  if (id) {
    const { data } = await db.from(resource.table).select('*').eq(idColumn, resource.singleton ? Number(id) : id).maybeSingle();
    if (!data && !resource.singleton) notFound();
    row = (data as Record<string, unknown>) ?? {};
    if (resource.children) {
      const { data: items } = await db.from(resource.children.table).select('*').eq(resource.children.foreignKey, id).order('sort');
      row[resource.children.field] = (items ?? []).map((i: Record<string, unknown>) => ({ image_url: i.image_url, caption: i.caption }));
    }
  } else {
    // Defaults for a new row
    for (const f of resource.fields) {
      if (f.name === 'status') row.status = 'draft';
      if (f.name === 'read_time_minutes') row.read_time_minutes = 2;
      if (f.name === 'currency') row.currency = 'MAD';
      if (f.name === 'visible') row.visible = true;
      if (f.name === 'sort') row.sort = 0;
      if (f.name === 'match_status') row.match_status = 'scheduled';
      if (f.name === 'availability') row.availability = 'available';
      if (f.type === 'repeater') row[f.name] = [];
    }
  }

  const relationOptions = await formRelationOptions(db, resource);
  const title = id
    ? pick((row.title ?? row.name ?? row.message) as never, 'fr') || String(row.name ?? row.slug ?? row.key ?? row.external_id ?? resource.label)
    : `Ajouter : ${resource.singular}`;
  const published = row.status === 'published';
  const publicHref = resource.publicPath && id && published ? resource.publicPath.replace('{slug}', String(row.slug ?? '')).replace('{id}', id) : null;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        {!resource.singleton && (
          <Link href={`/admin/${resource.key}`} className="text-sm font-semibold text-fg-muted hover:text-fg">
            ← {resource.label}
          </Link>
        )}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-condensed text-3xl font-extrabold uppercase italic sm:text-4xl">{resource.singleton ? resource.label : title}</h1>
          <div className="flex flex-wrap gap-2">
            {resource.preview && id && (
              <a href={`/admin/preview/${resource.preview}/${id}`} target="_blank" rel="noopener" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold hover:border-wydad-logo">
                Prévisualiser
              </a>
            )}
            {publicHref && (
              <a href={publicHref} target="_blank" rel="noopener" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold hover:border-wydad-logo">
                Voir sur le site
              </a>
            )}
          </div>
        </div>
        {resource.singleton && <p className="text-fg-secondary">{resource.description}</p>}
      </header>
      <ResourceForm resource={resource} id={id} initial={row} relationOptions={relationOptions} saved={saved} />
    </div>
  );
}
