import 'server-only';
import type { Match } from '@/types';
import type { Tables } from '@/types/database';
import { STAFF, STAFF_PHOTOS, type StaffCategory, type StaffMember } from '@/lib/staff';
import { BASKETBALL_FIXTURES, BASKETBALL_TICKETS, DISLOG_LEAGUE } from '@/lib/basketball';
import { MATCH_NOTES, type MatchNote } from '@/lib/match-notes';
import { getSection, type SectionKey } from '@/lib/sections';
import { cmsRead, unwrap } from './read';
import { asL10n, full, pick } from './l10n';

// ── Staff ──

/** Published staff of a squad, head coach first (first_team = men's football) */
export async function getStaff(squad = 'first_team'): Promise<StaffMember[]> {
  return cmsRead('staff_members', squad === 'first_team' ? STAFF : [], async (db) => {
    const rows = unwrap(await db.from('staff_members').select('*').eq('squad', squad).order('is_head', { ascending: false }).order('sort')) ?? [];
    return rows.map((r) => ({
      name: r.name,
      name_ar: r.name_ar ?? undefined,
      role: full(r.role),
      category: r.category as StaffCategory,
      head: r.is_head,
      nationality: r.nationality ? full(r.nationality) : undefined,
      photo: r.photo_url ?? undefined,
      statement: r.statement_url ?? undefined,
    }));
  });
}

// ── Galleries ──

export interface GalleryImage {
  src: string;
  width?: number;
  height?: number;
  caption?: string;
}

const BUNDLED_GALLERIES: Record<string, GalleryImage[]> = {
  'staff-first-team': STAFF_PHOTOS,
  'swimming-archives': (getSection('swimming')?.gallery?.images ?? []).map((src) => ({ src })),
};

/** Photos of a published gallery, in order (empty when the gallery is a draft or doesn't exist) */
export async function getGallery(slug: string, locale: string): Promise<GalleryImage[]> {
  return cmsRead('galleries', BUNDLED_GALLERIES[slug] ?? [], async (db) => {
    const gallery = unwrap(await db.from('galleries').select('id').eq('slug', slug).maybeSingle());
    if (!gallery) return [];
    const items = unwrap(await db.from('gallery_items').select('*').eq('gallery_id', gallery.id).order('sort')) ?? [];
    return items.map((i) => ({ src: i.image_url, width: i.width ?? undefined, height: i.height ?? undefined, caption: pick(i.caption, locale) || undefined }));
  });
}

// ── Fixtures no feed covers (basketball…) ──

export interface ManualFixtures {
  matches: Match[];
  /** Ticket page by match id */
  tickets: Record<string, string>;
}

/** Published fixtures of a sport from the CMS matches table */
export async function getManualFixtures(sport: 'basketball'): Promise<ManualFixtures> {
  return cmsRead<ManualFixtures>('matches', { matches: BASKETBALL_FIXTURES, tickets: BASKETBALL_TICKETS }, async (db) => {
    const rows = unwrap(await db.from('matches').select('*').eq('sport', sport).order('kickoff')) ?? [];
    if (rows.length === 0) return { matches: [], tickets: {} };
    const ids = (key: 'competition_id' | 'home_team_id' | 'away_team_id') => [...new Set(rows.map((r) => r[key]))];
    const [competitions, teams] = await Promise.all([
      db.from('competitions').select('*').in('id', ids('competition_id')).then(unwrap),
      db.from('teams').select('*').in('id', [...ids('home_team_id'), ...ids('away_team_id')]).then(unwrap),
    ]);
    const comp = new Map((competitions ?? []).map((c) => [c.id, c]));
    const team = new Map((teams ?? []).map((t) => [t.id, t]));
    const toTeam = (id: string) => {
      const t = team.get(id) as Tables<'teams'> | undefined;
      // Crests are looked up by the club's TheStatsAPI id, shared with football
      return { id: t?.external_id ?? t?.slug ?? id, name: t?.name ?? '', short_name: t?.short_name ?? t?.name ?? '', logo_url: t?.logo_url ?? undefined };
    };
    const matches: Match[] = rows.map((r) => {
      const c = comp.get(r.competition_id);
      return {
        id: r.slug,
        sport: r.sport === 'basketball' ? 'basketball' : 'football',
        competition: c ? { id: c.slug, name: c.name, short_name: c.short_name ?? c.name, country: 'Morocco' } : DISLOG_LEAGUE,
        home_team: toTeam(r.home_team_id),
        away_team: toTeam(r.away_team_id),
        status: r.match_status,
        kickoff: r.kickoff,
        matchday: r.matchday ?? undefined,
        venue: r.venue ?? undefined,
        score_home: r.score_home,
        score_away: r.score_away,
        minute: null,
      };
    });
    const tickets = Object.fromEntries(rows.filter((r) => r.tickets_url).map((r) => [r.slug, r.tickets_url!]));
    return { matches, tickets };
  });
}

/** Upcoming first, soonest first (a game stays listed for 3 hours after tip-off) */
export function upcoming(matches: Match[], now = new Date()): Match[] {
  return matches
    .filter((m) => m.status !== 'finished' && new Date(m.kickoff).getTime() + 3 * 3_600_000 > now.getTime())
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));
}

// ── Notes added to TheStatsAPI matches ──

export interface MatchExtras extends MatchNote {
  highlightYoutubeId?: string;
}

export async function getMatchNote(matchId: string): Promise<MatchExtras | undefined> {
  const found = await cmsRead<{ note?: MatchExtras }>('match_notes', { note: MATCH_NOTES[matchId] }, async (db) => {
    const row = unwrap(await db.from('match_notes').select('*').eq('external_match_id', matchId).maybeSingle());
    if (!row) return { note: undefined };
    return {
      note: {
        venue: row.venue ?? undefined,
        officials: (row.officials as unknown as MatchNote['officials']) ?? [],
        goals: (row.goals as unknown as MatchNote['goals']) ?? [],
        highlightYoutubeId: row.highlight_youtube_id ?? undefined,
      },
    };
  });
  return found.note;
}

// ── Player photos set in the CMS for TheStatsAPI players ──

/** external id (pl_…) → photo URL, for published players that have one */
export async function getCmsPlayerPhotos(externalIds: string[]): Promise<Record<string, string>> {
  if (externalIds.length === 0) return {};
  return cmsRead('players/photos', {} as Record<string, string>, async (db) => {
    const rows = unwrap(await db.from('players').select('external_id, photo_url').in('external_id', externalIds).not('photo_url', 'is', null)) ?? [];
    return Object.fromEntries(rows.map((r) => [r.external_id!, r.photo_url!]));
  });
}

// ── Section highlights ──

export interface ResolvedHighlight {
  id: string;
  image: string;
  date: string;
  url: string;
  title: string;
  text: string;
  cta?: string;
}

/** Highlights of a section from the CMS; null while the CMS isn't live (the page uses its bundled ones) */
export async function getSectionHighlights(section: SectionKey, locale: string): Promise<ResolvedHighlight[] | null> {
  return cmsRead<ResolvedHighlight[] | null>('section_highlights', null, async (db) => {
    const rows = unwrap(await db.from('section_highlights').select('*').eq('section', section).order('sort').order('published_on', { ascending: false })) ?? [];
    return rows.map((r) => ({
      id: r.id,
      image: r.image_url,
      date: r.published_on,
      url: r.source_url,
      title: pick(r.title, locale),
      text: pick(r.text, locale),
      cta: Object.keys(asL10n(r.cta_label)).length ? pick(r.cta_label, locale) : undefined,
    }));
  });
}

// ── Membership offers ──

export interface MembershipOffer {
  name: string;
  price?: number;
  currency: string;
  benefits: string[];
  ctaUrl?: string;
  availability: 'available' | 'sold_out' | 'coming_soon';
}

/** A published offer by slug; null while the CMS isn't live or when unpublished */
export async function getMembershipOffer(slug: string, locale: string): Promise<MembershipOffer | null> {
  return cmsRead<MembershipOffer | null>('membership_offers', null, async (db) => {
    const r = unwrap(await db.from('membership_offers').select('*').eq('slug', slug).maybeSingle());
    if (!r) return null;
    return {
      name: pick(r.name, locale),
      price: r.price_amount ?? undefined,
      currency: r.currency,
      benefits: (Array.isArray(r.benefits) ? r.benefits : []).map((b) => pick(b, locale)).filter(Boolean),
      ctaUrl: r.cta_url ?? undefined,
      availability: r.availability as MembershipOffer['availability'],
    };
  });
}

// ── CMS pages ──

export type PageBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'image'; url: string; caption?: string };

export interface CmsPage {
  slug: string;
  title: string;
  summary?: string;
  cover?: string;
  blocks: PageBlock[];
  seoTitle?: string;
  seoDescription?: string;
}

export function resolveBlocks(raw: unknown, locale: string): PageBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((b): PageBlock[] => {
    if (!b || typeof b !== 'object') return [];
    const block = b as Record<string, unknown>;
    switch (block.type) {
      case 'heading':
      case 'paragraph': {
        const text = pick(block.text as never, locale);
        return text ? [{ type: block.type, text }] : [];
      }
      case 'quote': {
        const text = pick(block.text as never, locale);
        return text ? [{ type: 'quote', text, cite: typeof block.cite === 'string' ? block.cite : undefined }] : [];
      }
      case 'image':
        return typeof block.url === 'string' ? [{ type: 'image', url: block.url, caption: pick(block.caption as never, locale) || undefined }] : [];
      default:
        return [];
    }
  });
}

export function toCmsPage(row: Tables<'pages'>, locale: string): CmsPage {
  return {
    slug: row.slug,
    title: pick(row.title, locale),
    summary: pick(row.summary, locale) || undefined,
    cover: row.cover_url ?? undefined,
    blocks: resolveBlocks(row.blocks, locale),
    seoTitle: pick(row.seo_title, locale) || undefined,
    seoDescription: pick(row.seo_description, locale) || undefined,
  };
}

export async function getCmsPage(slug: string, locale: string): Promise<CmsPage | null> {
  const found = await cmsRead<{ page: CmsPage | null }>('pages', { page: null }, async (db) => {
    const row = unwrap(await db.from('pages').select('*').eq('slug', slug).maybeSingle());
    return { page: row ? toCmsPage(row, locale) : null };
  });
  return found.page;
}
