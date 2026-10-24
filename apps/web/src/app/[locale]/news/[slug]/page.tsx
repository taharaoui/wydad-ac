import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getLatestNews } from '@/services/news';
import { ArticleView } from '@/components/news/ArticleView';

/** Articles published later in the CMS render on first visit, then stay cached */
export const revalidate = 300;

export async function generateStaticParams() {
  const articles = await getLatestNews(50);
  const locales = ['ar', 'fr', 'en'];
  return locales.flatMap((locale) => articles.map((article) => ({ locale, slug: article.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getNewsBySlug(slug, locale);
  if (!article) return {};
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';
  const title = article.seo_title || article.title[lang];
  const description = article.seo_description || article.excerpt[lang];
  return {
    title,
    description,
    openGraph: { title, description, type: 'article', publishedTime: article.published_at, images: article.cover_image_url ? [article.cover_image_url] : undefined },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = await getNewsBySlug(slug, locale);
  if (!article) notFound();
  return <ArticleView article={article} locale={locale} />;
}
