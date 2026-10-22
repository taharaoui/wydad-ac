import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FootballNav } from '@/components/team/FootballNav';
import { SeasonSchedule } from '@/components/matches/SeasonSchedule';
import { formatKickoffLong } from '@/lib/datetime';
import { getMatches, getStandings } from '@/services/matches';
import { Link } from '@/i18n/navigation';
import { StandingsPreview } from '@/components/home/StandingsPreview';
import type { Match } from '@/types';
import { isWydad } from '@/lib/clubs';
import { TeamCrest } from '@/components/ui/TeamCrest';

function MatchRow({ match, locale }: { match: Match; locale: string }) {
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const dateLocale = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB';
  const dateObj = new Date(match.kickoff);

  const isWydadHome = isWydad(match.home_team.id);
  const wydadScore = isWydadHome ? match.score_home : match.score_away;
  const opponentScore = isWydadHome ? match.score_away : match.score_home;
  const isWin = wydadScore !== null && opponentScore !== null && wydadScore > opponentScore;
  const isDraw = wydadScore !== null && opponentScore !== null && wydadScore === opponentScore;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:border-wydad-red/30 hover:shadow-sm"
    >
      {/* Date column */}
      <div className="w-16 shrink-0 text-center">
        <p className="text-xs text-fg-muted">
          {dateObj.toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', timeZone: 'Africa/Casablanca' })}
        </p>
        {!isFinished && !isLive && (
          <p className="mt-0.5 text-sm font-semibold text-fg">
            {dateObj.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Africa/Casablanca' })}
          </p>
        )}
        {isLive && (
          <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-wydad-red">
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-wydad-logo" />
            {match.minute}&apos;
          </span>
        )}
        {isFinished && (
          <span className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${
            isWin ? 'bg-accent-green-bg text-accent-green' :
            isDraw ? 'bg-accent-gold-bg text-accent-gold' :
            'bg-wydad-red-soft text-wydad-red'
          }`}>
            {isWin ? 'W' : isDraw ? 'D' : 'L'}
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={`flex items-center gap-2 text-sm font-medium ${
            isWydad(match.home_team.id) ? 'font-bold text-fg' : 'text-fg-secondary'
          }`}>
            <TeamCrest team={match.home_team} size={20} fallbackClassName="rounded bg-surface-secondary text-fg-muted" />
            <span className="truncate">{match.home_team.name}</span>
          </p>
          <p className={`mt-1.5 flex items-center gap-2 text-sm font-medium ${
            isWydad(match.away_team.id) ? 'font-bold text-fg' : 'text-fg-secondary'
          }`}>
            <TeamCrest team={match.away_team} size={20} fallbackClassName="rounded bg-surface-secondary text-fg-muted" />
            <span className="truncate">{match.away_team.name}</span>
          </p>
        </div>

        {(isFinished || isLive) && (
          <div className="shrink-0 text-end">
            <p className={`text-sm font-bold leading-5 ${
              isWydad(match.home_team.id) ? 'text-fg' : 'text-fg-secondary'
            }`}>
              {match.score_home}
            </p>
            <p className={`mt-1.5 text-sm font-bold leading-5 ${
              isWydad(match.away_team.id) ? 'text-fg' : 'text-fg-secondary'
            }`}>
              {match.score_away}
            </p>
          </div>
        )}
      </div>

      {/* Matchday */}
      {match.matchday && (
        <div className="hidden shrink-0 sm:block">
          <span className="text-xs text-fg-muted">
            J{match.matchday}
          </span>
        </div>
      )}

      {/* Arrow */}
      <svg className="h-4 w-4 shrink-0 text-fg-muted transition-colors group-hover:text-wydad-red rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'matches' });
  const tFootball = await getTranslations({ locale, namespace: 'football' });

  const [matches, standings] = await Promise.all([
    getMatches(),
    getStandings(),
  ]);

  const results = matches.filter(m => m.status === 'finished').sort(
    (a, b) => new Date(b.kickoff).getTime() - new Date(a.kickoff).getTime()
  );
  const fixtures = matches.filter(m => m.status === 'scheduled' || m.status === 'live').sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()
  );

  return (
    <>
    <FootballNav active="fixtures" />
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <h1 className="font-condensed text-6xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-7xl">
        {tFootball('fixtures')}
      </h1>
      <p className="mt-3 font-condensed text-2xl font-bold text-fg">{tFootball('season')}</p>

      <div className="mt-10">
        <SeasonSchedule matches={matches} dates={Object.fromEntries(matches.map((m) => [m.id, formatKickoffLong(m.kickoff, locale)]))} />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        {/* Main column: fixtures + results */}
        <div className="space-y-8 lg:col-span-2">
          {/* Fixtures */}
          {fixtures.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-lg font-bold text-fg">
                {t('fixtures')}
              </h2>
              <div className="space-y-3">
                {fixtures.map(match => (
                  <MatchRow key={match.id} match={match} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {/* Results */}
          {results.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-lg font-bold text-fg">
                {t('results')}
              </h2>
              <div className="space-y-3">
                {results.map(match => (
                  <MatchRow key={match.id} match={match} locale={locale} />
                ))}
              </div>
            </section>
          )}

          {matches.length === 0 && (
            <p className="text-fg-muted">{t('no_matches')}</p>
          )}
        </div>

        {/* Sidebar: standings */}
        <aside>
          <StandingsPreview standings={standings} />
        </aside>
      </div>
    </div>
    </>
  );
}
