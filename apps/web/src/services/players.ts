import type { Player, Position } from '@/types';
import { mockPlayers } from '@/lib/mock-data';
import {
  IS_MOCK,
  fetchSquad as apiFetchSquad,
  fetchPlayer as apiFetchPlayer,
  fetchPlayerStats,
  type MappedPlayer,
  type MappedPlayerStats,
} from '@/lib/stats-api';

// ── Mappers ──

function toPlayer(p: MappedPlayer, stats?: MappedPlayerStats | null): Player {
  return {
    id: p.id,
    name: p.name,
    short_name: p.short_name,
    number: p.number,
    position: p.position,
    nationality: p.nationality,
    date_of_birth: p.date_of_birth,
    height_cm: p.height_cm,
    photo_url: p.photo_url,
    stats: stats
      ? {
          appearances: stats.appearances,
          goals: stats.goals,
          assists: stats.assists,
          yellow_cards: stats.yellow_cards,
          red_cards: stats.red_cards,
          minutes_played: stats.minutes_played,
          clean_sheets: stats.clean_sheets,
        }
      : undefined,
  };
}

/** Log a warning and return mock data when the API is unreachable (e.g. during build). */
function warnFallback(label: string, err: unknown): void {
  console.warn(`[players] ${label} failed, using mock data:`, err instanceof Error ? err.message : err);
}

// ── Public API ──

export async function getSquad(): Promise<Player[]> {
  if (IS_MOCK) return mockPlayers;

  try {
    const squad = await apiFetchSquad();
    return squad.map((p) => toPlayer(p));
  } catch (err) {
    warnFallback('getSquad', err);
    return mockPlayers;
  }
}

export async function getPlayerById(id: string): Promise<Player | null> {
  if (IS_MOCK) return mockPlayers.find((p) => p.id === id) ?? null;

  try {
    const player = await apiFetchPlayer(id);
    if (!player) return null;

    // Fetch season stats alongside the profile
    const stats = await fetchPlayerStats(id);

    return toPlayer(player, stats);
  } catch (err) {
    warnFallback('getPlayerById', err);
    return mockPlayers.find((p) => p.id === id) ?? null;
  }
}

export async function getPlayersByPosition(position: Position): Promise<Player[]> {
  const squad = await getSquad();
  return squad.filter((p) => p.position === position);
}

export async function getTopScorers(limit = 5): Promise<Player[]> {
  const squad = await getSquad();
  return squad
    .filter((p) => p.stats?.goals && p.stats.goals > 0)
    .sort((a, b) => (b.stats?.goals ?? 0) - (a.stats?.goals ?? 0))
    .slice(0, limit);
}
