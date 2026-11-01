import * as statsApi from './stats-api';
import * as goalApi from './goal-api';

/**
 * Football data provider, chosen by FOOTBALL_DATA_PROVIDER: "thestatsapi" (default) or "goal"
 * (Goal API, needs GOAL_API_KEY). Both return the same shapes, so services and pages don't change.
 */
export const PROVIDER = process.env.FOOTBALL_DATA_PROVIDER === 'goal' ? 'goal' : 'thestatsapi';
const p = PROVIDER === 'goal' ? goalApi : statsApi;

export type {
  MappedMatch,
  MappedMatchEvent,
  MappedMatchStats,
  MappedStandingRow,
  MappedLineup,
  MappedPlayerMatchStats,
  MappedPlayer,
  MappedPlayerStats,
} from './stats-api';

export const IS_MOCK = p.IS_MOCK;
export const ESPOIR_TEAM_ID = p.ESPOIR_TEAM_ID;
export const isWydadTeam = (teamId: string) => p.isWydadTeam(teamId);
export const getSeasonIds = (count: number) => p.getSeasonIds(count);
export const getCurrentSeasonId = () => p.getCurrentSeasonId();
export const fetchMatches: typeof statsApi.fetchMatches = (options) => p.fetchMatches(options);
export const fetchSeasonMatches: typeof statsApi.fetchSeasonMatches = (seasonId, options) => p.fetchSeasonMatches(seasonId, options);
export const fetchMatch = (matchId: string) => p.fetchMatch(matchId);
export const fetchMatchTimeline = (matchId: string) => p.fetchMatchTimeline(matchId);
export const fetchMatchStats = (matchId: string) => p.fetchMatchStats(matchId);
export const fetchMatchLineups = (matchId: string) => p.fetchMatchLineups(matchId);
export const fetchMatchPlayerStats = (matchId: string) => p.fetchMatchPlayerStats(matchId);
export const fetchStandings = () => p.fetchStandings();
export const fetchSquad = (teamId?: string) => p.fetchSquad(teamId);
export const fetchPlayer = (playerId: string) => p.fetchPlayer(playerId);
/** Referee of a match when the provider publishes it (Goal API) */
export const fetchMatchReferee = (matchId: string): Promise<string | null> => (PROVIDER === 'goal' ? goalApi.fetchMatchReferee(matchId) : Promise.resolve(null));
export const fetchPlayerStats = (playerId: string, seasonId?: string) => p.fetchPlayerStats(playerId, seasonId);
