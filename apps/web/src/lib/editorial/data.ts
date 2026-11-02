import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '@/types/database';
import { pick } from '@/lib/cms/l10n';
import type { ArticleDraft } from './checks';
import type { CategoryOption } from '@/components/admin/editorial/ArticleEditor';
import { isLang } from './spec';

type Db = SupabaseClient<Database>;

export interface CategoryRow {
  id: string;
  slug: string;
  kind: 'group' | 'category';
  parentId: string | null;
  name: { fr: string; ar: string; en: string };
  description: { fr: string; ar: string; en: string };
  sport: string | null;
  active: boolean;
  sort: number;
  articles: number;
}

const tri = (v: unknown) => {
  const o = (v ?? {}) as Record<string, string>;
  return { fr: o.fr ?? '', ar: o.ar ?? '', en: o.en ?? '' };
};

/** Groups and their categories, in display order, with how many articles each holds */
export async function getTaxonomy(db: Db): Promise<{ groups: CategoryRow[]; categories: CategoryRow[] }> {
  const [{ data: rows }, { data: used }] = await Promise.all([
    db.from('categories').select('*').order('sort'),
    db.from('news_articles').select('category_id'),
  ]);
  const counts = new Map<string, number>();
  for (const r of used ?? []) counts.set(r.category_id, (counts.get(r.category_id) ?? 0) + 1);
  const all: CategoryRow[] = (rows ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    kind: r.kind as CategoryRow['kind'],
    parentId: r.parent_id,
    name: tri(r.name),
    description: tri(r.description),
    sport: r.sport,
    active: r.active,
    sort: r.sort,
    articles: counts.get(r.id) ?? 0,
  }));
  return { groups: all.filter((c) => c.kind === 'group'), categories: all.filter((c) => c.kind === 'category') };
}

/** Choices of the article editor: active categories under their group */
export async function editorCategories(db: Db, keep?: string): Promise<CategoryOption[]> {
  const { groups, categories } = await getTaxonomy(db);
  return groups
    .flatMap((g) =>
      categories
        .filter((c) => c.parentId === g.id && (c.active || c.id === keep))
        .map((c) => ({ id: c.id, name: c.active ? c.name.fr : `${c.name.fr} (désactivée)`, group: g.name.fr, description: c.description.fr })),
    );
}

/** Editor fields of a stored article (older multilingual articles open in French) */
export function rowToDraft(row: Tables<'news_articles'>): ArticleDraft {
  const lang = isLang(row.language) ? row.language : 'fr';
  const text = (v: unknown) => pick(v as never, lang);
  const body = text(row.body);
  return {
    id: row.id,
    language: row.language && isLang(row.language) ? row.language : '',
    categoryId: row.category_id,
    title: text(row.title),
    slug: row.slug,
    excerpt: text(row.excerpt),
    bodyHtml:
      row.body_format === 'html'
        ? body
        : body
            .split(/(?:\r?\n\s*){2,}/)
            .filter(Boolean)
            .map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
            .join(''),
    coverUrl: row.cover_url ?? '',
    coverAlt: row.cover_alt ?? '',
    coverWidth: row.cover_width,
    coverHeight: row.cover_height,
    coverMobileUrl: row.cover_mobile_url ?? '',
    author: row.author ?? '',
    publishedAt: row.published_at ?? '',
    featured: row.featured,
    seoTitle: text(row.seo_title),
    seoDescription: text(row.seo_description),
    matchId: row.match_id ?? '',
  };
}

export const articleTitle = (row: Pick<Tables<'news_articles'>, 'title' | 'language'>) => pick(row.title as never, row.language ?? 'fr');
