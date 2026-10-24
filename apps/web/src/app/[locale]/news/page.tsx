import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getLatestNews } from '@/services/news';
import { getVideos, videoThumbnail } from '@/lib/videos';
import { NewsFeed, type FeedItem } from '@/components/news/NewsFeed';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'news' });
  return { title: t('latest') };
}

/** Topic filters in display order; only those with at least one story are shown */
const TOPICS = ['football', 'basketball', 'match_report', 'club', 'transfer', 'interview', 'youth', 'wydad_tv'] as const;

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'news' });
  const tTv = await getTranslations({ locale, namespace: 'tv' });
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';
  const dateLocale = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB';
  const date = (iso: string) =>
    new Intl.DateTimeFormat(dateLocale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Casablanca' }).format(new Date(iso));

  const [articles, videos] = await Promise.all([getLatestNews(100, locale), getVideos()]);

  const items: FeedItem[] = [
    ...articles.map((a) => ({
      id: a.id,
      kind: 'article' as const,
      href: `/news/${a.slug}`,
      title: a.title[lang],
      label: `${t(a.sport ?? 'football')} · ${a.category_label ?? t(a.category)}`,
      tags: [a.sport ?? 'football', a.category],
      image: a.cover_image_url,
      imagePosition: a.cover_position,
      published: a.published_at,
      dateLabel: date(a.published_at),
    })),
    ...videos.map((v) => ({
      id: `video-${v.id}`,
      kind: 'video' as const,
      href: `/wydad-tv/${v.id}`,
      title: v.title,
      label: `${tTv('title')} · ${tTv(v.category)}`,
      tags: ['wydad_tv', 'football'],
      image: videoThumbnail(v.id, 'hq'),
      published: v.published_at,
      dateLabel: v.published_at && date(v.published_at),
    })),
  ]
    // Newest first; undated items (e.g. videos without a date) go last
    .sort((a, b) => (b.published ?? '').localeCompare(a.published ?? ''));

  const topics = TOPICS.filter((k) => items.some((i) => i.tags.includes(k))).map((k) => ({ key: k, label: t(k) }));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <h1 className="font-condensed text-6xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-8xl">{t('latest')}</h1>
      <div className="mt-12">
        <NewsFeed items={items} topics={topics} locale={locale} />
      </div>
    </div>
  );
}
