import type { Lineup, LineupPlayer } from '@/types';

/** SofaScore-style rating colour bands. */
export function ratingColor(rating: number): string {
  if (rating >= 9) return '#374df5';
  if (rating >= 8) return '#00adc4';
  if (rating >= 7) return '#00c424';
  if (rating >= 6.5) return '#d9af00';
  if (rating >= 6) return '#ed7e07';
  return '#dc0c00';
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/** Highest-rated player across both lineups, or null when the match has no ratings. */
export function getPlayerOfTheMatch(
  home: Lineup | undefined,
  away: Lineup | undefined,
): { player: LineupPlayer; side: 'home' | 'away' } | null {
  let best: { player: LineupPlayer; side: 'home' | 'away' } | null = null;
  for (const [side, lineup] of [['home', home], ['away', away]] as const) {
    for (const player of lineup?.players ?? []) {
      if (player.rating == null) continue;
      if (!best || player.rating > best.player.rating!) best = { player, side };
    }
  }
  return best;
}
