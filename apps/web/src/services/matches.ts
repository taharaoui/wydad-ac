import { MatchSchema, StandingRowSchema } from '@/types';
import type { Match, StandingRow } from '@/types';
import { mockMatches, mockStandings } from '@/lib/mock-data';

const API_KEY = process.env.STATS_API_KEY;
const API_BASE = process.env.STATS_API_BASE_URL || 'https://api.thestatsapi.com/v1';
const IS_MOCK = !API_KEY;

async function apiFetch<T>(path: string, schema: { parse: (data: unknown) => T }): Promise<T> {
  if (IS_MOCK) throw new Error('API not configured — use mock helpers');

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Stats API ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return schema.parse(json);
}

// ── Public API ──

export async function getMatches(): Promise<Match[]> {
  if (IS_MOCK) return mockMatches;

  // TODO: map TheStatsAPI response shape → our Match schema
  const raw = await apiFetch('/matches?team=wydad&limit=10', { parse: (d) => d as unknown[] });
  return raw.map((m) => MatchSchema.parse(m));
}

export async function getMatchById(id: string): Promise<Match | null> {
  if (IS_MOCK) return mockMatches.find((m) => m.id === id) ?? null;

  try {
    return await apiFetch(`/matches/${id}`, MatchSchema);
  } catch {
    return null;
  }
}

export async function getNextMatch(): Promise<Match | null> {
  if (IS_MOCK) {
    return mockMatches.find((m) => m.status === 'scheduled') ?? null;
  }

  const matches = await getMatches();
  return matches.find((m) => m.status === 'scheduled') ?? null;
}

export async function getLatestResult(): Promise<Match | null> {
  if (IS_MOCK) {
    return mockMatches.find((m) => m.status === 'finished') ?? null;
  }

  const matches = await getMatches();
  return [...matches].reverse().find((m) => m.status === 'finished') ?? null;
}

export async function getStandings(): Promise<StandingRow[]> {
  if (IS_MOCK) return mockStandings;

  // TODO: map TheStatsAPI standings response
  const raw = await apiFetch('/standings?competition=comp_30610', {
    parse: (d) => d as unknown[],
  });
  return raw.map((r) => StandingRowSchema.parse(r));
}
