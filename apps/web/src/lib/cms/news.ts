import 'server-only';
import type { NewsArticle } from '@/types';
import type { Tables } from '@/types/database';
import { mockNews } from '@/lib/mock-data';
import { cmsRead, unwrap } from './read';
import { full, pick } from './l10n';

type Client = Parameters<Parameters<typeof cmsRead>[2]>[0];

export async function categoryMap(db: Client, locale: string) {
  const rows = unwrap(await db.from('categories').select('id, slug, name')) ?? [];
  return new Map(rows.map((c) => [c.id, { slug: c.slug, label: pick(c.name, locale) }]));
}

export function toArticle(row: Tables<'news_articles'>, categories: Map<string, { slug: string; label: string }>, locale: string): NewsArticle {
  const category = categories.get(row.category_id);
  return {
    id: row.legacy_id ?? row.id,
    slug: row.slug,
    title: full(row.title),
    excerpt: full(row.excerpt),
    body: full(row.body),
    category: category?.slug ?? 'club',
    category_label: category?.label || undefined,
    sport: row.sport === 'basketball' ? 'basketball' : row.sport === 'football' ? 'football' : undefined,
    cover_image_url: row.cover_url ?? undefined,
    cover_position: row.cover_position ?? undefined,
    cover_orientation: (row.cover_orientation as NewsArticle['cover_orientation']) ?? undefined,
    match_id: row.match_id ?? undefined,
    published_at: row.published_at ?? row.created_at,
    read_time_minutes: row.read_time_minutes,
    author: row.author ?? undefined,
    seo_title: pick(row.seo_title, locale) || undefined,
    seo_description: pick(row.seo_description, locale) || undefined,
  };
}

/** Published articles, newest first (RLS hides drafts and articles scheduled for later) */
export async function cmsLatestNews(limit: number, locale = 'fr', category?: string): Promise<NewsArticle[]> {
  const bundled = mockNews.filter((n) => !category || n.category === category).slice(0, limit);
  return cmsRead('news_articles', bundled, async (db) => {
    const categories = await categoryMap(db, locale);
    let query = db.from('news_articles').select('*').order('published_at', { ascending: false }).limit(limit);
    if (category) {
      const id = [...categories].find(([, c]) => c.slug === category)?.[0];
      if (!id) return [];
      query = query.eq('category_id', id);
    }
    const rows = unwrap(await query) ?? [];
    return rows.map((r) => toArticle(r, categories, locale));
  });
}

export async function cmsNewsBySlug(slug: string, locale = 'fr'): Promise<NewsArticle | null> {
  const found = await cmsRead<{ article: NewsArticle | null }>(
    'news_articles/slug',
    { article: mockNews.find((n) => n.slug === slug) ?? null },
    async (db) => {
      const row = unwrap(await db.from('news_articles').select('*').eq('slug', slug).maybeSingle());
      if (!row) return { article: null };
      return { article: toArticle(row, await categoryMap(db, locale), locale) };
    },
  );
  return found.article;
}
