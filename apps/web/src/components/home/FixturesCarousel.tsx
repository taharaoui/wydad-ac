'use client';

import { useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Match } from '@/types';

interface FixturesCarouselProps {
  matches: Match[];
}

function FixtureCard({ match, locale }: { match: Match; locale: string }) {
  const t = useTranslations('matches');

  const isCompleted = match.status === 'finished';
  const isLive = match.status === 'live';
  const isScheduled = match.status === 'scheduled';

  const kickoffDate = new Date(match.kickoff);
  const dateStr = kickoffDate.toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();
  const timeStr = kickoffDate.toLocaleTimeString(locale === 'ar' ? 'ar-MA' : locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusLabel = isLive
    ? t('live')
    : isCompleted
    ? t('full_time')
    : `${dateStr} ${timeStr}`;

  const isWydadHome = match.home_team.id === 'wydad';
  const wydadScore = isWydadHome ? match.score_home : match.score_away;
  const opponentScore = isWydadHome ? match.score_away : match.score_home;
  const isWin = (wydadScore ?? 0) > (opponentScore ?? 0);

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group flex w-[280px] flex-shrink-0 flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-all hover:bg-white/[0.07] hover:border-white/20 sm:w-[300px]"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
        <span className={`rounded px-2 py-0.5 ${
          isLive
            ? 'bg-wydad-red text-white'
            : 'bg-white/10 text-white/50'
        }`}>
          {match.competition.short_name}
        </span>
        <span className={isLive ? 'text-wydad-red' : 'text-white/40'}>
          {statusLabel}
        </span>
      </div>

      {/* Home team */}
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${
            match.home_team.id === 'wydad' ? 'bg-wydad-red text-white' : 'bg-white/10 text-white/60'
          }`}>
            {match.home_team.short_name.slice(0, 3)}
          </div>
          <span className="text-sm font-bold text-white">{match.home_team.name}</span>
        </div>
        {!isScheduled && (
          <span className="font-display text-xl font-bold tabular-nums text-white">
            {match.score_home}
          </span>
        )}
      </div>

      {/* Away team */}
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${
            match.away_team.id === 'wydad' ? 'bg-wydad-red text-white' : 'bg-white/10 text-white/60'
          }`}>
            {match.away_team.short_name.slice(0, 3)}
          </div>
          <span className="text-sm font-bold text-white">{match.away_team.name}</span>
        </div>
        {!isScheduled && (
          <span className="font-display text-xl font-bold tabular-nums text-white">
            {match.score_away}
          </span>
        )}
      </div>

      {/* Footer CTA */}
      <div className="mt-3 border-t border-white/10 pt-3">
        <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-white/40 transition-colors group-hover:text-white/70">
          {isCompleted ? t('full_time') : isScheduled ? (locale === 'ar' ? 'شراء التذاكر' : locale === 'fr' ? 'Acheter billets' : 'Buy tickets') : t('live')}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export function FixturesCarousel({ matches }: FixturesCarouselProps) {
  const t = useTranslations('matches');
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 'start' | 'end') {
    if (!scrollRef.current) return;
    const amount = direction === 'end' ? 320 : -320;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  }

  return (
    <section className="relative bg-surface-dark py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold uppercase tracking-wide text-white sm:text-2xl" style={{ fontStyle: 'italic' }}>
            {t('fixtures') || (locale === 'ar' ? 'المباريات' : locale === 'fr' ? 'Calendrier' : 'Fixtures')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy('start')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-white/30 hover:text-white"
              aria-label="Scroll left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => scrollBy('end')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-white/30 hover:text-white"
              aria-label="Scroll right"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-4 overflow-x-auto pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {matches.map((match) => (
            <div key={match.id} style={{ scrollSnapAlign: 'start' }}>
              <FixtureCard match={match} locale={locale} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
