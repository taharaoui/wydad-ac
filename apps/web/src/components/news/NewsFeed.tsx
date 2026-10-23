'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { RelativeTime } from '@/components/ui/RelativeTime';

/** One card of the feed: an article or a Wydad TV video, prepared on the server. */
export interface FeedItem {
  id: string;
  kind: 'article' | 'video';
  href: string;
  title: string;
  /** Label above the title (category or "Wydad TV") */
  label: string;
  /** Filter keys this item belongs to, e.g. ["football", "match_report"] */
  tags: string[];
  image?: string;
  imagePosition?: string;
  published?: string;
  /** Absolute date, shown until the relative one mounts */
  dateLabel?: string;
}

type Kind = 'all' | 'article' | 'video';

/** psg.fr-style news index: topic pills, content-type tabs, 4-column card grid. */
export function NewsFeed({ items, topics, locale }: { items: FeedItem[]; topics: { key: string; label: string }[]; locale: string }) {
  const t = useTranslations('news');
  const [topic, setTopic] = useState('all');
  const [kind, setKind] = useState<Kind>('all');

  const shown = useMemo(
    () => items.filter((i) => (topic === 'all' || i.tags.includes(topic)) && (kind === 'all' || i.kind === kind)),
    [items, topic, kind],
  );
  const kinds: Kind[] = ['all', 'article', ...(items.some((i) => i.kind === 'video') ? (['video'] as Kind[]) : [])];

  return (
    <div>
      <div role="group" aria-label={t('filter_topic')} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {[{ key: 'all', label: t('all_news') }, ...topics].map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={topic === f.key}
            onClick={() => setTopic(f.key)}
            className={`whitespace-nowrap px-3 py-2 font-condensed text-lg font-bold uppercase leading-none tracking-wide transition-colors ${
              topic === f.key ? 'bg-wydad-logo text-white' : 'bg-surface-secondary text-fg hover:bg-wydad-logo/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div role="group" aria-label={t('filter_type')} className="mt-10 flex gap-8">
        {kinds.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
            className={`relative pb-2 font-condensed text-xl font-bold uppercase tracking-wide transition-colors ${
              kind === k ? 'text-fg' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {t(`type_${k}`)}
            {kind === k && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-wydad-logo" aria-hidden />}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {t('results_count', { count: shown.length, n: String(shown.length) })}
      </p>

      {shown.length === 0 ? (
        <p className="mt-10 text-fg-muted">{t('empty')}</p>
      ) : (
        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="group block">
                <div className="relative aspect-[16/9] overflow-hidden bg-surface-secondary">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ objectPosition: item.imagePosition ?? 'center' }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-wydad-burgundy via-[#7a1218] to-wydad-logo">
                      <Image src="/images/wydad-crest-white.svg" alt="" width={64} height={81} className="h-1/3 w-auto opacity-90" />
                    </div>
                  )}
                  {item.kind === 'video' && (
                    <span className="absolute bottom-3 start-3 flex h-10 w-10 items-center justify-center rounded-full bg-wydad-logo text-white shadow-lg" aria-hidden>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ms-0.5">
                        <path d="M7 4.5v15l12-7.5z" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="mt-4 font-condensed text-sm font-bold uppercase tracking-wide text-fg-muted">{item.label}</p>
                <h2 className="mt-1.5 line-clamp-3 text-lg font-bold leading-snug text-fg transition-colors group-hover:text-wydad-red">{item.title}</h2>
                {item.published && item.dateLabel && (
                  <RelativeTime iso={item.published} locale={locale} fallback={item.dateLabel} className="mt-2 block text-sm text-fg-muted" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
