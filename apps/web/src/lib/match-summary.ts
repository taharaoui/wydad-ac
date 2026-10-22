import type { Lineup, LineupPlayer, Match } from '@/types';

/**
 * Key events rebuilt from per-player match stats. TheStatsAPI has no timeline for Botola,
 * so goals and cards come without a minute; substitution minutes are the replaced
 * player's minutes on the pitch (approximate).
 */
export type Side = 'home' | 'away';

export interface SummaryGoal { side: Side; player: string; count: number; assists: string[]; minute?: number; penalty?: boolean }
export interface SummaryCard { side: Side; player: string; color: 'yellow' | 'red' }
export interface SummarySub { side: Side; playerIn: string; playerOut?: string; minute?: number }

export interface MatchSummary {
  goals: SummaryGoal[];
  cards: SummaryCard[];
  subs: SummarySub[];
}

function sidePlayers(match: Match): [Side, LineupPlayer[]][] {
  return [
    ['home', match.home_lineup?.players ?? []],
    ['away', match.away_lineup?.players ?? []],
  ];
}

export function buildMatchSummary(match: Match): MatchSummary {
  const summary: MatchSummary = { goals: [], cards: [], subs: [] };

  for (const [side, players] of sidePlayers(match)) {
    const assisters = players.filter((p) => (p.stats?.assists ?? 0) > 0).map((p) => p.short_name);
    for (const p of players) {
      const s = p.stats ?? {};
      if ((s.goals ?? 0) > 0) summary.goals.push({ side, player: p.name, count: s.goals, assists: assisters });
      if ((s.red_cards ?? 0) > 0) summary.cards.push({ side, player: p.name, color: 'red' });
      else if ((s.yellow_cards ?? 0) > 0) summary.cards.push({ side, player: p.name, color: 'yellow' });
      if (!p.is_starter && (p.minutes ?? 0) > 0) {
        const out = p.replaced_player_id ? players.find((x) => x.id === p.replaced_player_id) : undefined;
        summary.subs.push({ side, playerIn: p.name, playerOut: out?.name, minute: p.substituted_in });
      }
    }
  }
  summary.subs.sort((a, b) => (a.minute ?? 99) - (b.minute ?? 99));
  return summary;
}

/** Average rating of everyone who played and got a rating, like SofaScore's team rating. */
export function teamAverageRating(lineup?: Lineup): number | null {
  const ratings = (lineup?.players ?? []).map((p) => p.rating).filter((r): r is number => r != null);
  if (ratings.length === 0) return null;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

/** W/D/L from a given team's point of view. */
export function resultFor(match: Match, teamId: string): 'W' | 'D' | 'L' | null {
  if (match.score_home == null || match.score_away == null) return null;
  const home = match.home_team.id === teamId;
  const mine = home ? match.score_home : match.score_away;
  const theirs = home ? match.score_away : match.score_home;
  return mine > theirs ? 'W' : mine < theirs ? 'L' : 'D';
}
