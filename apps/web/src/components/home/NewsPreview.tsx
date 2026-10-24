import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { NewsArticle } from '@/types';
import { RelativeTime } from '@/components/ui/RelativeTime';

interface NewsPreviewProps {
  articles: NewsArticle[];
  locale: string;
  /** Title set in the CMS (home_sections) */
  title?: string;
}

/** Absolute date in Moroccan time, e.g. "22 oct. 2026" (server-side, shown until the relative label mounts) */
function shortDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Casablanca',
  }).format(new Date(iso));
}

/** Cover photo, or a red crest card for articles without one */
function Cover({ article, sizes, priority }: { article: NewsArticle; sizes: string; priority?: boolean }) {
  if (!article.cover_image_url) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-wydad-burgundy via-[#7a1218] to-wydad-logo">
        <Image src="/images/wydad-crest-white.svg" alt="" width={64} height={81} className="h-1/3 w-auto opacity-90" />
      </div>
    );
  }
  return (
    <Image
      src={article.cover_image_url}
      alt=""
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      style={{ objectPosition: article.cover_position ?? 'center 75%' }}
    />
  );
}

/** Homepage news: the latest story large on one side, the next ones in a two-column grid beside it. */
export function NewsPreview({ articles, locale, title }: NewsPreviewProps) {
  const t = useTranslations('news');
  const tNav = useTranslations('nav');
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';
  // Lead with the latest story that has a photo; the others follow in date order
  const lead = articles.find((a) => a.cover_image_url) ?? articles[0];
  if (!lead) return null;
  const others = articles.filter((a) => a !== lead);
  // Keep the two-column grid full: an even number of cards, at most eight
  const rest = others.slice(0, Math.min(8, others.length - (others.length % 2)) || others.length);

  return (
    <section aria-labelledby="home-news">
      <div className="mb-6 flex items-baseline gap-3">
        <h2 id="home-news" className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">
          {title ?? tNav('news')}
        </h2>
        <span className="font-condensed text-2xl font-bold italic text-fg-muted rtl:not-italic" aria-hidden>
          /
        </span>
        <Link
          href="/news"
          className="group/link inline-flex items-center gap-1 font-condensed text-sm font-bold uppercase italic tracking-wide text-fg-secondary transition-colors hover:text-wydad-red rtl:not-italic"
        >
          {t('view_all')}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-0.5 rtl:rotate-180 rtl:group-hover/link:-translate-x-0.5" aria-hidden>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Lead story */}
        <Link href={`/news/${lead.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-surface-secondary sm:aspect-square lg:self-start">
          <Cover article={lead} sizes="(min-width: 1024px) 50vw, 100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <p className="font-condensed text-xs font-bold uppercase tracking-[0.12em] text-white/85">{lead.category_label ?? t(lead.category)}</p>
            <h3 className="mt-2 font-condensed text-3xl font-extrabold uppercase italic leading-[0.95] text-white rtl:not-italic sm:text-4xl lg:text-[2.6rem]">
              {lead.title[lang]}
            </h3>
            <RelativeTime iso={lead.published_at} locale={locale} fallback={shortDate(lead.published_at, locale)} className="mt-3 block text-xs font-medium text-white/75" />
          </div>
        </Link>

        {/* Next stories */}
        {rest.length > 0 && (
          <ul className="grid content-start gap-x-5 gap-y-6 sm:grid-cols-2 sm:gap-y-8">
            {rest.map((article) => (
              <li key={article.id}>
                <Link href={`/news/${article.slug}`} className="group grid grid-cols-[8.5rem_minmax(0,1fr)] gap-4 sm:block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-secondary">
                    <Cover article={article} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 136px" />
                  </div>
                  <div className="min-w-0 sm:mt-3">
                    <p className="font-condensed text-[11px] font-bold uppercase tracking-[0.12em] text-fg-muted">{article.category_label ?? t(article.category)}</p>
                    <h3 className="mt-1 line-clamp-3 font-semibold leading-snug text-fg transition-colors group-hover:text-wydad-red">
                      {article.title[lang]}
                    </h3>
                    <RelativeTime iso={article.published_at} locale={locale} fallback={shortDate(article.published_at, locale)} className="mt-1.5 block text-xs text-fg-muted" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
