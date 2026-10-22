'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface HighlightsCardProps {
  /** Arryadia YouTube video id, when one is mapped for this match */
  videoId?: string;
  searchUrl: string;
  finished: boolean;
  title: string;
}

function PlayIcon() {
  return (
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-[#16151a] shadow-lg transition-transform group-hover:scale-110">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="ms-1" aria-hidden>
        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
      </svg>
    </span>
  );
}

/** SNRT (Arryadia) highlights. Embeds only after a click, so YouTube loads nothing until then. */
export function HighlightsCard({ videoId, searchUrl, finished, title }: HighlightsCardProps) {
  const t = useTranslations('matches');
  const [playing, setPlaying] = useState(false);

  const header = (
    <div className="flex items-center justify-between gap-3 px-5 py-4">
      <h3 className="font-display text-base font-bold text-fg">{t('highlights_title')}</h3>
      {/* White chip keeps the logo's blue lettering legible in dark mode */}
      <span className="flex items-center rounded-md bg-white px-2 py-1 ring-1 ring-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/broadcasters/snrt.png" alt={t('highlights_source')} title={t('highlights_source')} className="h-10 w-auto" />
      </span>
    </div>
  );

  const frame = 'relative aspect-video w-full overflow-hidden bg-gradient-to-br from-[#16151a] via-[#2a1214] to-[#5c0f12]';

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      {header}
      {!finished ? (
        <div className={`${frame} flex items-center justify-center`}>
          <p className="max-w-xs px-6 text-center text-sm text-white/70">{t('highlights_after')}</p>
        </div>
      ) : videoId && playing ? (
        <div className={frame}>
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : videoId ? (
        <button type="button" onClick={() => setPlaying(true)} className={`group ${frame} flex items-center justify-center`} aria-label={t('highlights_watch')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <PlayIcon />
        </button>
      ) : (
        <a href={searchUrl} target="_blank" rel="noopener noreferrer" className={`group ${frame} flex flex-col items-center justify-center gap-4`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/competitions/botola-pro-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -end-10 -top-10 h-56 w-auto opacity-10 grayscale" />
          <PlayIcon />
          <span className="relative text-center">
            <span className="block font-condensed text-xl font-bold uppercase tracking-wide text-white">{t('highlights_watch')}</span>
            <span className="mt-1 block px-6 text-xs text-white/60">{t('highlights_search_note')}</span>
          </span>
        </a>
      )}
    </section>
  );
}
