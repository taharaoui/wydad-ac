import { clubCrestUrl, clubName, isWydad } from '@/lib/clubs';
import type {
  MappedLineup,
  MappedMatch,
  MappedMatchEvent,
  MappedMatchStats,
  MappedPlayer,
  MappedPlayerMatchStats,
  MappedPlayerStats,
  MappedStandingRow,
  MappedStatRow,
} from '@/lib/stats-api';

/**
 * Goal API client (api.goal-api.com), returning the same shapes as stats-api.ts so the site can
 * switch providers with FOOTBALL_DATA_PROVIDER=goal. Limit: 1,000 requests a day, so responses
 * are cached for at least 5 minutes (matches being played: 2 minutes).
 *
 * Team ids are translated to the TheStatsAPI ids the site already knows (crests, short names,
 * highlights lookup), so nothing downstream changes.
 */
const API_KEY = process.env.GOAL_API_KEY;
const BASE = 'https://api.goal-api.com/v1';
const BOTOLA = process.env.GOAL_BOTOLA_LEAGUE_ID || 'cmr77dw7800g9rx06v6a4zya0';
const WYDAD = process.env.GOAL_WYDAD_TEAM_ID || 'cmr7becmb0ubgrx068u8wmv4q';
/** No Espoirs (U23) team on Goal API: kept for the shared interface */
export const ESPOIR_TEAM_ID = 'tm_83439338';
export const IS_MOCK = !API_KEY;

/** Goal API team id → the site's team id (TheStatsAPI), for crests and names */
const TEAM_IDS: Record<string, string> = {
  cmr7becmb0ubgrx068u8wmv4q: 'tm_805667', // Wydad
  cmr7djfq91kufrx06cbhe6u2r: 'tm_327682', // Raja
  cmr7bedj10ujzrx061criu1jg: 'tm_029484', // AS FAR
  cmr7beddb0uivrx06g13tmmde: 'tm_4560072', // RS Berkane
  cmri4p62hczfqlb07cciqm48h: 'tm_446779', // MAS Fès
  cmri4p62jczfslb074yox7kff: 'tm_773999', // Hassania Agadir
  cmri4p62gczfplb072i1nk00o: 'tm_602409', // Kawkab Marrakech
  cmri4p62iczfrlb07sikb5pwc: 'tm_446704', // CODM Meknès
  cmri4p62eczfnlb07pkeppld5: 'tm_1309697', // Ittihad Tanger
  cmri4p62fczfolb0747wmjupa: 'tm_0178775', // Union Touarga
  cmri4p62xczfwlb07e60dqz81: 'tm_551225', // Difaâ El Jadida
  cmri4p62sczfulb07aekju0f2: 'tm_337870', // FUS Rabat
  cmri4p631czfylb07vfk561e3: 'tm_5227823', // Renaissance Zemamra
  cmri4p63nczgelb07oi8yp4so: 'tm_4629780', // Amal Tiznit
  cmtwihhsk5e9mqs07o9zs038t: 'tm_773955', // Moghreb Tétouan
  cmri4p63lczgclb079zs4ytri: 'tm_9816777', // Widad Temara
};
const siteTeamId = (goalId: string) => TEAM_IDS[goalId] ?? goalId;
const goalTeamId = (siteId: string) => Object.entries(TEAM_IDS).find(([, s]) => s === siteId)?.[0] ?? siteId;

export function isWydadTeam(teamId: string): boolean {
  return teamId === WYDAD || isWydad(teamId);
}

async function goal<T>(path: string, revalidate = 300): Promise<T> {
  if (!API_KEY) throw new Error('GOAL_API_KEY is not set');
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${API_KEY}` }, next: { revalidate, tags: ['goal-api'] } });
  if (!res.ok) throw new Error(`Goal API ${res.status} on ${path}`);
  // Same rule as TheStatsAPI: the club is "Wydad Athletic Club", never "Wydad Casablanca"
  return JSON.parse(clubName(await res.text())) as T;
}

// ── Fixtures ──

interface GoalFixture {
  id: string;
  leagueId: string;
  leagueName: string;
  leagueYear: string;
  kickoffUtc: string;
  matchStatus: string;
  matchLive: string;
  matchElapsed: string | null;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamScore: string | null;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamScore: string | null;
  homeTeamSystem: string | null;
  awayTeamSystem: string | null;
  matchRound: string | null;
  matchStadium: string | null;
  matchReferee: string | null;
  teamHomeBadge?: string;
  teamAwayBadge?: string;
}

const STATUS: Record<string, MappedMatch['status']> = {
  SCHEDULED: 'scheduled',
  NOT_STARTED: 'scheduled',
  LIVE: 'live',
  IN_PLAY: 'live',
  HALFTIME: 'live',
  HALF_TIME: 'live',
  FINISHED: 'finished',
  POSTPONED: 'postponed',
  CANCELLED: 'cancelled',
  CANCELED: 'cancelled',
};
const num = (v: string | null | undefined) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));

function team(id: string, name: string, badge?: string): MappedMatch['home_team'] {
  const siteId = siteTeamId(id);
  return { id: siteId, name, short_name: name.slice(0, 3).toUpperCase(), logo_url: clubCrestUrl(siteId, name) ?? badge };
}

function mapFixture(f: GoalFixture): MappedMatch {
  const status = STATUS[f.matchStatus?.toUpperCase()] ?? (f.matchLive === '1' ? 'live' : 'scheduled');
  // League names come as "Botola Pro" or "Botola Pro - Botola Pro"
  const league = f.leagueName.split(' - ')[0];
  return {
    id: f.id,
    competition: { id: f.leagueId === BOTOLA ? 'comp_30610' : f.leagueId, name: league, short_name: league, country: 'Morocco' },
    home_team: team(f.homeTeamId, f.homeTeamName, f.teamHomeBadge),
    away_team: team(f.awayTeamId, f.awayTeamName, f.teamAwayBadge),
    status,
    kickoff: f.kickoffUtc,
    venue: f.matchStadium ?? undefined,
    matchday: num(f.matchRound) ?? undefined,
    score_home: status === 'scheduled' ? null : num(f.homeTeamScore),
    score_away: status === 'scheduled' ? null : num(f.awayTeamScore),
    minute: status === 'live' ? num(f.matchElapsed) : null,
  };
}

async function teamFixtures(teamId: string): Promise<GoalFixture[]> {
  const res = await goal<{ data: GoalFixture[] }>(`/teams/${goalTeamId(teamId)}/fixtures?limit=100`, 300);
  return res.data;
}

/** Botola seasons, most recent first ("2026/2027", "2025/2026") */
export async function getSeasonIds(count: number): Promise<string[]> {
  const fixtures = await teamFixtures(WYDAD);
  return [...new Set(fixtures.filter((f) => /botola/i.test(f.leagueName)).map((f) => f.leagueYear))].sort().reverse().slice(0, count);
}

export async function getCurrentSeasonId(): Promise<string> {
  return (await getSeasonIds(1))[0] ?? '2026/2027';
}

export async function fetchMatches(options?: { teamId?: string; status?: string; limit?: number; sort?: string; dateFrom?: string; dateTo?: string }): Promise<MappedMatch[]> {
  const fixtures = (await teamFixtures(options?.teamId ?? WYDAD)).map(mapFixture);
  const ascending = options?.sort === 'utc_date';
  return fixtures
    .filter((m) => !options?.status || m.status === options.status)
    .filter((m) => !options?.dateFrom || m.kickoff.slice(0, 10) >= options.dateFrom)
    .filter((m) => !options?.dateTo || m.kickoff.slice(0, 10) <= options.dateTo)
    .sort((a, b) => (ascending ? a.kickoff.localeCompare(b.kickoff) : b.kickoff.localeCompare(a.kickoff)))
    .slice(0, options?.limit ?? 20);
}

/** Wydad's Botola matches of a season (season = "2026/2027") */
export async function fetchSeasonMatches(seasonId: string): Promise<MappedMatch[]> {
  const fixtures = await teamFixtures(WYDAD);
  return fixtures
    .filter((f) => /botola/i.test(f.leagueName) && f.leagueYear === seasonId)
    .map(mapFixture)
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));
}

interface GoalFixtureDetail extends GoalFixture {
  events?: GoalEvent[];
  cards?: GoalCard[];
  substitutions?: GoalSub[];
}

/** A match being played is re-read every 2 minutes, others every 10 */
async function fixtureDetail(matchId: string): Promise<GoalFixtureDetail | null> {
  if (!/^[a-z0-9]{20,30}$/.test(matchId)) return null;
  try {
    return (await goal<{ data: GoalFixtureDetail }>(`/fixtures/${matchId}`, 120)).data;
  } catch {
    return null;
  }
}

export async function fetchMatch(matchId: string): Promise<MappedMatch | null> {
  const f = await fixtureDetail(matchId);
  return f ? mapFixture(f) : null;
}

/** Referee as published with the fixture (e.g. "H. Temsamani") */
export async function fetchMatchReferee(matchId: string): Promise<string | null> {
  return (await fixtureDetail(matchId))?.matchReferee ?? null;
}

// ── Timeline ──

interface GoalEvent {
  id: string;
  time: string;
  type: string;
  homeScorer: string | null;
  awayScorer: string | null;
  homeAssist?: string | null;
  awayAssist?: string | null;
  info: string | null;
}
interface GoalCard {
  id?: string;
  time: string;
  homeFault: string | null;
  awayFault: string | null;
  card: string;
}
interface GoalSub {
  id: string;
  time: string;
  substitution: string;
  substitutionPlayerId?: string;
  team: 'home' | 'away';
}

/** "45+4" → minute 45, added 4 */
function minuteOf(time: string): { minute: number; added_time?: number } {
  const [m, plus] = String(time).split('+').map((x) => parseInt(x, 10));
  return { minute: Number.isFinite(m) ? m : 0, added_time: Number.isFinite(plus) ? plus : undefined };
}

export async function fetchMatchTimeline(matchId: string): Promise<MappedMatchEvent[]> {
  const f = await fixtureDetail(matchId);
  if (!f) return [];
  const homeId = siteTeamId(f.homeTeamId);
  const awayId = siteTeamId(f.awayTeamId);
  const events: MappedMatchEvent[] = [];
  for (const e of f.events ?? []) {
    if (!/goal/i.test(e.type)) continue;
    const home = !!e.homeScorer;
    const info = (e.info ?? '').toLowerCase();
    events.push({
      id: e.id,
      type: info.includes('own') ? 'own_goal' : info.includes('penalty') ? 'penalty_scored' : 'goal',
      ...minuteOf(e.time),
      player_name: (home ? e.homeScorer : e.awayScorer) ?? '',
      assist_name: (home ? e.homeAssist : e.awayAssist) || undefined,
      team_id: home ? homeId : awayId,
    });
  }
  (f.cards ?? []).forEach((c, i) => {
    const home = !!c.homeFault;
    events.push({
      id: c.id ?? `card-${i}`,
      type: /red/i.test(c.card) ? 'red_card' : 'yellow_card',
      ...minuteOf(c.time),
      player_name: (home ? c.homeFault : c.awayFault) ?? '',
      team_id: home ? homeId : awayId,
    });
  });
  for (const s of f.substitutions ?? []) {
    const [out, inn] = s.substitution.split('|').map((x) => x.trim());
    events.push({ id: s.id, type: 'substitution', ...minuteOf(s.time), player_name: inn ?? '', assist_name: out, team_id: s.team === 'home' ? homeId : awayId });
  }
  return events.sort((a, b) => a.minute - b.minute || (a.added_time ?? 0) - (b.added_time ?? 0));
}

// ── Statistics ──

/** Goal API stat names → the site's stat keys and groups */
const STATS: Record<string, { key: string; group: 'overview' | 'shots' | 'attack' | 'defending' }> = {
  'Ball Possession': { key: 'ball_possession', group: 'overview' },
  Corners: { key: 'corner_kicks', group: 'overview' },
  'Yellow Cards': { key: 'yellow_cards', group: 'overview' },
  'Red Cards': { key: 'red_cards', group: 'overview' },
  'Shots Total': { key: 'total_shots', group: 'shots' },
  'On Target': { key: 'shots_on_target', group: 'shots' },
  'Off Target': { key: 'shots_off_target', group: 'shots' },
  'Shots Blocked': { key: 'blocked_shots', group: 'shots' },
  'Shots Inside Box': { key: 'shots_inside_box', group: 'shots' },
  Attacks: { key: 'attacks', group: 'attack' },
  'Dangerous Attacks': { key: 'dangerous_attacks', group: 'attack' },
  'Free Kick': { key: 'free_kicks', group: 'attack' },
  Offsides: { key: 'offsides', group: 'attack' },
  Fouls: { key: 'fouls', group: 'defending' },
};

export async function fetchMatchStats(matchId: string): Promise<MappedMatchStats | null> {
  try {
    const res = await goal<{ data: { match?: { fullTime?: { type: string; home: string; away: string }[] } } }>(`/fixtures/${matchId}/statistics`, 300);
    const groups = new Map<string, MappedStatRow[]>();
    const seen = new Set<string>();
    for (const s of res.data.match?.fullTime ?? []) {
      const def = STATS[s.type];
      const home = parseFloat(String(s.home).replace('%', ''));
      const away = parseFloat(String(s.away).replace('%', ''));
      // Skip unknown, empty and duplicate rows ("Ball Possession" comes twice, the second empty)
      if (!def || !Number.isFinite(home) || !Number.isFinite(away) || seen.has(def.key)) continue;
      seen.add(def.key);
      groups.set(def.group, [...(groups.get(def.group) ?? []), { key: def.key, home, away, unit: def.key === 'ball_possession' ? 'percent' : 'count' }]);
    }
    const list = ['overview', 'shots', 'attack', 'defending'].filter((g) => groups.has(g)).map((g) => ({ key: g, rows: groups.get(g)! }));
    return list.length ? { groups: list } : null;
  } catch {
    return null;
  }
}

// ── Lineups ──

interface GoalLineupPlayer {
  playerId: string | null;
  playerKey: string | null;
  lineupPlayer: string;
  lineupNumber: string;
  lineupPosition: string;
  playerPosition?: string | null;
}

const POSITION: Record<string, MappedPlayer['position']> = { goalkeepers: 'goalkeeper', defenders: 'defender', midfielders: 'midfielder', forwards: 'forward' };

/** Position from the player's role, else from his slot in the formation (1 = keeper) */
function positionOf(p: GoalLineupPlayer, formation: string): MappedPlayer['position'] {
  const known = POSITION[(p.playerPosition ?? '').toLowerCase()];
  if (known) return known;
  const slot = parseInt(p.lineupPosition, 10);
  if (slot === 1 || !Number.isFinite(slot)) return slot === 1 ? 'goalkeeper' : 'midfielder';
  const lines = formation.split('-').map(Number).filter((n) => n > 0);
  if (lines.length < 2) return slot <= 5 ? 'defender' : slot <= 9 ? 'midfielder' : 'forward';
  let edge = 1;
  for (let i = 0; i < lines.length; i++) {
    edge += lines[i];
    if (slot <= edge) return i === 0 ? 'defender' : i === lines.length - 1 ? 'forward' : 'midfielder';
  }
  return 'forward';
}

export async function fetchMatchLineups(matchId: string): Promise<{ home: MappedLineup; away: MappedLineup } | null> {
  try {
    const [res, f] = await Promise.all([
      goal<{ data: { home: { startingLineups: GoalLineupPlayer[]; substitutes: GoalLineupPlayer[] }; away: { startingLineups: GoalLineupPlayer[]; substitutes: GoalLineupPlayer[] } } }>(`/fixtures/${matchId}/lineups`, 300),
      fixtureDetail(matchId),
    ]);
    const side = (s: { startingLineups: GoalLineupPlayer[]; substitutes: GoalLineupPlayer[] }, formation: string): MappedLineup => ({
      formation,
      players: [
        ...s.startingLineups.map((p) => ({ p, starter: true })),
        ...(s.substitutes ?? []).map((p) => ({ p, starter: false })),
      ].map(({ p, starter }) => ({
        id: p.playerKey ?? p.playerId ?? p.lineupPlayer,
        name: p.lineupPlayer,
        short_name: p.lineupPlayer,
        number: num(p.lineupNumber) ?? 0,
        position: positionOf(p, formation),
        is_starter: starter,
      })),
    });
    if (!res.data.home?.startingLineups?.length || !res.data.away?.startingLineups?.length) return null;
    return { home: side(res.data.home, f?.homeTeamSystem ?? ''), away: side(res.data.away, f?.awayTeamSystem ?? '') };
  } catch {
    return null;
  }
}

/** No ratings on Goal API; substitutions give who replaced whom */
export async function fetchMatchPlayerStats(matchId: string): Promise<MappedPlayerMatchStats[]> {
  const f = await fixtureDetail(matchId);
  if (!f) return [];
  const out: MappedPlayerMatchStats[] = [];
  for (const s of f.substitutions ?? []) {
    const [outId, inId] = (s.substitutionPlayerId ?? '').split('|').map((x) => x.trim());
    if (!outId || !inId) continue;
    const teamId = siteTeamId(s.team === 'home' ? f.homeTeamId : f.awayTeamId);
    const minute = minuteOf(s.time).minute;
    out.push({ player_id: outId, team_id: teamId, rating: null, minutes: minute, replaced_by: inId, replaced: null, stats: {} });
    out.push({ player_id: inId, team_id: teamId, rating: null, minutes: Math.max(0, 90 - minute), replaced_by: null, replaced: outId, stats: {} });
  }
  return out;
}

// ── Standings ──

interface GoalStanding {
  teamId: string;
  teamName: string;
  overallLeaguePosition: string;
  overallLeaguePlayed: string;
  overallLeagueW: string;
  overallLeagueD: string;
  overallLeagueL: string;
  overallLeagueGF: string;
  overallLeagueGA: string;
  overallLeaguePTS: string;
  team?: { badge?: string };
}

export async function fetchStandings(): Promise<MappedStandingRow[]> {
  const res = await goal<{ data: GoalStanding[] }>(`/leagues/${BOTOLA}/standings`, 600);
  return res.data
    .map((r) => {
      const gf = num(r.overallLeagueGF) ?? 0;
      const ga = num(r.overallLeagueGA) ?? 0;
      return {
        position: num(r.overallLeaguePosition) ?? 0,
        team: team(r.teamId, r.teamName, r.team?.badge),
        played: num(r.overallLeaguePlayed) ?? 0,
        won: num(r.overallLeagueW) ?? 0,
        drawn: num(r.overallLeagueD) ?? 0,
        lost: num(r.overallLeagueL) ?? 0,
        goals_for: gf,
        goals_against: ga,
        goal_difference: gf - ga,
        points: num(r.overallLeaguePTS) ?? 0,
      };
    })
    .sort((a, b) => a.position - b.position);
}

// ── Players ──

interface GoalPlayer {
  id: string;
  name: string;
  image: string | null;
  number: string | null;
  type: string | null;
  birthdate: string | null;
  country: string | null;
  isActive: boolean;
  matchPlayed?: string | null;
  goals?: string | null;
  assists?: string | null;
  yellowCards?: string | null;
  redCards?: string | null;
  minutes?: string | null;
  rating?: string | null;
}

function mapPlayer(p: GoalPlayer): MappedPlayer {
  return {
    id: p.id,
    name: p.name,
    short_name: p.name,
    number: num(p.number) || null,
    position: POSITION[(p.type ?? '').toLowerCase()] ?? 'midfielder',
    nationality: p.country ?? '',
    date_of_birth: p.birthdate ?? '',
    photo_url: p.image ?? undefined,
  };
}

async function squadRaw(teamId: string): Promise<GoalPlayer[]> {
  // No Espoirs team on Goal API
  if (teamId === ESPOIR_TEAM_ID) return [];
  const res = await goal<{ data: GoalPlayer[] }>(`/teams/${goalTeamId(teamId)}/players`, 3600);
  // Players without a role are former or unconfirmed squad members
  return res.data.filter((p) => p.isActive && p.type);
}

export async function fetchSquad(teamId: string = WYDAD): Promise<MappedPlayer[]> {
  return (await squadRaw(teamId)).map(mapPlayer);
}

export async function fetchPlayer(playerId: string): Promise<MappedPlayer | null> {
  try {
    return mapPlayer((await goal<{ data: GoalPlayer }>(`/players/${playerId}`, 3600)).data);
  } catch {
    return null;
  }
}

export async function fetchPlayerStats(playerId: string): Promise<MappedPlayerStats | null> {
  try {
    const p = (await goal<{ data: GoalPlayer }>(`/players/${playerId}`, 3600)).data;
    return {
      appearances: num(p.matchPlayed) ?? 0,
      goals: num(p.goals) ?? 0,
      assists: num(p.assists) ?? 0,
      yellow_cards: num(p.yellowCards) ?? 0,
      red_cards: num(p.redCards) ?? 0,
      minutes_played: num(p.minutes) ?? 0,
      rating: num(p.rating) ?? undefined,
    };
  } catch {
    return null;
  }
}
