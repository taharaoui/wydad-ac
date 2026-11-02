import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { getNewsBySlug, getLatestNews } from '@/services/news';
import { ArticleView } from '@/components/news/ArticleView';

/** Articles published later in the CMS render on first visit, then stay cached */
export const revalidate = 300;

export async function generateStaticParams() {
  // Each language lists its own articles (plus the older ones written in all three)
  const locales = ['ar', 'fr', 'en'];
  const lists = await Promise.all(locales.map((locale) => getLatestNews(50, locale)));
  return locales.flatMap((locale, i) => lists[i].map((article) => ({ locale, slug: article.slug })));
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
  // An article written in one language is only shown in that language
  if (article.language && article.language !== locale) redirect(`${article.language === 'ar' ? '' : `/${article.language}`}/news/${article.slug}`);
  return <ArticleView article={article} locale={locale} />;
}
