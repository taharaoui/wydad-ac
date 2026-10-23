'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NextMatchCountdown } from './NextMatchCountdown';
import { useTranslations, useLocale } from 'next-intl';
import type { Match } from '@/types';
import { clubShortName, isBotola } from '@/lib/clubs';
import { TeamCrest } from '@/components/ui/TeamCrest';
import { SmartLink } from '@/components/layout/header/SmartLink';

export interface FixtureItem {
  match: Match;
  /** Kick-off text, formatted on the server (see formatKickoff) so it can't differ after hydration */
  day: string;
  time: string;
  /** Ticket page; when set, the card opens it and its call to action reads "Buy tickets" */
  ticketsUrl?: string;
}

interface FixturesCarouselProps {
  items: FixtureItem[];
  /** Next Wydad kick-off, for the countdown in the header */
  nextKickoff?: string;
  /** Extra card appended after the matches (e.g. the Botola record) */
  extra?: ReactNode;
}


// Card cut: square corners with the bottom-right corner clipped, as on psg.fr
const CARD_CLIP = 'polygon(0 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 0 100%)';

/** Basketball outline, for the multisport cards */
function BasketballIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2v20M5 5c3 3 3 11 0 14M19 5c-3 3-3 11 0 14" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function TeamLine({ team, score, showScore }: { team: Match['home_team']; score: number | null; showScore: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <TeamCrest team={team} size={34} fallbackClassName="rounded-full bg-[#d9dce1] text-[#1b2533]" />
      <span className="min-w-0 truncate font-condensed text-[30px] font-extrabold uppercase italic leading-none tracking-tight text-[#0f1620] rtl:not-italic sm:text-[34px]">
        {clubShortName(team)}
      </span>
      {showScore && (
        <span className="shrink-0 font-condensed text-[30px] font-bold italic leading-none tabular-nums text-[#6f7f92] rtl:not-italic sm:text-[34px]">
          {score}
        </span>
      )}
    </div>
  );
}

function FixtureCard({ match, day, time, ticketsUrl }: FixtureItem) {
  const t = useTranslations('matches');
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const basketball = match.sport === 'basketball';
  const botola = !basketball && isBotola(match.competition);

  return (
    <SmartLink
      href={ticketsUrl ?? (basketball ? '/basketball' : `/matches/${match.id}`)}
      className="group relative flex h-full w-[290px] shrink-0 flex-col overflow-hidden bg-[#f2f3f5] px-6 pb-6 pt-7 transition-transform duration-200 hover:-translate-y-1 sm:w-[340px]"
      style={{ clipPath: CARD_CLIP }}
    >
      {/* Competition watermark */}
      {botola && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/competitions/botola-pro-emblem.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-8 -end-8 h-[200px] w-auto select-none opacity-[0.08] grayscale"
        />
      )}

      {basketball && (
        <BasketballIcon className="pointer-events-none absolute -bottom-10 -end-10 h-[190px] w-[190px] select-none text-[#1b2533] opacity-[0.07]" />
      )}

      {/* Tag + status */}
      <div className="relative flex items-center gap-2.5 font-condensed text-[15px] font-bold uppercase leading-none text-[#1b2533]">
        {basketball ? (
          <span className="flex items-center gap-1 bg-wydad-logo px-1.5 py-1 text-white">
            <BasketballIcon className="h-3.5 w-3.5" />
            {t('basketball_tag')}
          </span>
        ) : (
          <span className="bg-[#c8ced6] px-1.5 py-1">
            {botola ? t('botola_tag') : match.competition.short_name}
          </span>
        )}
        {isLive ? (
          <span className="flex items-center gap-1.5 text-wydad-red">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-wydad-logo" />
            {t('live')} {match.minute != null && `${match.minute}'`}
          </span>
        ) : isFinished ? (
          <span>{t('full_time')}</span>
        ) : (
          <span>
            <span className="text-[#6f7f92]">{day}</span> {time}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="relative mt-5 flex flex-col gap-3">
        <TeamLine team={match.home_team} score={match.score_home} showScore={isFinished || isLive} />
        <TeamLine team={match.away_team} score={match.score_away} showScore={isFinished || isLive} />
      </div>

      {/* Call to action */}
      <span className="relative mt-auto flex items-center gap-1.5 pt-6 font-condensed text-[19px] font-bold uppercase italic leading-none text-[#5d6e82] transition-colors group-hover:text-wydad-red rtl:not-italic">
        {ticketsUrl ? t('buy_tickets') : basketball ? t('basket_info') : isFinished || isLive ? t('match_centre') : t('preview')}
        <Chevron />
      </span>
    </SmartLink>
  );
}

export function FixturesCarousel({ items, nextKickoff, extra }: FixturesCarouselProps) {
  const t = useTranslations('matches');
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ size: 1, offset: 0 });

  function updateThumb() {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setThumb({
      size: el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1,
      offset: max > 0 ? Math.abs(el.scrollLeft) / max : 0,
    });
  }

  // Open on the next match (the first one not yet played), with the last result beside it
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const next = items.findIndex(({ match }) => match.status !== 'finished');
    const target = el.children[Math.max(0, next - 1)] as HTMLElement | undefined;
    if (next > 0 && target) {
      // Align the card with the carousel's start edge (left in LTR, right in RTL)
      const rtl = getComputedStyle(el).direction === 'rtl';
      const box = el.getBoundingClientRect();
      const card = target.getBoundingClientRect();
      el.scrollLeft += rtl ? card.right - box.right : card.left - box.left;
    }
    updateThumb();
  }, [items]);

  function scrollBy(direction: 'start' | 'end') {
    const el = scrollRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === 'rtl';
    const step = 360 * (direction === 'end' ? 1 : -1) * (rtl ? -1 : 1);
    el.scrollBy({ left: step, behavior: 'smooth' });
  }

  const arrowClass =
    'flex h-11 w-11 items-center justify-center bg-white/[0.06] text-white/60 transition-colors hover:bg-white/[0.12] hover:text-white';

  return (
    <section className="relative overflow-hidden bg-surface-dark py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <h2 className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-white rtl:not-italic sm:text-5xl">
              {t('calendar')}
            </h2>
            {nextKickoff && (
              <div className="flex items-center gap-4">
                <span className="font-condensed text-sm font-extrabold uppercase italic text-white/80 rtl:not-italic">{t('next_match')}</span>
                <NextMatchCountdown kickoff={nextKickoff} tone="light" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href="/api/calendar"
              className="me-2 hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 sm:inline-flex"
            >
              {t('sync_calendar')}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="4.5" width="18" height="16" rx="2" />
                <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
              </svg>
            </a>
            <button type="button" onClick={() => scrollBy('start')} className={arrowClass} aria-label={locale === 'ar' ? 'السابق' : locale === 'fr' ? 'Précédent' : 'Previous'}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button type="button" onClick={() => scrollBy('end')} className={arrowClass} aria-label={locale === 'ar' ? 'التالي' : locale === 'fr' ? 'Suivant' : 'Next'}>
              <Chevron />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={updateThumb}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1"
        >
          {items.map((item) => (
            <div key={item.match.id} className="snap-start">
              <FixtureCard {...item} />
            </div>
          ))}
          {extra && <div className="w-[290px] shrink-0 snap-start sm:w-[340px]">{extra}</div>}
        </div>

        {/* Scroll position indicator */}
        {thumb.size < 1 && (
          <div className="mx-auto mt-8 h-[3px] w-36 overflow-hidden rounded-full bg-white/15" aria-hidden>
            <div
              className="h-full rounded-full bg-white transition-[margin] duration-150"
              style={{
                width: `${thumb.size * 100}%`,
                marginInlineStart: `${thumb.offset * (1 - thumb.size) * 100}%`,
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
