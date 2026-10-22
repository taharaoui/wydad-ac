import type { Match } from '@/types';

/**
 * Wydad basketball fixtures. No data feed covers the basketball league yet, so fixtures are
 * entered here as the club announces them. Crests reuse the clubs' football ids.
 */
export const DISLOG_LEAGUE = {
  id: 'dislog-basketball-league',
  name: 'DISLOG Basketball League',
  short_name: 'DBL',
  country: 'Morocco',
};

export const BASKETBALL_FIXTURES: Match[] = [
  {
    id: 'bb-wac-fus-2026-10-26',
    sport: 'basketball',
    competition: DISLOG_LEAGUE,
    home_team: { id: 'tm_805667', name: 'Wydad AC', short_name: 'WAC' },
    away_team: { id: 'tm_337870', name: 'FUS Rabat', short_name: 'FUS' },
    status: 'scheduled',
    kickoff: '2026-10-26T18:00:00Z', // 19:00 in Casablanca
    matchday: 3,
    venue: 'Salle du complexe sportif Mohammed V, Casablanca',
    score_home: null,
    score_away: null,
    minute: null,
  },
];

/** Upcoming first, soonest first */
export function upcomingBasketball(now = new Date()): Match[] {
  return BASKETBALL_FIXTURES.filter((m) => m.status !== 'finished' && new Date(m.kickoff).getTime() + 3 * 3_600_000 > now.getTime()).sort((a, b) =>
    a.kickoff.localeCompare(b.kickoff),
  );
}
