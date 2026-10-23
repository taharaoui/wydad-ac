import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Match } from '@/types';
import { clubShortName, isWydad, isBotola } from '@/lib/clubs';
import { TeamCrest } from '@/components/ui/TeamCrest';
import { NextMatchCountdown } from './NextMatchCountdown';
import { TICKETS_PAGE } from '@/lib/links';

export interface CalendarItem {
  match: Match;
  /** e.g. "Saturday 24 October, 18:00", formatted on the server (formatKickoffLong) */
  dateLabel: string;
}

interface CalendarSectionProps {
  items: CalendarItem[];
  /** Kick-off of the next match, for the countdown */
  nextKickoff?: string;
}


function MatchCard({ match, dateLabel, isNext }: CalendarItem & { isNext: boolean }) {
  const t = useTranslations('matches');
  const played = match.status === 'finished' || match.status === 'live';
  const botola = isBotola(match.competition);
  const wydadHome = isWydad(match.home_team.id);
  const showTickets = !played && wydadHome;
  const competition = botola ? 'Botola Pro' : match.competition.name;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_4px_24px_rgb(0_0_0/0.08)] ring-1 ring-border">
      {/* Dark band: crests, competition mark or score */}
      <div className="relative bg-surface-dark px-5 pb-5 pt-7 text-white">
        {isNext && (
          <p className="absolute inset-x-0 top-2.5 text-center text-[11px] font-medium text-white/70">
            {t('next_match')}
          </p>
        )}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {[match.home_team, null, match.away_team].map((team, i) =>
            team ? (
              <div key={team.id} className="flex flex-col items-center gap-2.5 text-center">
                <TeamCrest team={team} size={56} fallbackClassName="rounded-full bg-white/10 text-white" />
                <span className="line-clamp-1 text-sm font-semibold">{clubShortName(team)}</span>
              </div>
            ) : (
              <div key={i} className="flex flex-col items-center gap-2">
                {botola ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/competitions/botola-pro.svg"
                    alt="Botola Pro"
                    className={`w-auto brightness-0 invert ${played ? 'h-9' : 'h-12'}`}
                  />
                ) : (
                  !played && <span className="font-condensed text-2xl font-extrabold italic text-white/60">VS</span>
                )}
                {played && (
                  <span className="font-condensed text-3xl font-extrabold tabular-nums leading-none" dir="ltr">
                    {match.score_home}
                    <span className="mx-1.5 text-white/40">-</span>
                    {match.score_away}
                  </span>
                )}
              </div>
            ),
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <p className="font-condensed text-xl font-bold leading-tight text-fg">{dateLabel}</p>
        <p className="mt-2 text-sm text-fg-secondary">
          {competition}
          {match.matchday ? `, ${t('matchday')} ${match.matchday}` : ''}
        </p>
        <p className="mt-1.5 text-sm text-fg-secondary">
          {match.venue ?? (wydadHome ? t('home_game') : t('away_game'))}
        </p>

        {showTickets && (
          <Link
            href={`/matches/${match.id}`}
            className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-wydad-red underline underline-offset-2 hover:no-underline"
          >
            {t('match_centre')}
          </Link>
        )}

        <div className="mt-auto pt-6">
          {showTickets ? (
            <Link
              href={TICKETS_PAGE}
              className="block rounded-md bg-wydad-logo py-3 text-center font-condensed text-lg font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-wydad-red-hover"
            >
              {t('tickets')}
            </Link>
          ) : (
            <Link
              href={`/matches/${match.id}`}
              className={`block rounded-md py-3 text-center font-condensed text-lg font-bold uppercase tracking-wide transition-colors ${
                played
                  ? 'border-2 border-fg/80 text-fg hover:bg-fg hover:text-surface'
                  : 'bg-wydad-logo text-white shadow-sm hover:bg-wydad-red-hover'
              }`}
            >
              {played ? t('match_centre') : t('preview')}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function CalendarSection({ items, nextKickoff }: CalendarSectionProps) {
  const t = useTranslations('matches');
  const nextId = items.find(({ match }) => match.status === 'scheduled')?.match.id;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <h2 className="font-condensed text-4xl font-extrabold uppercase leading-none text-fg sm:text-5xl">
            {t('calendar')}
          </h2>
          {nextKickoff && (
            <div className="flex items-center gap-4">
              <span className="font-condensed text-sm font-extrabold uppercase italic text-fg rtl:not-italic">
                {t('next_match')}
              </span>
              <NextMatchCountdown kickoff={nextKickoff} />
            </div>
          )}
        </div>
        <a
          href="/api/calendar"
          className="inline-flex items-center gap-2 rounded-full bg-surface-secondary px-4 py-2 text-sm font-medium text-fg ring-1 ring-border transition-colors hover:bg-border"
        >
          {t('sync_calendar')}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="4.5" width="18" height="16" rx="2" />
            <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
            <path d="M8 14h2M14 14h2M8 17.5h2" />
          </svg>
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <MatchCard key={item.match.id} {...item} isNext={item.match.id === nextId} />
        ))}

        {/* Botola 2026-27 card: crests and the club's record */}
        <Link
          href="/standings"
          className="group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-wydad-logo to-[#7d0f12] p-6 text-white"
        >
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/clubs/tm_805667.svg" alt="Wydad Athletic Club" className="h-16 w-auto drop-shadow transition-transform duration-500 group-hover:scale-105" />
            <span className="h-10 w-px bg-white/30" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/competitions/botola-pro-emblem.svg" alt="Botola Pro" className="h-14 w-auto brightness-0 invert" />
          </div>
          <div className="mt-5">
            <p className="font-condensed text-xs font-bold uppercase tracking-[0.16em] text-white/75">{t('record_label')}</p>
            <p className="mt-1 flex items-baseline gap-2 font-condensed font-extrabold uppercase leading-none">
              <span className="text-6xl tabular-nums">22</span>
              <span className="text-2xl">{t('record_titles')}</span>
            </p>
            <p className="mt-2 text-sm text-white/85">{t('record_gap')}</p>
          </div>
          <span className="mt-5 inline-flex items-center gap-1 font-condensed text-lg font-bold uppercase underline underline-offset-4 group-hover:no-underline">
            {t('see_botola')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180" aria-hidden>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </Link>
      </div>
    </section>
  );
}
