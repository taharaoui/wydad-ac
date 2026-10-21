import { z } from 'zod';

// ── Competition ──
export const CompetitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  short_name: z.string(),
  country: z.string(),
  logo_url: z.string().optional(),
});
export type Competition = z.infer<typeof CompetitionSchema>;

// ── Team ──
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  short_name: z.string(),
  logo_url: z.string().optional(),
});
export type Team = z.infer<typeof TeamSchema>;

// ── Match Event ──
export const MatchEventSchema = z.object({
  id: z.string(),
  type: z.enum(['goal', 'yellow_card', 'red_card', 'substitution', 'penalty_scored', 'penalty_missed', 'own_goal', 'var']),
  minute: z.number(),
  added_time: z.number().optional(),
  player_name: z.string(),
  assist_name: z.string().optional(),
  team_id: z.string(),
});
export type MatchEvent = z.infer<typeof MatchEventSchema>;

// ── Match Stats ──
export const MatchStatsSchema = z.object({
  possession_home: z.number(),
  possession_away: z.number(),
  shots_home: z.number(),
  shots_away: z.number(),
  shots_on_target_home: z.number(),
  shots_on_target_away: z.number(),
  corners_home: z.number(),
  corners_away: z.number(),
  fouls_home: z.number(),
  fouls_away: z.number(),
  offsides_home: z.number(),
  offsides_away: z.number(),
});
export type MatchStats = z.infer<typeof MatchStatsSchema>;

// ── Lineup Player ──
export const LineupPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  short_name: z.string(),
  number: z.number(),
  position: z.enum(['goalkeeper', 'defender', 'midfielder', 'forward']),
  is_starter: z.boolean(),
  is_captain: z.boolean().optional(),
  substituted_in: z.number().optional(),
  substituted_out: z.number().optional(),
  rating: z.number().optional(),
});
export type LineupPlayer = z.infer<typeof LineupPlayerSchema>;

// ── Lineup ──
export const LineupSchema = z.object({
  formation: z.string(), // e.g. "4-3-3"
  players: z.array(LineupPlayerSchema),
});
export type Lineup = z.infer<typeof LineupSchema>;

// ── Match ──
export const MatchStatusEnum = z.enum(['scheduled', 'live', 'finished', 'postponed', 'cancelled']);
export type MatchStatus = z.infer<typeof MatchStatusEnum>;

export const MatchSchema = z.object({
  id: z.string(),
  competition: CompetitionSchema,
  home_team: TeamSchema,
  away_team: TeamSchema,
  status: MatchStatusEnum,
  kickoff: z.string(), // ISO datetime
  venue: z.string().optional(),
  matchday: z.number().optional(),
  score_home: z.number().nullable(),
  score_away: z.number().nullable(),
  minute: z.number().nullable(), // current minute if live
  events: z.array(MatchEventSchema).optional(),
  stats: MatchStatsSchema.optional(),
  home_lineup: LineupSchema.optional(),
  away_lineup: LineupSchema.optional(),
});
export type Match = z.infer<typeof MatchSchema>;

// ── Standing Row ──
export const StandingRowSchema = z.object({
  position: z.number(),
  team: TeamSchema,
  played: z.number(),
  won: z.number(),
  drawn: z.number(),
  lost: z.number(),
  goals_for: z.number(),
  goals_against: z.number(),
  goal_difference: z.number(),
  points: z.number(),
  form: z.array(z.enum(['W', 'D', 'L'])).optional(),
});
export type StandingRow = z.infer<typeof StandingRowSchema>;
