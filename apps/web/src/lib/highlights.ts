import type { Match } from '@/types';
import { isWydad } from '@/lib/clubs';

/**
 * Official SNRT / Arryadia highlights (youtube.com/@ArryadiaTv), by match id → YouTube video id.
 * Entries here are checked by hand and always win. Matches without one are looked up on the
 * channel automatically (findArryadiaHighlight); if nothing matches, the card links to a search.
 */
export const MATCH_HIGHLIGHTS: Record<string, string> = {
  cmtwihhyf5ec6qs07aa74zwqo: 'ssMGrjnyS-M', // MD1 Wydad – Widad Temara
  cmu9exfop16wikm08sjxacs94: '0jEgZ9axZYE', // MD2 DHJ – Wydad
  cmuuzned3tv2vti07yy6v9d7j: 'Mz03u1pYHjo', // MD3 Wydad – CODM
  cmuuzodrtu4noti07roj377su: 'aLrIrXx9368', // MD4 Wydad – Amal Tiznit
};

export const ARRYADIA_CHANNEL = 'https://www.youtube.com/@ArryadiaTv';

export function highlightsSearchUrl(home: string, away: string): string {
  const q = `Arryadia ${home} ${away} Botola Pro`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

/** How Arryadia writes each club in its titles (Arabic and English), by team id */
const ALIASES: Record<string, string[]> = {
  tm_9816777: ['وداد تمارة', 'Widad Temara', 'Wydad Temara'],
  tm_551225: ['الدفاع الحسني الجديدي', 'الدفاع الجديدي', 'El Jadidi', 'El Jadida'],
  tm_446704: ['النادي المكناسي', 'COD Meknès', 'CODM', 'Meknes', 'Meknès'],
  tm_4629780: ['أمل تيزنيت', 'Amal Tiznit', 'Tiznit'],
  tm_0178775: ['اتحاد تواركة', 'إتحاد تواركة', 'Touarga'],
  tm_773955: ['المغرب التطواني', 'Tetouan', 'Tétouan', 'Tetuan'],
  tm_602409: ['الكوكب المراكشي', 'Kawkab'],
  tm_029484: ['الجيش الملكي', 'AS FAR', 'Royal Army', 'FAR Rabat'],
  tm_5227823: ['نهضة الزمامرة', 'Zemamra'],
  tm_446779: ['المغرب الفاسي', 'Maghreb Fez', 'MAS Fès', 'MAS Fes', 'Fez'],
  tm_327682: ['الرجاء الرياضي', 'Raja'],
  tm_773999: ['حسنية أكادير', 'Hassania'],
  tm_4560072: ['نهضة بركان', 'Berkane'],
  tm_1309697: ['اتحاد طنجة', 'IR Tanger', 'Ittihad Tanger', 'Tanger', 'Tangier'],
  tm_337870: ['الفتح الرياضي', 'FUS Rabat', 'FUS'],
};

const AR_ORDINALS = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة'];

/** Matchday written in a title: "Matchday 3", "Week 30", "(الدورة 19)", "الجولة الثالثة" */
function titleMatchday(title: string): number | null {
  const n = title.match(/(?:Matchday|Week|Round|الجولة|الدورة)\s*\(?(\d{1,2})/i);
  if (n) return Number(n[1]);
  const i = AR_ORDINALS.findIndex((w) => title.includes(`الجولة ${w}`));
  return i === -1 ? null : i + 1;
}

/** "3d ago" / "2w ago" / "4mo ago" → approximate age in days */
function ageInDays(text: string): number | null {
  const m = text.match(/(\d+)\s*(second|minute|hour|day|week|month|year|s|m|h|d|w|mo|y)\b/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  if (unit.startsWith('mo') || unit === 'month') return n * 30;
  if (unit.startsWith('y')) return n * 365;
  if (unit.startsWith('w')) return n * 7;
  if (unit.startsWith('d')) return n;
  return 0;
}

interface ChannelVideo {
  id: string;
  title: string;
  published: string;
}

/** Videos from a search inside the Arryadia channel (parsed from the page's initial data). */
async function searchChannel(query: string): Promise<ChannelVideo[]> {
  const url = `${ARRYADIA_CHANNEL}/search?hl=en&query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 6 * 3600 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const json = html.match(/var ytInitialData = (\{[\s\S]*?\});<\/script>/)?.[1];
  if (!json) return [];
  const videos: ChannelVideo[] = [];
  const text = (t: unknown): string => {
    if (!t || typeof t !== 'object') return typeof t === 'string' ? t : '';
    const o = t as { simpleText?: string; runs?: { text: string }[]; content?: string };
    return o.simpleText ?? o.runs?.map((r) => r.text).join('') ?? o.content ?? '';
  };
  const walk = (o: unknown) => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (!o || typeof o !== 'object') return;
    const rec = o as Record<string, unknown>;
    const v = rec.videoRenderer as { videoId?: string; title?: unknown; publishedTimeText?: unknown } | undefined;
    if (v?.videoId) videos.push({ id: v.videoId, title: text(v.title), published: text(v.publishedTimeText) });
    Object.values(rec).forEach(walk);
  };
  walk(JSON.parse(json));
  return videos;
}

/**
 * Finds Arryadia's highlights of a finished Wydad match: a highlights/summary video (not a live
 * stream) naming the opponent and the matchday, published after kick-off. Cached for 6 hours.
 */
export async function findArryadiaHighlight(match: Match): Promise<string | undefined> {
  if (MATCH_HIGHLIGHTS[match.id]) return MATCH_HIGHLIGHTS[match.id];
  if (match.status !== 'finished' || match.sport === 'basketball') return undefined;
  const opponent = isWydad(match.home_team.id) ? match.away_team : match.home_team;
  const aliases = ALIASES[opponent.id];
  if (!aliases) return undefined;

  try {
    const videos = await searchChannel(`${aliases[0]} الوداد`);
    const daysSinceKickoff = (Date.now() - new Date(match.kickoff).getTime()) / 86_400_000;
    const hit = videos.find((v) => {
      const t = v.title;
      if (!/ملخص|Highlights|Summary/i.test(t) || /بث مباشر|live/i.test(t)) return false;
      if (!aliases.some((a) => t.toLowerCase().includes(a.toLowerCase()))) return false;
      // Wydad must be named apart from the opponent (Widad / Wydad Temara also say "Wydad")
      const rest = aliases.reduce((acc, a) => acc.replace(new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ''), t);
      if (!/الوداد الرياضي|Wydad (AC|Athletic|Casablanca)|Wydad\b(?! Temara)/i.test(rest)) return false;
      if (match.matchday && titleMatchday(t) !== match.matchday) return false;
      const age = ageInDays(v.published);
      // Same matchday last season: older than this match, so skip it
      return age == null || age <= daysSinceKickoff + 3;
    });
    return hit?.id;
  } catch (err) {
    console.warn('[highlights] Arryadia lookup failed:', err instanceof Error ? err.message : err);
    return undefined;
  }
}
