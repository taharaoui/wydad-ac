import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { NewsArticle } from '@/types';
import { requireStaffPage } from '@/lib/admin/auth';
import { full, pick } from '@/lib/cms/l10n';
import { ArticleView } from '@/components/news/ArticleView';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Aperçu', robots: { index: false, follow: false } };

interface PreviewContent {
  language: 'ar' | 'fr' | 'en';
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string>;
  body: Record<string, string>;
  sport: string;
  cover_url: string | null;
  cover_alt: string | null;
  cover_width: number | null;
  cover_mobile_url: string | null;
  author: string | null;
  match_id: string | null;
  read_time_minutes: number;
  featured: boolean;
  category_name: Record<string, string> | null;
  category_slug: string | null;
  published_at: string;
}

/**
 * The editor's current version of an article, rendered by the real public page (header, footer,
 * language and reading direction included). Only its author (or an administrator) can open it; the
 * editor loads it in frames at desktop, tablet and phone widths and checks the layout.
 */
export default async function ArticlePreview({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const { supabase } = await requireStaffPage();
  const { data: preview } = await supabase.from('article_previews').select('content, content_hash').eq('id', id).maybeSingle();
  if (!preview) notFound();
  const c = preview.content as unknown as PreviewContent;
  if (c.language !== locale) redirect(`${c.language === 'ar' ? '' : `/${c.language}`}/news/preview/${id}`);
  setRequestLocale(locale);

  const article: NewsArticle = {
    id,
    slug: c.slug,
    title: full(c.title),
    excerpt: full(c.excerpt),
    body: full({}),
    body_html: c.body[c.language] ?? '',
    category: c.category_slug ?? 'club',
    category_label: c.category_name ? pick(c.category_name, locale) : undefined,
    sport: c.sport === 'basketball' ? 'basketball' : 'football',
    cover_image_url: c.cover_url ?? undefined,
    cover_alt: c.cover_alt ?? undefined,
    cover_mobile_url: c.cover_mobile_url ?? undefined,
    cover_wide: true,
    match_id: c.match_id ?? undefined,
    published_at: c.published_at,
    read_time_minutes: c.read_time_minutes,
    author: c.author ?? undefined,
    language: c.language,
    featured: c.featured,
  };
  return (
    <div data-preview-hash={preview.content_hash}>
      <ArticleView article={article} locale={locale} />
    </div>
  );
}
