import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { pick } from '@/lib/cms/l10n';
import type { FieldDef, Option, ResourceDef } from './types';

type Relation = NonNullable<FieldDef['relation']>;

/** id → label for the rows of a related table (a translated label is shown in French) */
export async function relationLabels(db: SupabaseClient, rel: Relation): Promise<Option[]> {
  const columns = rel.table === 'navigation_items' ? 'id, label_key, label, menu' : `id, ${rel.labelColumn}`;
  const { data } = await db.from(rel.table).select(columns).limit(1000);
  return ((data ?? []) as unknown as Record<string, unknown>[])
    .map((row) => {
      let label = rel.l10n ? pick(row[rel.labelColumn] as never, 'fr') : String(row[rel.labelColumn] ?? '');
      if (rel.table === 'navigation_items') label = `${pick(row.label as never, 'fr') || String(row.label_key ?? '')} (${row.menu})`;
      return { value: String(row.id), label: label || String(row.id).slice(0, 8) };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}

/** Choices for every relation field of a form */
export async function formRelationOptions(db: SupabaseClient, resource: ResourceDef): Promise<Record<string, Option[]>> {
  const entries = await Promise.all(resource.fields.filter((f) => f.type === 'relation' && f.relation).map(async (f) => [f.name, await relationLabels(db, f.relation!)] as const));
  return Object.fromEntries(entries);
}
