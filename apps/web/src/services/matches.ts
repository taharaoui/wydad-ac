import type { Match, MatchEvent, MatchStats, Lineup, StandingRow } from '@/types';
import { mockMatches, mockStandings } from '@/lib/mock-data';
import {
  IS_MOCK,
  fetchMatches as apiFetchMatches,
  fetchMatch as apiFetchMatch,
  fetchMatchTimeline,
  fetchMatchStats as apiFetchMatchStats,
  fetchMatchLineups,
  fetchStandings as apiFetchStandings,
  type MappedMatch,
  type MappedMatchEvent,
  type MappedMatchStats,
  type MappedStandingRow,
  type MappedLineup,
} from '@/lib/stats-api';

/** Log a warning and return mock data when the API is unreachable (e.g. during build). */
function warnFallback(label: string, err: unknown): void {
  console.warn(`[matches] ${label} failed, using mock data:`, err instanceof Error ? err.message : err);
}

// ── Mappers (API mapped types → our Zod types) ──

function toMatch(m: MappedMatch): Match {
  return {
    id: m.id,
    competition: {
      id: m.competition.id,
      name: m.competition.name,
      short_name: m.competition.short_name,
      country: m.competition.country,
    },
    home_team: {
      id: m.home_team.id,
      name: m.home_team.name,
      short_name: m.home_team.short_name,
      logo_url: m.home_team.logo_url,
    },
    away_team: {
      id: m.away_team.id,
      name: m.away_team.name,
      short_name: m.away_team.short_name,
      logo_url: m.away_team.logo_url,
    },
    status: m.status,
    kickoff: m.kickoff,
    venue: m.venue,
    matchday: m.matchday,
    score_home: m.score_home,
    score_away: m.score_away,
    minute: m.minute,
  };
}

function toEvent(e: MappedMatchEvent): MatchEvent {
  return {
    id: e.id,
    type: e.type,
    minute: e.minute,
    added_time: e.added_time,
    player_name: e.player_name,
    assist_name: e.assist_name,
    team_id: e.team_id,
  };
}

function toStats(s: MappedMatchStats): MatchStats {
  return { ...s };
}

function toLineup(l: MappedLineup): Lineup {
  return {
    formation: l.formation,
    players: l.players.map((p) => ({
      id: p.id,
      name: p.name,
      short_name: p.short_name,
      number: p.number,
      position: p.position,
      is_starter: p.is_starter,
      is_captain: p.is_captain,
    })),
  };
}

function toStandingRow(r: MappedStandingRow): StandingRow {
  return {
    position: r.position,
    team: {
      id: r.team.id,
      name: r.team.name,
      short_name: r.team.short_name,
      logo_url: r.team.logo_url,
    },
    played: r.played,
    won: r.won,
    drawn: r.drawn,
    lost: r.lost,
    goals_for: r.goals_for,
    goals_against: r.goals_against,
    goal_difference: r.goal_difference,
    points: r.points,
    form: r.form,
  };
}

// ── Public API ──

export async function getMatches(): Promise<Match[]> {
  if (IS_MOCK) return mockMatches;

  try {
    const matches = await apiFetchMatches({ limit: 20 });
    return matches.map(toMatch);
  } catch (err) {
    warnFallback('getMatches', err);
    return mockMatches;
  }
}

export async function getMatchById(id: string): Promise<Match | null> {
  if (IS_MOCK) return mockMatches.find((m) => m.id === id) ?? null;

  try {
    const match = await apiFetchMatch(id);
    if (!match) return mockMatches.find((m) => m.id === id) ?? null;

    const result = toMatch(match);

    // Enrich with timeline, stats, and lineups in parallel
    const [events, stats, lineups] = await Promise.all([
      fetchMatchTimeline(id),
      apiFetchMatchStats(id),
      fetchMatchLineups(id),
    ]);

    if (events.length > 0) result.events = events.map(toEvent);
    if (stats) result.stats = toStats(stats);
    if (lineups) {
      result.home_lineup = toLineup(lineups.home);
      result.away_lineup = toLineup(lineups.away);
    }

    return result;
  } catch (err) {
    warnFallback('getMatchById', err);
    return mockMatches.find((m) => m.id === id) ?? null;
  }
}

export async function getNextMatch(): Promise<Match | null> {
  if (IS_MOCK) {
    return mockMatches.find((m) => m.status === 'scheduled') ?? null;
  }

  try {
    const matches = await apiFetchMatches({
      status: 'scheduled',
      sort: 'utc_date',
      limit: 1,
    });
    return matches.length > 0 ? toMatch(matches[0]) : null;
  } catch (err) {
    warnFallback('getNextMatch', err);
    return mockMatches.find((m) => m.status === 'scheduled') ?? null;
  }
}

export async function getLatestResult(): Promise<Match | null> {
  if (IS_MOCK) {
    return mockMatches.find((m) => m.status === 'finished') ?? null;
  }

  try {
    const matches = await apiFetchMatches({
      status: 'finished',
      sort: '-utc_date',
      limit: 1,
    });
    return matches.length > 0 ? toMatch(matches[0]) : null;
  } catch (err) {
    warnFallback('getLatestResult', err);
    return mockMatches.find((m) => m.status === 'finished') ?? null;
  }
}

export async function getRecentMatches(limit = 8): Promise<Match[]> {
  if (IS_MOCK) return mockMatches.slice(0, limit);

  try {
    // Fetch both finished and scheduled to build the fixtures carousel
    const [finished, scheduled] = await Promise.all([
      apiFetchMatches({ status: 'finished', sort: '-utc_date', limit }),
      apiFetchMatches({ status: 'scheduled', sort: 'utc_date', limit }),
    ]);

    // Combine: past results (recent first) then upcoming (soonest first)
    const combined = [...finished.reverse(), ...scheduled].slice(0, limit);
    return combined.map(toMatch);
  } catch (err) {
    warnFallback('getRecentMatches', err);
    return mockMatches.slice(0, limit);
  }
}

export async function getStandings(): Promise<StandingRow[]> {
  if (IS_MOCK) return mockStandings;

  try {
    const standings = await apiFetchStandings();
    return standings.map(toStandingRow);
  } catch (err) {
    warnFallback('getStandings', err);
    return mockStandings;
  }
}
