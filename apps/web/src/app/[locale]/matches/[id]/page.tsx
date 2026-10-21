import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getMatchById, getMatches } from '@/services/matches';
import { MatchHeader } from '@/components/matches/MatchHeader';
import { MatchEvents } from '@/components/matches/MatchEvents';
import { MatchStatsPanel } from '@/components/matches/MatchStats';
import { MatchLineup } from '@/components/matches/MatchLineup';
import { Link } from '@/i18n/navigation';

export async function generateStaticParams() {
  const matches = await getMatches();
  const locales = ['ar', 'fr', 'en'];
  return locales.flatMap(locale =>
    matches.map(match => ({
      locale,
      id: match.id,
    }))
  );
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const match = await getMatchById(id);
  if (!match) notFound();

  const isFinished = match.status === 'finished';
  const hasEvents = match.events && match.events.length > 0;
  const hasStats = !!match.stats;
  const hasLineups = !!match.home_lineup && !!match.away_lineup;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/matches"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <svg className="h-4 w-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {locale === 'ar' ? 'المباريات' : locale === 'fr' ? 'Matchs' : 'Matches'}
      </Link>

      {/* Match header with score */}
      <MatchHeader match={match} locale={locale} />

      {/* Detail sections */}
      {isFinished && (hasEvents || hasStats || hasLineups) && (
        <div className="mt-6 space-y-6">
          {/* Events + Stats side by side on desktop */}
          {(hasEvents || hasStats) && (
            <div className="grid gap-6 lg:grid-cols-2">
              {hasEvents && (
                <MatchEvents events={match.events!} homeTeamId={match.home_team.id} />
              )}
              {hasStats && (
                <MatchStatsPanel stats={match.stats!} />
              )}
            </div>
          )}

          {/* Lineups full width */}
          {hasLineups && (
            <MatchLineup
              homeLineup={match.home_lineup!}
              awayLineup={match.away_lineup!}
              homeTeamName={match.home_team.short_name}
              awayTeamName={match.away_team.short_name}
            />
          )}
        </div>
      )}
    </div>
  );
}
