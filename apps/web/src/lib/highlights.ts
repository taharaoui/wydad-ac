/**
 * Official SNRT / Arryadia highlight videos, by match id → YouTube video id.
 * Add an entry once Arryadia publishes the highlights, e.g.:
 *   mt_982177608: 'dQw4w9WgXcQ',
 * Matches without an entry link to a YouTube search for Arryadia's highlights of that fixture.
 */
export const MATCH_HIGHLIGHTS: Record<string, string> = {};

export function highlightsSearchUrl(home: string, away: string): string {
  const q = `Arryadia ${home} ${away} Botola Pro`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}
