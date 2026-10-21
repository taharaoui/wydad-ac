import { NewsArticleSchema } from '@/types';
import type { NewsArticle } from '@/types';
import { mockNews } from '@/lib/mock-data';

const API_KEY = process.env.STATS_API_KEY;
const IS_MOCK = !API_KEY;

// News will come from Supabase CMS, not the stats API.
// For now, mock data serves as a placeholder.

export async function getLatestNews(limit = 10): Promise<NewsArticle[]> {
  if (IS_MOCK) return mockNews.slice(0, limit);

  // TODO: Supabase query
  // const { data } = await supabase
  //   .from('articles')
  //   .select('*')
  //   .order('published_at', { ascending: false })
  //   .limit(limit);
  // return data.map(a => NewsArticleSchema.parse(a));

  return mockNews.slice(0, limit);
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  if (IS_MOCK) return mockNews.find((n) => n.slug === slug) ?? null;

  // TODO: Supabase query by slug
  return mockNews.find((n) => n.slug === slug) ?? null;
}

export async function getNewsByCategory(
  category: string,
  limit = 10
): Promise<NewsArticle[]> {
  if (IS_MOCK) {
    return mockNews.filter((n) => n.category === category).slice(0, limit);
  }

  // TODO: Supabase filtered query
  return mockNews.filter((n) => n.category === category).slice(0, limit);
}
