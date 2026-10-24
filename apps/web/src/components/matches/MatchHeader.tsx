import { isBotola } from '@/lib/clubs';
import { useLocale, useTranslations } from 'next-intl';
import type { Match } from '@/types';
import type { SummaryGoal } from '@/lib/match-summary';
import { TeamCrest } from '@/components/ui/TeamCrest';
import { LocalKickoff } from '@/components/ui/LocalKickoff';

interface MatchHeaderProps {
  match: Match;
  goals: SummaryGoal[];
}

function BallIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="shrink-0 text-white">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5l4 2.9-1.5 4.7h-5L8 10.4z" fill="currentColor" />
      <path d="M12 7.5V2.5M16 10.4l4.6-1.5M14.5 15.1l2.9 4M9.5 15.1l-2.9 4M8 10.4 3.4 8.9" />
    </svg>
  );
}

/** One team line, psg.fr style: crest, huge italic name, score, scorers underneath. */
function TeamRow({ team, score, showScore, goals, penLabel }: { team: Match['home_team']; score: number | null; showScore: boolean; goals: SummaryGoal[]; penLabel: string }) {
  return (
    <div>
      <div className="flex items-center gap-4 sm:gap-6">
        <TeamCrest team={team} size={72} fallbackClassName="rounded-full bg-white/10 text-white" className="max-sm:!h-12 max-sm:!w-12" />
        <h2 className="min-w-0 font-condensed text-4xl font-extrabold uppercase italic leading-[0.9] tracking-tight text-white rtl:not-italic sm:text-6xl lg:text-7xl">
          {team.name}
        </h2>
        {showScore && (
          <span className="shrink-0 font-condensed text-4xl font-extrabold italic leading-none tabular-nums text-white/55 rtl:not-italic sm:text-6xl lg:text-7xl">
            {score}
          </span>
        )}
      </div>
      {goals.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-semibold text-white">
          {goals.map((g, i) => (
            <li key={`${g.player}-${i}`} className="flex items-center gap-1.5">
              <BallIcon />
              {g.player}
              {g.minute != null && <span className="tabular-nums">{g.minute}&apos;</span>}
              {g.penalty && <span className="font-normal text-white/60">({penLabel})</span>}
              {g.count > 1 && <span className="text-white/60">×{g.count}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MatchHeader({ match, goals }: MatchHeaderProps) {
  const locale = useLocale();
  const t = useTranslations('matches');
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const played = isFinished || isLive;
  const botola = isBotola(match.competition);

  return (
    <header className="relative overflow-hidden bg-surface-dark text-white">
      {/* Club-red glow and crest watermark */}
      <div className="pointer-events-none absolute -end-40 -top-40 h-[520px] w-[520px] rounded-full bg-white/10 blur-[120px]" aria-hidden />
      {botola && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/competitions/botola-pro-emblem.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -end-10 hidden h-[420px] w-auto opacity-[0.05] brightness-0 invert lg:block"
        />
      )}

      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* Status badge + date + competition path */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span
            className={`px-4 py-2 font-condensed text-2xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-3xl ${
              isLive ? 'bg-white text-wydad-logo' : 'bg-white/15'
            }`}
          >
            {isLive ? (
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                {t('live')} {match.minute != null && `${match.minute}'`}
              </span>
            ) : isFinished ? (
              t('ft_badge')
            ) : (
              <span dir="ltr"><LocalKickoff iso={match.kickoff} locale={locale} kind="time" /></span>
            )}
          </span>
          <div>
            <p className="text-base font-bold sm:text-lg"><LocalKickoff iso={match.kickoff} locale={locale} kind="long" /></p>
            <p className="mt-0.5 text-sm text-white/75">
              {botola ? 'Botola Pro' : match.competition.name}
              {match.matchday && (
                <>
                  <span className="mx-2 text-white/40">/</span>
                  {t('matchday')} {match.matchday}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Teams */}
        <div className="mt-10 grid gap-8 sm:mt-12 sm:gap-10">
          <TeamRow team={match.home_team} score={match.score_home} showScore={played} goals={goals.filter((g) => g.side === 'home')} penLabel={t('pen')} />
          <TeamRow team={match.away_team} score={match.score_away} showScore={played} goals={goals.filter((g) => g.side === 'away')} penLabel={t('pen')} />
        </div>

        {match.venue && (
          <p className="mt-8 text-sm font-medium text-white/80 sm:absolute sm:bottom-12 sm:end-8 sm:mt-0 lg:end-8">
            {match.venue}
          </p>
        )}
      </div>
    </header>
  );
}
