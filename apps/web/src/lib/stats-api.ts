/**
 * TheStatsAPI client for Wydad AC website.
 *
 * Handles all communication with https://api.thestatsapi.com/api
 * and maps responses to our internal Zod-validated types.
 */

const API_KEY = process.env.STATS_API_KEY;
const API_BASE = process.env.STATS_API_BASE_URL || 'https://api.thestatsapi.com/api';
const TEAM_ID = process.env.WYDAD_TEAM_ID || 'tm_805667';
const COMPETITION_ID = process.env.BOTOLA_COMPETITION_ID || 'comp_30610';

export const IS_MOCK = !API_KEY;

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

async function apiFetch<T>(
  path: string,
  options?: { revalidate?: number },
): Promise<T> {
  const url = `${API_BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      next: { revalidate: options?.revalidate ?? 60 },
    });
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

  return res.json() as Promise<T>;
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
  competition: ApiCompetitionRef;
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
}

function mapTeam(t: ApiTeamRef): MappedMatch['home_team'] {
  return {
    id: t.id,
    name: t.name,
    short_name: t.short_name || t.name.slice(0, 3).toUpperCase(),
    logo_url: t.logo_url,
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

function mapMatch(m: ApiMatch): MappedMatch {
  // TheStatsAPI may put scores in different fields
  const scoreHome = m.home_score ?? (m as Record<string, unknown>).score_home ?? null;
  const scoreAway = m.away_score ?? (m as Record<string, unknown>).score_away ?? null;

  return {
    id: m.id,
    competition: mapCompetition(m.competition),
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
  };
}

/**
 * Fetch Wydad matches, newest first by default.
 */
export async function fetchMatches(options?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  sort?: string;
}): Promise<MappedMatch[]> {
  const params = new URLSearchParams({
    team_id: TEAM_ID,
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

  return res.data.map(mapMatch);
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
    return mapMatch(res.data);
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
    const res = await apiFetch<ApiListResponse<ApiMatchEvent>>(
      `/football/matches/${matchId}/timeline`,
      { revalidate: 120 },
    );
    return res.data.map(mapEvent);
  } catch {
    return [];
  }
}

// ── Match Stats ──

interface ApiMatchStats {
  [key: string]: unknown;
}

export interface MappedMatchStats {
  possession_home: number;
  possession_away: number;
  shots_home: number;
  shots_away: number;
  shots_on_target_home: number;
  shots_on_target_away: number;
  corners_home: number;
  corners_away: number;
  fouls_home: number;
  fouls_away: number;
  offsides_home: number;
  offsides_away: number;
}

export async function fetchMatchStats(matchId: string): Promise<MappedMatchStats | null> {
  try {
    const res = await apiFetch<ApiSingleResponse<ApiMatchStats>>(
      `/football/matches/${matchId}/stats`,
      { revalidate: 300 },
    );
    const d = res.data;

    // TheStatsAPI returns stats keyed by team; we need to extract home/away
    // The shape may be { home: {...}, away: {...} } or flat
    const home = (d.home ?? d) as Record<string, unknown>;
    const away = (d.away ?? d) as Record<string, unknown>;

    return {
      possession_home: Number(home.possession ?? 50),
      possession_away: Number(away.possession ?? 50),
      shots_home: Number(home.shots ?? home.total_shots ?? 0),
      shots_away: Number(away.shots ?? away.total_shots ?? 0),
      shots_on_target_home: Number(home.shots_on_target ?? 0),
      shots_on_target_away: Number(away.shots_on_target ?? 0),
      corners_home: Number(home.corners ?? home.corner_kicks ?? 0),
      corners_away: Number(away.corners ?? away.corner_kicks ?? 0),
      fouls_home: Number(home.fouls ?? home.fouls_committed ?? 0),
      fouls_away: Number(away.fouls ?? away.fouls_committed ?? 0),
      offsides_home: Number(home.offsides ?? 0),
      offsides_away: Number(away.offsides ?? 0),
    };
  } catch {
    return null;
  }
}

// ── Lineups ──

interface ApiLineupPlayer {
  id: string;
  name: string;
  short_name?: string;
  shirt_number?: number;
  position?: string;
  is_starter?: boolean;
  is_captain?: boolean;
}

interface ApiLineup {
  formation?: string;
  players?: ApiLineupPlayer[];
  home?: { formation?: string; players?: ApiLineupPlayer[] };
  away?: { formation?: string; players?: ApiLineupPlayer[] };
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

function mapLineupSide(side: { formation?: string; players?: ApiLineupPlayer[] }): MappedLineup {
  return {
    formation: side.formation ?? '4-3-3',
    players: (side.players ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      short_name: p.short_name ?? p.name.split(' ').pop() ?? p.name,
      number: p.shirt_number ?? 0,
      position: mapPosition(p.position),
      is_starter: p.is_starter ?? true,
      is_captain: p.is_captain,
    })),
  };
}

export async function fetchMatchLineups(
  matchId: string,
): Promise<{ home: MappedLineup; away: MappedLineup } | null> {
  try {
    const res = await apiFetch<ApiSingleResponse<ApiLineup>>(
      `/football/matches/${matchId}/lineups`,
      { revalidate: 300 },
    );
    const d = res.data;

    if (d.home && d.away) {
      return { home: mapLineupSide(d.home), away: mapLineupSide(d.away) };
    }

    // Fallback: single lineup object
    return null;
  } catch {
    return null;
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

export async function fetchSquad(): Promise<MappedPlayer[]> {
  const res = await apiFetch<ApiListResponse<ApiPlayer>>(
    `/football/teams/${TEAM_ID}/players`,
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
