import { useTranslations } from 'next-intl';
import type { Match } from '@/types';

interface MatchHeaderProps {
  match: Match;
  locale: string;
}

export function MatchHeader({ match, locale }: MatchHeaderProps) {
  const t = useTranslations('matches');
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const isScheduled = match.status === 'scheduled';

  const dateObj = new Date(match.kickoff);
  const dateLocale = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-dark to-surface-dark-secondary p-6 sm:p-8">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, currentColor 20px, currentColor 21px)',
        }} />
      </div>

      <div className="relative">
        {/* Competition + matchday */}
        <div className="mb-6 flex items-center justify-center gap-2 text-sm text-white/60">
          <span>{match.competition.name}</span>
          {match.matchday && (
            <>
              <span>·</span>
              <span>{t('matchday')} {match.matchday}</span>
            </>
          )}
        </div>

        {/* Score row */}
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {/* Home team */}
          <div className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white sm:h-20 sm:w-20">
              {match.home_team.short_name}
            </div>
            <span className="text-center font-display text-sm font-semibold text-white sm:text-base">
              {match.home_team.name}
            </span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-2">
            {isFinished || isLive ? (
              <>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-4xl font-bold text-white sm:text-5xl">
                    {match.score_home}
                  </span>
                  <span className="text-xl text-white/40 sm:text-2xl">-</span>
                  <span className="font-display text-4xl font-bold text-white sm:text-5xl">
                    {match.score_away}
                  </span>
                </div>
                {isFinished && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                    {t('full_time')}
                  </span>
                )}
                {isLive && (
                  <span className="flex items-center gap-1.5 rounded-full bg-wydad-red/20 px-3 py-1 text-xs font-semibold text-wydad-red">
                    <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-wydad-red" />
                    {match.minute}&apos;
                  </span>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {dateObj.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-sm text-white/60">
                  {dateObj.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white sm:h-20 sm:w-20">
              {match.away_team.short_name}
            </div>
            <span className="text-center font-display text-sm font-semibold text-white sm:text-base">
              {match.away_team.name}
            </span>
          </div>
        </div>

        {/* Venue + date for finished matches */}
        {match.venue && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/50">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>{match.venue}</span>
            {(isFinished || isLive) && (
              <>
                <span>·</span>
                <span>{dateObj.toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
