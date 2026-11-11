import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { Episode, L10n, Show } from '@/lib/live';
import { embedUrl, watchUrl } from '@/lib/live';

export type Lang = keyof L10n;
export const toLang = (locale: string): Lang => (locale === 'ar' || locale === 'fr' ? locale : 'en');

export function LiveBadge({ label, size = 'sm' }: { label: string; size?: 'sm' | 'lg' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded bg-wydad-logo font-condensed font-extrabold uppercase tracking-wide text-white ${size === 'lg' ? 'px-2.5 py-1 text-sm' : 'px-1.5 py-0.5 text-xs'}`}>
      <span className="h-2 w-2 animate-pulse rounded-full bg-white motion-reduce:animate-none" aria-hidden />
      {label}
    </span>
  );
}

/** Marks sample content; always visible so nothing passes for a real broadcast */
export function DemoChip({ label }: { label: string }) {
  return <span className="rounded border border-dashed border-white/60 bg-black/40 px-1.5 py-0.5 font-condensed text-xs font-bold uppercase tracking-wide text-white">{label}</span>;
}

/** Thumbnail, or a Wydad-red cover with the show's name for content without one */
export function Thumb({ episode, show, lang, sizes, priority }: { episode: Episode; show?: Show; lang: Lang; sizes: string; priority?: boolean }) {
  if (episode.thumbnail) {
    return <Image src={episode.thumbnail} alt="" fill sizes={sizes} priority={priority} className="object-cover transition-transform duration-500 group-hover:scale-105" />;
  }
  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#d21f26_0%,#7a1218_45%,#2a070a_100%)]">
      <Image src="/images/wydad-crest-white.svg" alt="" width={160} height={203} className="absolute -bottom-6 -end-6 h-3/4 w-auto opacity-10" />
      <p className="absolute inset-x-4 bottom-4 font-condensed text-2xl font-extrabold uppercase italic leading-none text-white rtl:not-italic sm:text-3xl">{show?.title[lang] ?? episode.title}</p>
    </div>
  );
}

export function formatViews(n: number, locale: string) {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-MA-u-nu-latn' : locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function formatWhen(iso: string, locale: string, withTime = false) {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA-u-nu-latn' : locale === 'fr' ? 'fr-FR' : 'en-GB', {
    weekday: withTime ? 'long' : undefined,
    day: 'numeric',
    month: 'short',
    hour: withTime ? '2-digit' : undefined,
    minute: withTime ? '2-digit' : undefined,
    timeZone: 'Africa/Casablanca',
  }).format(new Date(iso));
}

export interface CardLabels {
  live: string;
  upcoming: string;
  demo: string;
  views: (n: string) => string;
}

/** Video card: thumbnail with status, title, show, date and real views when known */
export function EpisodeCard({ episode, show, locale, labels, wide }: { episode: Episode; show?: Show; locale: string; labels: CardLabels; wide?: boolean }) {
  const lang = toLang(locale);
  return (
    <Link href={`/live/watch/${episode.id}`} className="group block focus-visible:outline-none">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-wydad-charcoal ring-wydad-logo transition-shadow group-hover:ring-2 group-focus-visible:ring-4">
        <Thumb episode={episode} show={show} lang={lang} sizes={wide ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw'} />
        <div className="absolute start-2 top-2 flex gap-1.5">
          {episode.status === 'live' && <LiveBadge label={labels.live} />}
          {episode.status === 'upcoming' && <span className="rounded bg-white px-1.5 py-0.5 font-condensed text-xs font-extrabold uppercase text-wydad-logo">{labels.upcoming}</span>}
          {episode.demo && <DemoChip label={labels.demo} />}
        </div>
        {episode.views != null && (
          <span className="absolute bottom-2 end-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white">{labels.views(formatViews(episode.views, locale))}</span>
        )}
      </div>
      <p className="mt-2.5 line-clamp-2 font-semibold leading-snug text-fg transition-colors group-hover:text-wydad-red">{episode.title}</p>
      <p className="mt-1 text-sm text-fg-muted">
        {show?.title[lang]} · {formatWhen(episode.date, locale, episode.status === 'upcoming')}
      </p>
    </Link>
  );
}

/** Embedded player (YouTube now; Twitch / Kick through the same source type later) */
export function Player({ episode, title, autoplay }: { episode: Episode; title: string; autoplay?: boolean }) {
  if (!episode.source) return null;
  const host = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10">
      <iframe
        src={embedUrl(episode.source, host, { autoplay })}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

export const externalWatchUrl = (episode: Episode) => (episode.source ? watchUrl(episode.source) : undefined);
