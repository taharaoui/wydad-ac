import type { Match, MatchEvent, MatchStats, Lineup, StandingRow } from '@/types';
import { mockMatches, mockStandings } from '@/lib/mock-data';
import { isWydad } from '@/lib/clubs';
import {
  IS_MOCK,
  fetchMatches as apiFetchMatches,
  ESPOIR_TEAM_ID,
  fetchSeasonMatches,
  getSeasonIds,
  getCurrentSeasonId,
  fetchMatch as apiFetchMatch,
  fetchMatchTimeline,
  fetchMatchStats as apiFetchMatchStats,
  fetchMatchLineups,
  fetchMatchPlayerStats,
  fetchStandings as apiFetchStandings,
  type MappedMatch,
  type MappedMatchEvent,
  type MappedMatchStats,
  type MappedStandingRow,
  type MappedLineup,
  type MappedPlayerMatchStats,
} from '@/lib/football-data';

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
    home_coach: m.home_coach,
    away_coach: m.away_coach,
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
  return { groups: s.groups.map((g) => ({ key: g.key, rows: g.rows.map((r) => ({ ...r })) })) };
}

/** Merge a lineup with per-player ratings/stats, deriving substitution minutes. */
function toLineup(l: MappedLineup, playerStats: Map<string, MappedPlayerMatchStats>): Lineup {
  return {
    formation: l.formation,
    players: l.players.map((p) => {
      const ps = playerStats.get(p.id);
      // Source gives who-replaced-whom, not the minute: use the starter's minutes played
      const outMinute = ps?.replaced_by ? ps.minutes : undefined;
      const replaced = ps?.replaced ? playerStats.get(ps.replaced) : undefined;
      return {
        id: p.id,
        name: p.name,
        short_name: p.short_name,
        number: p.number,
        position: p.position,
        is_starter: p.is_starter,
        is_captain: p.is_captain,
        substituted_out: outMinute,
        substituted_in: replaced ? replaced.minutes : undefined,
        replaced_player_id: ps?.replaced ?? undefined,
        rating: ps?.rating ?? undefined,
        minutes: ps ? ps.minutes : undefined,
        stats: ps?.stats,
      };
    }),
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

/** All published Botola matches for the current season (fixtures + results). */
export async function getMatches(): Promise<Match[]> {
  if (IS_MOCK) return mockMatches;

  try {
    const matches = await fetchSeasonMatches(await getCurrentSeasonId());
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
    // Upcoming matches have no detail data; skip the calls (API is rate-limited)
    if (match.status === 'scheduled') return result;

    const [events, stats, lineups, playerStats] = await Promise.all([
      fetchMatchTimeline(id),
      apiFetchMatchStats(id),
      fetchMatchLineups(id),
      fetchMatchPlayerStats(id),
    ]);

    if (events.length > 0) result.events = events.map(toEvent);
    if (stats) result.stats = toStats(stats);
    if (lineups) {
      const byPlayer = new Map(playerStats.map((ps) => [ps.player_id, ps]));
      result.home_lineup = toLineup(lineups.home, byPlayer);
      result.away_lineup = toLineup(lineups.away, byPlayer);
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
    // Latest results, and every game from yesterday on: the second list carries the game being
    // played (status "live"), which neither a "finished" nor a "scheduled" filter would return
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const [finished, fromYesterday] = await Promise.all([
      apiFetchMatches({ status: 'finished', sort: '-utc_date', limit }),
      apiFetchMatches({ dateFrom: yesterday, sort: 'utc_date', limit: limit + 2 }),
    ]);
    const scheduled = fromYesterday.filter((m) => m.status !== 'finished' && m.status !== 'cancelled');

    // Keep up to half the slots for upcoming games, fill the rest with the latest results,
    // then order oldest → newest so the carousel reads left to right through time
    const upcoming = scheduled.slice(0, Math.max(Math.ceil(limit / 2), limit - finished.length));
    const past = finished.slice(0, limit - upcoming.length).reverse();
    return [...past, ...upcoming].map(toMatch);
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

// ── Match context: form + head-to-head ──

export interface MatchContext {
  opponent: Match['home_team'];
  /** Last 5 finished matches before this one, newest first */
  wydadForm: Match[];
  opponentForm: Match[];
  /** Wydad vs this opponent in Botola over the last two seasons, newest first */
  h2h: Match[];
}

/**
 * TheStatsAPI has no head-to-head or form endpoint, so both are built from match lists:
 * Wydad's last two Botola seasons (past season cached for a day) plus the opponent's recent results.
 */
export async function getMatchContext(match: Match): Promise<MatchContext> {
  const opponent = isWydad(match.home_team.id) ? match.away_team : match.home_team;
  const before = (m: Match) => m.status === 'finished' && m.id !== match.id && m.kickoff < match.kickoff;
  const newestFirst = (a: Match, b: Match) => b.kickoff.localeCompare(a.kickoff);
  const vsOpponent = (m: Match) => m.home_team.id === opponent.id || m.away_team.id === opponent.id;

  if (IS_MOCK) {
    const past = mockMatches.filter(before).sort(newestFirst);
    return { opponent, wydadForm: past.slice(0, 5), opponentForm: [], h2h: past.filter(vsOpponent) };
  }

  try {
    const seasonIds = await getSeasonIds(2);
    const [seasons, opponentRecent] = await Promise.all([
      Promise.all(seasonIds.map((sid, i) => fetchSeasonMatches(sid, { revalidate: i === 0 ? 60 : 86400 }))),
      apiFetchMatches({ teamId: opponent.id, status: 'finished', sort: '-utc_date', limit: 10 }),
    ]);
    const wydadPast = seasons.flat().map(toMatch).filter(before).sort(newestFirst);
    return {
      opponent,
      wydadForm: wydadPast.slice(0, 5),
      opponentForm: opponentRecent.map(toMatch).filter(before).sort(newestFirst).slice(0, 5),
      h2h: wydadPast.filter(vsOpponent),
    };
  } catch (err) {
    warnFallback('getMatchContext', err);
    return { opponent, wydadForm: [], opponentForm: [], h2h: [] };
  }
}

/** Wydad AC Espoir (U23) matches from the API, oldest first; empty when none are published. */
export async function getEspoirMatches(): Promise<Match[]> {
  if (IS_MOCK) return [];
  try {
    const [finished, scheduled] = await Promise.all([
      apiFetchMatches({ teamId: ESPOIR_TEAM_ID, status: 'finished', sort: '-utc_date', limit: 30 }),
      apiFetchMatches({ teamId: ESPOIR_TEAM_ID, status: 'scheduled', sort: 'utc_date', limit: 30 }),
    ]);
    return [...finished.reverse(), ...scheduled].map(toMatch);
  } catch (err) {
    console.warn('[matches] getEspoirMatches failed:', err instanceof Error ? err.message : err);
    return [];
  }
}
