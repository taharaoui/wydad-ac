import type { NewsArticle } from '@/types';
import { cmsLatestNews, cmsNewsBySlug } from '@/lib/cms/news';

// News comes from the Supabase CMS (news_articles) once it is live, else from the bundled articles.

export async function getLatestNews(limit = 10, locale?: string): Promise<NewsArticle[]> {
  return cmsLatestNews(limit, locale);
}

export async function getNewsBySlug(slug: string, locale?: string): Promise<NewsArticle | null> {
  return cmsNewsBySlug(slug, locale);
}

export async function getNewsByCategory(category: string, limit = 10, locale?: string): Promise<NewsArticle[]> {
  return cmsLatestNews(limit, locale, category);
}
