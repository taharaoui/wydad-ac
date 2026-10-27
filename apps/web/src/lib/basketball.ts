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

/** Ticket pages (webook.com), by fixture id */
export const BASKETBALL_TICKETS: Record<string, string> = {};

export const BASKETBALL_FIXTURES: Match[] = [
  {
    id: 'bb-wac-fus-2026-10-26',
    sport: 'basketball',
    competition: DISLOG_LEAGUE,
    home_team: { id: 'tm_805667', name: 'Wydad AC', short_name: 'WAC' },
    away_team: { id: 'tm_337870', name: 'FUS Rabat', short_name: 'FUS' },
    status: 'finished',
    kickoff: '2026-10-26T19:00:00Z', // 19:00 in Casablanca (Morocco on UTC+0 at this date)
    matchday: 3,
    venue: 'Salle du complexe sportif Mohammed V, Casablanca',
    // Club graphic, 26 Oct 2026: Wydad 61-51 FUS Rabat
    score_home: 61,
    score_away: 51,
    minute: null,
  },
];

/** Upcoming first, soonest first */
export function upcomingBasketball(now = new Date()): Match[] {
  return BASKETBALL_FIXTURES.filter((m) => m.status !== 'finished' && new Date(m.kickoff).getTime() + 3 * 3_600_000 > now.getTime()).sort((a, b) =>
    a.kickoff.localeCompare(b.kickoff),
  );
}

/** Results, latest first */
export function basketballResults(): Match[] {
  return BASKETBALL_FIXTURES.filter((m) => m.status === 'finished').sort((a, b) => b.kickoff.localeCompare(a.kickoff));
}

/** Results of the last two weeks, for the home calendar */
export function recentBasketball(now = new Date(), days = 14): Match[] {
  return basketballResults().filter((m) => now.getTime() - new Date(m.kickoff).getTime() < days * 86_400_000);
}

// ── Squad, staff, standings, honours ──
// Filled in by hand as the club publishes them; each page shows a notice while its list is empty.

export type BasketballPosition = 'point_guard' | 'shooting_guard' | 'small_forward' | 'power_forward' | 'center';
export const BASKETBALL_POSITIONS: BasketballPosition[] = ['point_guard', 'shooting_guard', 'small_forward', 'power_forward', 'center'];

export interface BasketballPlayer {
  id: string;
  name: string;
  number: number | null;
  position: BasketballPosition;
  photo?: string;
}

export const BASKETBALL_SQUAD: BasketballPlayer[] = [];

export interface BasketballStaffMember {
  name: string;
  name_ar?: string;
  role: { ar: string; fr: string; en: string };
  head?: boolean;
}

export const BASKETBALL_STAFF: BasketballStaffMember[] = [];

export interface BasketballStandingRow {
  position: number;
  team: { id: string; name: string; short_name: string };
  played: number;
  won: number;
  lost: number;
  points_for: number;
  points_against: number;
  points: number;
}

export const BASKETBALL_STANDINGS: BasketballStandingRow[] = [];

export interface BasketballTrophy {
  name: { ar: string; fr: string; en: string };
  years: string[];
}

export const BASKETBALL_HONOURS: BasketballTrophy[] = [];
