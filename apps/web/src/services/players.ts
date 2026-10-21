import { PlayerSchema } from '@/types';
import type { Player, Position } from '@/types';
import { mockPlayers } from '@/lib/mock-data';

const API_KEY = process.env.STATS_API_KEY;
const API_BASE = process.env.STATS_API_BASE_URL || 'https://api.thestatsapi.com/v1';
const IS_MOCK = !API_KEY;

// ── Public API ──

export async function getSquad(): Promise<Player[]> {
  if (IS_MOCK) return mockPlayers;

  const res = await fetch(`${API_BASE}/teams/wydad/players`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    next: { revalidate: 3600 }, // squad changes rarely
  });

  if (!res.ok) throw new Error(`Stats API ${res.status}`);
  const json = await res.json();
  return (json as unknown[]).map((p) => PlayerSchema.parse(p));
}

export async function getPlayerById(id: string): Promise<Player | null> {
  if (IS_MOCK) return mockPlayers.find((p) => p.id === id) ?? null;

  try {
    const res = await fetch(`${API_BASE}/players/${id}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return PlayerSchema.parse(await res.json());
  } catch {
    return null;
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
