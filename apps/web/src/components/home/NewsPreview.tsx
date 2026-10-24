import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { FeedItem } from '@/lib/feed';
import { videoThumbnail } from '@/lib/videos';
import { RelativeTime } from '@/components/ui/RelativeTime';

interface NewsPreviewProps {
  items: FeedItem[];
  locale: string;
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

interface Card {
  id: string;
  href: string;
  external: boolean;
  image?: string;
  imagePosition?: string;
  label: string;
  title: string;
  published: string;
  icon?: 'play' | 'facebook';
}

function Badge({ icon }: { icon?: Card['icon'] }) {
  if (!icon) return null;
  return (
    <span className="absolute start-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-wydad-logo shadow" aria-hidden>
      {icon === 'play' ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 4.5v15l12-7.5z" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.02 24 18.06 24 12.07z" />
        </svg>
      )}
    </span>
  );
}

/** Cover photo, or a red crest card when there is none */
function Cover({ card, sizes, priority }: { card: Card; sizes: string; priority?: boolean }) {
  if (!card.image) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-wydad-burgundy via-[#7a1218] to-wydad-logo">
        <Image src="/images/wydad-crest-white.svg" alt="" width={64} height={81} className="h-1/3 w-auto opacity-90" />
      </div>
    );
  }
  return (
    <Image
      src={card.image}
      alt=""
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      style={{ objectPosition: card.imagePosition ?? 'center 75%' }}
    />
  );
}

/** Opens site pages in place and Facebook posts in a new tab */
function CardLink({ card, className, children }: { card: Card; className: string; children: React.ReactNode }) {
  if (card.external) {
    return (
      <a href={card.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={card.href} className={className}>
      {children}
    </Link>
  );
}

/**
 * Homepage news: articles, Wydad TV videos and Facebook posts, newest first. The latest item with a
 * picture leads, large; the next ones fill a two-column grid beside it.
 */
export function NewsPreview({ items, locale }: NewsPreviewProps) {
  const t = useTranslations('news');
  const tTv = useTranslations('tv');
  const tNav = useTranslations('nav');
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';

  const cards: Card[] = items.map((item): Card => {
    switch (item.kind) {
      case 'article':
        return {
          id: item.id,
          href: `/news/${item.article.slug}`,
          external: false,
          image: item.article.cover_image_url,
          imagePosition: item.article.cover_position,
          label: t(item.article.category),
          title: item.article.title[lang],
          published: item.published_at,
        };
      case 'video':
        return {
          id: item.id,
          href: `/wydad-tv/${item.video.id}`,
          external: false,
          image: videoThumbnail(item.video.id, 'hq'),
          imagePosition: 'center',
          label: `${tTv('title')} · ${tTv(item.video.category)}`,
          title: item.video.title,
          published: item.published_at,
          icon: 'play',
        };
      case 'facebook':
        return {
          id: item.id,
          href: item.post.url,
          external: true,
          image: item.post.image,
          imagePosition: 'center 30%',
          label: 'Facebook',
          title: item.post.title,
          published: item.published_at,
          icon: 'facebook',
        };
    }
  });

  // Lead with the latest item that has a picture; the others follow in date order
  const lead = cards.find((c) => c.image) ?? cards[0];
  if (!lead) return null;
  const others = cards.filter((c) => c !== lead);
  // Keep the two-column grid full: an even number of cards, at most eight
  const rest = others.slice(0, Math.min(8, others.length - (others.length % 2)) || others.length);

  return (
    <section aria-labelledby="home-news">
      <div className="mb-6 flex items-baseline gap-3">
        <h2 id="home-news" className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">
          {tNav('news')}
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
        {/* Lead item */}
        <CardLink card={lead} className="group relative block aspect-[4/5] overflow-hidden bg-surface-secondary sm:aspect-square lg:self-start">
          <Cover card={lead} sizes="(min-width: 1024px) 50vw, 100vw" />
          <Badge icon={lead.icon} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <p className="font-condensed text-xs font-bold uppercase tracking-[0.12em] text-white/85">{lead.label}</p>
            <h3 className="mt-2 font-condensed text-3xl font-extrabold uppercase italic leading-[0.95] text-white rtl:not-italic sm:text-4xl lg:text-[2.6rem]">
              {lead.title}
            </h3>
            <RelativeTime iso={lead.published} locale={locale} fallback={shortDate(lead.published, locale)} className="mt-3 block text-xs font-medium text-white/75" />
          </div>
        </CardLink>

        {/* Next items */}
        {rest.length > 0 && (
          <ul className="grid content-start gap-x-5 gap-y-6 sm:grid-cols-2 sm:gap-y-8">
            {rest.map((card) => (
              <li key={card.id}>
                <CardLink card={card} className="group grid grid-cols-[8.5rem_minmax(0,1fr)] gap-4 sm:block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-surface-secondary">
                    <Cover card={card} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 136px" />
                    <Badge icon={card.icon} />
                  </div>
                  <div className="min-w-0 sm:mt-3">
                    <p className="font-condensed text-[11px] font-bold uppercase tracking-[0.12em] text-fg-muted">{card.label}</p>
                    <h3 className="mt-1 line-clamp-3 font-semibold leading-snug text-fg transition-colors group-hover:text-wydad-red">{card.title}</h3>
                    <RelativeTime iso={card.published} locale={locale} fallback={shortDate(card.published, locale)} className="mt-1.5 block text-xs text-fg-muted" />
                  </div>
                </CardLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
