import { TICKETS_URL } from './links';

/**
 * Events listed on the official ticketing platform (wydad.ticketing.ma/all-events), read from its
 * public page and refreshed every 10 minutes. Buying always happens on the platform itself.
 */
export interface TicketEvent {
  title: string;
  /** As written by the platform, e.g. "dimanche, 18 octobre 2026 - 21:00" */
  date: string;
  venue: string;
  /** "Gratuit", "50 DH"…; empty when not shown */
  price: string;
  /** Poster (signed S3 URL, valid ~30 min; the page is refreshed well before) */
  image?: string;
  /** Purchase page on the platform, when sales are open */
  buyUrl?: string;
  /** Button label shown by the platform when sales are closed ("Vente fermée", "Complet"…) */
  status?: string;
}

const clean = (s: string) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** "dimanche, 18 octobre 2026 - 21:00" → Date (Casablanca, UTC+1) */
function parseDate(text: string): Date | null {
  const m = text.toLowerCase().match(/(\d{1,2})\s+([a-zéû]+)\s+(\d{4})(?:\s*-\s*(\d{1,2}):(\d{2}))?/);
  const month = m ? MONTHS.indexOf(m[2]) : -1;
  if (!m || month === -1) return null;
  return new Date(Date.UTC(Number(m[3]), month, Number(m[1]), Number(m[4] ?? 23) - 1, Number(m[5] ?? 0)));
}

export async function getTicketEvents(): Promise<TicketEvent[]> {
  try {
    const res = await fetch(new URL('all-events', TICKETS_URL), {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const cards = html.split('<div class="card h-100').slice(1);
    return cards
      .map((card): TicketEvent | null => {
        const block = card.slice(0, card.indexOf('<div class="col-md-4') === -1 ? undefined : card.indexOf('<div class="col-md-4'));
        const title = clean(block.match(/<h4 class="card-title[^"]*">([\s\S]*?)<\/h4>/)?.[1] ?? '');
        if (!title) return null;
        const desc = [...block.matchAll(/<p class="card-desc[^"]*">([\s\S]*?)<\/p>/g)].map((m) => clean(m[1]));
        const price = clean(block.match(/<p class="card-text[^"]*">([\s\S]*?)<\/p>/)?.[1] ?? '');
        const image = block.match(/<img[^>]+src="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&');
        // Only the card's own button area (the last card is followed by the pagination links)
        const footer = block.slice(block.indexOf('mt-auto'), block.indexOf('mt-auto') + 1200);
        const link = footer.match(/href="(https?:\/\/[^"]*\/event\/[^"]+)"/)?.[1]?.replace(/&amp;/g, '&');
        const when = parseDate(desc[0] ?? '');
        const buyUrl = link && (!when || when.getTime() > Date.now() - 3 * 3_600_000) ? link : undefined;
        const status = buyUrl ? undefined : clean(footer.match(/<button[^>]*>([\s\S]*?)<\/button>/)?.[1] ?? '') || undefined;
        return { title, date: desc[0] ?? '', venue: desc[1] ?? '', price, image, buyUrl, status };
      })
      .filter((e): e is TicketEvent => !!e);
  } catch (err) {
    console.warn('[ticketing] events unavailable:', err instanceof Error ? err.message : err);
    return [];
  }
}
