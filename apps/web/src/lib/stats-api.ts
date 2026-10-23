import { clubCrestUrl, clubName, isWydad } from '@/lib/clubs';
/**
 * TheStatsAPI client for Wydad AC website.
 *
 * Handles all communication with https://api.thestatsapi.com/api
 * and maps responses to our internal Zod-validated types.
 */

const API_KEY = process.env.STATS_API_KEY;
const API_BASE = process.env.STATS_API_BASE_URL || 'https://api.thestatsapi.com/api';
const TEAM_ID = process.env.WYDAD_TEAM_ID || 'tm_805667';
/** Wydad AC Espoir (U23 reserve team) */
export const ESPOIR_TEAM_ID = process.env.WYDAD_ESPOIR_TEAM_ID || 'tm_83439338';
const COMPETITION_ID = process.env.BOTOLA_COMPETITION_ID || 'comp_30610';

export const IS_MOCK = !API_KEY;

/** True for Wydad's team id (live API id, or the mock-data id). */
export function isWydadTeam(teamId: string): boolean {
  return teamId === TEAM_ID || isWydad(teamId);
}

// ── Generic fetcher ──

interface ApiListResponse<T> {
  data: T[];
  meta?: { total_pages: number; page: number; per_page: number };
}

interface ApiSingleResponse<T> {
  data: T;
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError = false,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** The Starter plan allows 12 requests per minute (x-ratelimit-limit). */
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function apiFetch<T>(
  path: string,
  options?: { revalidate?: number },
): Promise<T> {
  const url = `${API_BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      // Responses are shared by every page through Next's data cache; keep them long enough to
      // stay well under the per-minute limit
      next: { revalidate: Math.max(options?.revalidate ?? 300, 300) },
    });
    // During the build, wait for the rate-limit window to reset instead of falling back to demo
    // data (up to four times, ~1 min each). At runtime a visitor never waits: the caller falls back.
    for (let attempt = 0; IS_BUILD && res.status === 429 && attempt < 4; attempt++) {
      const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000;
      await sleep(Math.min(65_000, Math.max(2_000, (reset || Date.now() + 60_000) - Date.now() + 500)));
      res = await fetch(url, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        next: { revalidate: Math.max(options?.revalidate ?? 300, 300) },
      });
    }
  } catch (err) {
    // Network errors (DNS, connection refused, proxy blocked, etc.)
    throw new ApiError(
      `Network error on ${path}: ${err instanceof Error ? err.message : String(err)}`,
      undefined,
      true,
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(`TheStatsAPI ${res.status} on ${path}: ${text}`, res.status);
  }

  return JSON.parse(clubName(await res.text())) as T;
}

// ── Competition / Season ──

interface ApiCompetition {
  id: string;
  name: string;
  short_name?: string;
  country?: string;
  current_season_id?: string;
  total_teams?: number;
}

interface ApiSeason {
  id: string;
  name: string;
  is_current: boolean;
  year: string;
}

let _currentSeasonId: string | null = null;

/** Botola season ids, most recent first (e.g. 26/27, 25/26, …). */
export async function getSeasonIds(count: number): Promise<string[]> {
  const seasons = await apiFetch<ApiListResponse<ApiSeason & { start_year?: number }>>(
    `/football/competitions/${COMPETITION_ID}/seasons`,
    { revalidate: 3600 },
  );
  return [...seasons.data]
    .sort((a, b) => (b.start_year ?? 0) - (a.start_year ?? 0))
    .slice(0, count)
    .map((s) => s.id);
}

export async function getCurrentSeasonId(): Promise<string> {
  if (_currentSeasonId) return _currentSeasonId;

  try {
    // First try: get competition info which includes current_season_id
    const comp = await apiFetch<ApiSingleResponse<ApiCompetition>>(
      `/football/competitions/${COMPETITION_ID}`,
      { revalidate: 3600 },
    );
    if (comp.data.current_season_id) {
      _currentSeasonId = comp.data.current_season_id;
      return _currentSeasonId;
    }
  } catch {
    // Fallback: list seasons and find the current one
  }

  const seasons = await apiFetch<ApiListResponse<ApiSeason>>(
    `/football/competitions/${COMPETITION_ID}/seasons`,
    { revalidate: 3600 },
  );
  const current = seasons.data.find((s) => s.is_current);
  if (!current) throw new Error('No current season found for Botola');

  _currentSeasonId = current.id;
  return _currentSeasonId;
}

// ── Matches ──

interface ApiTeamRef {
  id: string;
  name: string;
  short_name?: string;
  logo_url?: string;
}

interface ApiCompetitionRef {
  id: string;
  name: string;
  short_name?: string;
  country?: string;
}

interface ApiMatch {
  id: string;
  competition?: ApiCompetitionRef;
  competition_id?: string;
  score?: { home?: number | null; away?: number | null } | null;
  home_manager?: { id: string; name: string } | null;
  away_manager?: { id: string; name: string } | null;
  home_team: ApiTeamRef;
  away_team: ApiTeamRef;
  status: string; // 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
  utc_date: string; // ISO datetime
  venue?: string;
  matchday?: number;
  home_score?: number | null;
  away_score?: number | null;
  minute?: number | null;
  // The API nests scores under various fields; we'll adapt
  [key: string]: unknown;
}

export interface MappedMatch {
  id: string;
  competition: { id: string; name: string; short_name: string; country: string };
  home_team: { id: string; name: string; short_name: string; logo_url?: string };
  away_team: { id: string; name: string; short_name: string; logo_url?: string };
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
  kickoff: string;
  venue?: string;
  matchday?: number;
  score_home: number | null;
  score_away: number | null;
  minute: number | null;
  home_coach?: string;
  away_coach?: string;
}

function mapTeam(t: ApiTeamRef): MappedMatch['home_team'] {
  return {
    id: t.id,
    name: t.name,
    short_name: t.short_name || t.name.slice(0, 3).toUpperCase(),
    logo_url: t.logo_url ?? clubCrestUrl(t.id, t.name),
  };
}

function mapCompetition(c: ApiCompetitionRef): MappedMatch['competition'] {
  return {
    id: c.id,
    name: c.name,
    short_name: c.short_name || c.name,
    country: c.country || 'Morocco',
  };
}

const _competitionCache = new Map<string, Promise<ApiCompetitionRef>>();

/** Match payloads only carry `competition_id`, so look the name up (cached per id). */
function getCompetitionRef(id: string): Promise<ApiCompetitionRef> {
  let ref = _competitionCache.get(id);
  if (!ref) {
    ref = apiFetch<ApiSingleResponse<ApiCompetition>>(`/football/competitions/${id}`, {
      revalidate: 86400,
    })
      .then((res) => res.data)
      .catch(() => ({ id, name: id === COMPETITION_ID ? 'Botola Pro' : id }));
    _competitionCache.set(id, ref);
  }
  return ref;
}

async function resolveCompetition(m: ApiMatch): Promise<ApiCompetitionRef> {
  if (m.competition) return m.competition;
  return getCompetitionRef(m.competition_id ?? COMPETITION_ID);
}

function mapMatch(m: ApiMatch, competition: ApiCompetitionRef): MappedMatch {
  // TheStatsAPI nests scores under `score`; keep flat fields as a fallback
  const scoreHome = m.score?.home ?? m.home_score ?? null;
  const scoreAway = m.score?.away ?? m.away_score ?? null;

  return {
    id: m.id,
    competition: mapCompetition(competition),
    home_team: mapTeam(m.home_team),
    away_team: mapTeam(m.away_team),
    status: (['scheduled', 'live', 'finished', 'postponed', 'cancelled'].includes(m.status)
      ? m.status
      : 'scheduled') as MappedMatch['status'],
    kickoff: m.utc_date,
    venue: m.venue,
    matchday: m.matchday,
    score_home: typeof scoreHome === 'number' ? scoreHome : null,
    score_away: typeof scoreAway === 'number' ? scoreAway : null,
    minute: typeof m.minute === 'number' ? m.minute : null,
    home_coach: m.home_manager?.name ?? undefined,
    away_coach: m.away_manager?.name ?? undefined,
  };
}

/**
 * Fetch Wydad matches, newest first by default.
 */
export async function fetchMatches(options?: {
  /** Defaults to Wydad */
  teamId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  sort?: string;
}): Promise<MappedMatch[]> {
  const params = new URLSearchParams({
    team_id: options?.teamId ?? TEAM_ID,
    per_page: String(options?.limit ?? 20),
    sort: options?.sort ?? '-utc_date',
  });

  if (options?.status) params.set('status', options.status);
  if (options?.dateFrom) params.set('date_from', options.dateFrom);
  if (options?.dateTo) params.set('date_to', options.dateTo);

  const res = await apiFetch<ApiListResponse<ApiMatch>>(
    `/football/matches?${params.toString()}`,
    { revalidate: 60 },
  );

  return Promise.all(res.data.map(async (m) => mapMatch(m, await resolveCompetition(m))));
}

/**
 * Fetch every Wydad match in a season (all pages), in kickoff order.
 * Only fixtures the league has published are returned.
 */
export async function fetchSeasonMatches(seasonId: string, options?: { revalidate?: number }): Promise<MappedMatch[]> {
  const all: ApiMatch[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const params = new URLSearchParams({
      team_id: TEAM_ID,
      season_id: seasonId,
      per_page: '100',
      page: String(page),
      sort: 'utc_date',
    });
    const res = await apiFetch<ApiListResponse<ApiMatch>>(
      `/football/matches?${params.toString()}`,
      { revalidate: options?.revalidate ?? 60 },
    );
    all.push(...res.data);
    totalPages = res.meta?.total_pages ?? 1;
    page++;
  } while (page <= totalPages);

  return Promise.all(all.map(async (m) => mapMatch(m, await resolveCompetition(m))));
}

/**
 * Fetch a single match by ID.
 */
export async function fetchMatch(matchId: string): Promise<MappedMatch | null> {
  try {
    const res = await apiFetch<ApiSingleResponse<ApiMatch>>(
      `/football/matches/${matchId}`,
      { revalidate: 60 },
    );
    return mapMatch(res.data, await resolveCompetition(res.data));
  } catch {
    return null;
  }
}

// ── Match Detail Endpoints ──

export interface ApiMatchEvent {
  id: string;
  type: string;
  minute: number;
  added_time?: number;
  player?: { id: string; name: string };
  assist?: { id: string; name: string };
  team?: { id: string; name: string };
}

export interface MappedMatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty_scored' | 'penalty_missed' | 'own_goal' | 'var';
  minute: number;
  added_time?: number;
  player_name: string;
  assist_name?: string;
  team_id: string;
}

function mapEvent(e: ApiMatchEvent): MappedMatchEvent {
  const validTypes = ['goal', 'yellow_card', 'red_card', 'substitution', 'penalty_scored', 'penalty_missed', 'own_goal', 'var'];
  return {
    id: e.id,
    type: (validTypes.includes(e.type) ? e.type : 'goal') as MappedMatchEvent['type'],
    minute: e.minute,
    added_time: e.added_time,
    player_name: e.player?.name ?? 'Unknown',
    assist_name: e.assist?.name,
    team_id: e.team?.id ?? '',
  };
}

export async function fetchMatchTimeline(matchId: string): Promise<MappedMatchEvent[]> {
  try {
    const res = await apiFetch<ApiSingleResponse<{ events?: ApiMatchEvent[] }>>(
      `/football/matches/${matchId}/timeline`,
      { revalidate: 120 },
    );
    return (res.data.events ?? []).map(mapEvent);
  } catch {
    return [];
  }
}

// ── Match Stats ──

type ApiHomeAway = { home: number | null; away: number | null } | null;
type ApiStatValue = { all: ApiHomeAway; first_half: ApiHomeAway; second_half: ApiHomeAway };

/** Sections of `/matches/{id}/stats`, each a map of stat name → home/away values. */
type ApiMatchStats = Record<string, Record<string, ApiStatValue | null> | string | null>;

export interface MappedStatRow {
  key: string;
  home: number;
  away: number;
  unit: 'count' | 'percent' | 'decimal';
}

export interface MappedMatchStats {
  groups: { key: string; rows: MappedStatRow[] }[];
}

const STAT_GROUPS = ['overview', 'shots', 'attack', 'passes', 'duels', 'defending', 'goalkeeping'];

function statUnit(key: string): MappedStatRow['unit'] {
  if (key === 'ball_possession' || key.endsWith('_percentage')) return 'percent';
  if (key.includes('expected_goals')) return 'decimal';
  return 'count';
}

export async function fetchMatchStats(matchId: string): Promise<MappedMatchStats | null> {
  try {
    const res = await apiFetch<ApiSingleResponse<ApiMatchStats>>(
      `/football/matches/${matchId}/stats`,
      { revalidate: 600 },
    );

    const groups = STAT_GROUPS.map((key) => {
      const section = res.data[key];
      if (!section || typeof section !== 'object') return { key, rows: [] };
      // Skip stats the source doesn't cover for this match (null)
      const rows = Object.entries(section).flatMap(([statKey, v]) => {
        const all = v?.all;
        if (all?.home == null || all?.away == null) return [];
        return [{ key: statKey, home: all.home, away: all.away, unit: statUnit(statKey) }];
      });
      return { key, rows };
    }).filter((g) => g.rows.length > 0);

    return groups.length > 0 ? { groups } : null;
  } catch {
    return null;
  }
}

// ── Lineups ──

interface ApiLineupPlayer {
  id: string;
  name: string;
  position?: string; // 'G' | 'D' | 'M' | 'F'
  jersey_number?: number | null;
}

interface ApiLineupSide {
  id: string;
  name: string;
  formation?: string | null;
  starting_xi?: ApiLineupPlayer[];
  substitutes?: ApiLineupPlayer[];
}

interface ApiLineup {
  confirmed?: boolean;
  home?: ApiLineupSide;
  away?: ApiLineupSide;
}

export interface MappedLineup {
  formation: string;
  players: {
    id: string;
    name: string;
    short_name: string;
    number: number;
    position: 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
    is_starter: boolean;
    is_captain?: boolean;
  }[];
}

function mapPosition(pos?: string): 'goalkeeper' | 'defender' | 'midfielder' | 'forward' {
  if (!pos) return 'midfielder';
  const p = pos.toLowerCase();
  if (p.includes('goal') || p === 'g') return 'goalkeeper';
  if (p.includes('def') || p === 'd') return 'defender';
  if (p.includes('mid') || p === 'm') return 'midfielder';
  if (p.includes('for') || p.includes('att') || p === 'f') return 'forward';
  return 'midfielder';
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : name;
}

function mapLineupSide(side: ApiLineupSide): MappedLineup {
  const toPlayer = (p: ApiLineupPlayer, is_starter: boolean) => ({
    id: p.id,
    name: p.name,
    short_name: shortName(p.name),
    number: p.jersey_number ?? 0,
    position: mapPosition(p.position),
    is_starter,
  });
  return {
    formation: side.formation ?? '',
    players: [
      ...(side.starting_xi ?? []).map((p) => toPlayer(p, true)),
      ...(side.substitutes ?? []).map((p) => toPlayer(p, false)),
    ],
  };
}

export async function fetchMatchLineups(
  matchId: string,
): Promise<{ home: MappedLineup; away: MappedLineup } | null> {
  try {
    const res = await apiFetch<ApiSingleResponse<ApiLineup>>(
      `/football/matches/${matchId}/lineups`,
      { revalidate: 600 },
    );
    const d = res.data;
    if (!d.home?.starting_xi?.length || !d.away?.starting_xi?.length) return null;
    return { home: mapLineupSide(d.home), away: mapLineupSide(d.away) };
  } catch {
    return null;
  }
}

// ── Player Match Stats (ratings) ──

interface ApiPlayerMatchStats {
  player_id: string;
  player_name: string;
  team_id: string;
  rating: number | null;
  started: boolean;
  played: boolean;
  minutes_played: number | null;
  passing?: Record<string, number | null>;
  shooting?: Record<string, number | null>;
  duels?: Record<string, number | null>;
  defending?: Record<string, number | null>;
  goalkeeping?: Record<string, number | null>;
  general?: Record<string, number | string | null>;
}

export interface MappedPlayerMatchStats {
  player_id: string;
  team_id: string;
  rating: number | null; // null when unrated (source sends 0)
  minutes: number;
  /** Id of the player who replaced this starter */
  replaced_by: string | null;
  /** Id of the player this substitute replaced */
  replaced: string | null;
  stats: Record<string, number>;
}

function mapPlayerMatchStats(p: ApiPlayerMatchStats): MappedPlayerMatchStats {
  const stats: Record<string, number> = {};
  for (const group of [p.passing, p.shooting, p.duels, p.defending, p.goalkeeping, p.general]) {
    for (const [k, v] of Object.entries(group ?? {})) {
      if (typeof v === 'number') stats[k] = v;
    }
  }
  const general = p.general ?? {};
  return {
    player_id: p.player_id,
    team_id: p.team_id,
    rating: p.rating ? p.rating : null,
    minutes: p.minutes_played ?? 0,
    replaced_by: typeof general.player_subbed_on === 'string' ? general.player_subbed_on : null,
    replaced: typeof general.player_subbed_off === 'string' ? general.player_subbed_off : null,
    stats,
  };
}

/** Per-player stats + ratings. Empty when the source has no detailed data for the match. */
export async function fetchMatchPlayerStats(matchId: string): Promise<MappedPlayerMatchStats[]> {
  try {
    const res = await apiFetch<ApiListResponse<ApiPlayerMatchStats>>(
      `/football/matches/${matchId}/player-stats`,
      { revalidate: 600 },
    );
    return res.data.map(mapPlayerMatchStats);
  } catch {
    return [];
  }
}

// ── Standings ──

interface ApiStandingRow {
  team: ApiTeamRef;
  position: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  group_label?: string;
}

export interface MappedStandingRow {
  position: number;
  team: { id: string; name: string; short_name: string; logo_url?: string };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form?: ('W' | 'D' | 'L')[];
}

export async function fetchStandings(): Promise<MappedStandingRow[]> {
  const seasonId = await getCurrentSeasonId();

  const res = await apiFetch<ApiListResponse<ApiStandingRow>>(
    `/football/competitions/${COMPETITION_ID}/seasons/${seasonId}/standings`,
    { revalidate: 300 },
  );

  return res.data.map((row) => ({
    position: row.position,
    team: mapTeam(row.team),
    played: row.matches_played,
    won: row.wins,
    drawn: row.draws,
    lost: row.losses,
    goals_for: row.goals_for,
    goals_against: row.goals_against,
    goal_difference: row.goal_difference,
    points: row.points,
  }));
}

// ── Players / Squad ──

interface ApiPlayer {
  id: string;
  name: string;
  short_name?: string;
  shirt_number?: number;
  position?: string;
  nationality?: string;
  date_of_birth?: string;
  height?: number;
  photo_url?: string;
  age?: number;
  current_team?: { id: string; name: string };
}

export interface MappedPlayer {
  id: string;
  name: string;
  short_name: string;
  number: number | null;
  position: 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
  nationality: string;
  date_of_birth: string;
  height_cm?: number;
  photo_url?: string;
}

function mapPlayer(p: ApiPlayer): MappedPlayer {
  return {
    id: p.id,
    name: p.name,
    short_name: p.short_name ?? p.name.split(' ').pop() ?? p.name,
    number: p.shirt_number ?? null,
    position: mapPosition(p.position),
    nationality: p.nationality ?? '',
    date_of_birth: p.date_of_birth ?? '',
    height_cm: p.height,
    photo_url: p.photo_url,
  };
}

export async function fetchSquad(teamId: string = TEAM_ID): Promise<MappedPlayer[]> {
  const res = await apiFetch<ApiListResponse<ApiPlayer>>(
    `/football/teams/${teamId}/players`,
    { revalidate: 3600 },
  );

  return res.data.map(mapPlayer);
}

export async function fetchPlayer(playerId: string): Promise<MappedPlayer | null> {
  try {
    const res = await apiFetch<ApiSingleResponse<ApiPlayer>>(
      `/football/players/${playerId}`,
      { revalidate: 3600 },
    );
    return mapPlayer(res.data);
  } catch {
    return null;
  }
}

// ── Player Stats ──

interface ApiPlayerSeasonStats {
  appearances?: number;
  goals?: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
  minutes_played?: number;
  clean_sheets?: number;
  rating?: number;
}

export interface MappedPlayerStats {
  appearances: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  minutes_played: number;
  clean_sheets?: number;
  rating?: number;
}

export async function fetchPlayerStats(
  playerId: string,
  seasonId?: string,
): Promise<MappedPlayerStats | null> {
  try {
    const sId = seasonId ?? (await getCurrentSeasonId());
    const res = await apiFetch<ApiSingleResponse<ApiPlayerSeasonStats>>(
      `/football/players/${playerId}/stats?season_id=${sId}`,
      { revalidate: 600 },
    );
    const d = res.data;
    return {
      appearances: d.appearances ?? 0,
      goals: d.goals ?? 0,
      assists: d.assists ?? 0,
      yellow_cards: d.yellow_cards ?? 0,
      red_cards: d.red_cards ?? 0,
      minutes_played: d.minutes_played ?? 0,
      clean_sheets: d.clean_sheets,
      rating: d.rating,
    };
  } catch {
    return null;
  }
}

// ── Team Stats ──

interface ApiTeamStats {
  matches_played?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  goals_for?: number;
  goals_against?: number;
  points?: number;
  position?: number;
  form?: string[];
  xg_for?: number;
  xg_against?: number;
}

export async function fetchTeamStats(seasonId?: string): Promise<ApiTeamStats | null> {
  try {
    const sId = seasonId ?? (await getCurrentSeasonId());
    const res = await apiFetch<ApiSingleResponse<ApiTeamStats>>(
      `/football/teams/${TEAM_ID}/stats?season_id=${sId}`,
      { revalidate: 300 },
    );
    return res.data;
  } catch {
    return null;
  }
}

// ── Exports ──

export { TEAM_ID, COMPETITION_ID };
