import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getCmsPage } from '@/lib/cms/club';
import { PageView } from '@/components/cms/PageView';

/** Pages written in the admin (pages table), published ones only; cached and refreshed on edit */
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getCmsPage(slug, locale);
  if (!page) return {};
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.summary,
    openGraph: { images: page.cover ? [page.cover] : undefined },
  };
}

export default async function CmsPageRoute({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = await getCmsPage(slug, locale);
  if (!page) notFound();
  return <PageView page={page} />;
}
