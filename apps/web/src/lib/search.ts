/**
 * Site search integration point. The header builds a small index on the server (pages, squad,
 * recent news) and filters it in the browser. To plug in a search service, replace `searchSite`
 * with a call to it and keep the `SearchEntry` shape.
 */

export type SearchKind = 'page' | 'player' | 'news';

export interface SearchEntry {
  kind: SearchKind;
  label: string;
  href: string;
  meta?: string;
}

export const SEARCH_GROUPS: SearchKind[] = ['page', 'player', 'news'];
const LIMIT: Record<SearchKind, number> = { page: 8, player: 6, news: 6 };

/** Case- and accent-insensitive ("Équipe" matches "equipe") */
const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Matches grouped as pages, players, news. An empty query lists the main pages. */
export function searchSite(index: SearchEntry[], query: string): SearchEntry[] {
  const q = normalize(query.trim());
  const hits = q ? index.filter((e) => normalize(`${e.label} ${e.meta ?? ''}`).includes(q)) : index.filter((e) => e.kind === 'page');
  return SEARCH_GROUPS.flatMap((kind) => hits.filter((e) => e.kind === kind).slice(0, LIMIT[kind]));
}
