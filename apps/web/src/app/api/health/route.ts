import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Deployment check: is the TheStatsAPI key configured, and does the API answer from here?
 * Never returns the key itself.
 */
export async function GET() {
  const key = process.env.STATS_API_KEY;
  const base = process.env.STATS_API_BASE_URL || 'https://api.thestatsapi.com/api';
  const result: Record<string, unknown> = {
    statsApiKeyConfigured: Boolean(key),
    statsApiKeyLength: key?.length ?? 0,
    statsApiBaseUrl: base,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  };

  if (key) {
    try {
      const res = await fetch(`${base}/football/competitions/${process.env.BOTOLA_COMPETITION_ID || 'comp_30610'}`, {
        headers: { Authorization: `Bearer ${key}` },
        cache: 'no-store',
      });
      result.apiStatus = res.status;
      result.rateLimitPerMinute = res.headers.get('x-ratelimit-limit');
      result.rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
      if (!res.ok) result.apiError = (await res.text()).slice(0, 300);
    } catch (err) {
      result.apiStatus = 'network-error';
      result.apiError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
