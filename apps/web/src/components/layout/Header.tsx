import { getLocale, getTranslations } from 'next-intl/server';
import type { Match, Player } from '@/types';
import { getRecentMatches } from '@/services/matches';
import { getSquad } from '@/services/players';
import { getLatestNews } from '@/services/news';
import { ANNOUNCEMENTS } from '@/lib/announcements';
import { clubShortName } from '@/lib/clubs';
import { formatKickoff, formatKickoffLong } from '@/lib/datetime';
import { BAR_LINKS, SERVICE_LINKS, flattenMenu } from '@/lib/navigation-config';
import type { SearchEntry } from '@/lib/search';
import { SiteHeader } from './header/SiteHeader';
import type { Announcement, HeaderData, HeaderMatch } from './header/types';

/** Numbered players first, in shirt order */
function byNumber(a: Player, b: Player) {
  return (a.number ?? 999) - (b.number ?? 999);
}

/**
 * Server half of the header: loads fixtures, squad and news (all cached by the data layer),
 * formats dates here to keep hydration stable, and builds the search index.
 */
export async function Header() {
  const locale = await getLocale();
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';
  const [t, tMatches] = await Promise.all([
    getTranslations({ locale, namespace: 'header' }),
    getTranslations({ locale, namespace: 'matches' }),
  ]);

  const [matches, squad, news] = await Promise.all([getRecentMatches(8), getSquad(), getLatestNews(20)]);

  const toHeaderMatch = (m: Match): HeaderMatch => {
    const { day, time } = formatKickoff(m.kickoff, locale);
    return {
      id: m.id,
      home: m.home_team,
      away: m.away_team,
      status: m.status,
      scoreHome: m.score_home,
      scoreAway: m.score_away,
      minute: m.minute,
      kickoff: m.kickoff,
      day,
      time,
      competition: `${m.competition.short_name || m.competition.name}${m.matchday ? ` · ${tMatches('matchday')} ${m.matchday}` : ''}`,
    };
  };

  const live = matches.find((m) => m.status === 'live');
  const next = matches.filter((m) => m.status === 'scheduled').sort((a, b) => a.kickoff.localeCompare(b.kickoff))[0];
  const featuredMatch = live ?? next;
  const featured = featuredMatch && toHeaderMatch(featuredMatch);

  // Flash bar: the live or next match from the API first, then the configured announcements
  const announcements: Announcement[] = [];
  if (featured && (live || next)) {
    const vars = { home: clubShortName(featured.home), away: clubShortName(featured.away) };
    announcements.push({
      id: `match-${featured.id}`,
      message: live
        ? t('announce_live', { ...vars, score: `${featured.scoreHome}-${featured.scoreAway}` })
        : t('announce_next_match', { ...vars, date: `${featured.day} · ${featured.time}` }),
      cta: { label: t('announce_next_match_cta'), href: `/matches/${featured.id}` },
    });
  }
  const now = new Date().toISOString();
  // Mid-sentence date: lower-case French weekday, Arabic comma in Arabic
  const inlineDate = (iso: string) => {
    const d = formatKickoffLong(iso, locale);
    if (locale === 'fr') return d.charAt(0).toLowerCase() + d.slice(1);
    if (locale === 'ar') return d.replace(', ', '، ');
    return d;
  };
  for (const a of ANNOUNCEMENTS) {
    if (a.until && a.until <= now) continue;
    announcements.push({
      id: a.id,
      message: t(a.messageKey, { title: a.title?.[lang] ?? '', date: a.date ? inlineDate(a.date) : '' }),
      cta: a.ctaKey && a.href ? { label: t(a.ctaKey), href: a.href } : undefined,
    });
  }

  const players = [...squad].sort(byNumber);

  // Search index: pages (one entry per destination), squad, recent news
  const pages = new Map<string, SearchEntry>();
  const addPage = (key: string, href: string, meta?: string) => {
    if (!pages.has(href)) pages.set(href, { kind: 'page', label: t(key), href, meta });
  };
  for (const link of flattenMenu()) addPage(link.key, link.href, link.parent && t(link.parent));
  for (const p of [...BAR_LINKS, ...SERVICE_LINKS]) addPage(p.key, p.href);

  const search: SearchEntry[] = [
    ...pages.values(),
    ...players.map((p) => ({
      kind: 'player' as const,
      label: p.name,
      href: `/team/${p.id}`,
      meta: `${p.number != null ? `#${p.number} · ` : ''}${t(`pos_${p.position}`)}`,
    })),
    ...news.map((a) => ({ kind: 'news' as const, label: a.title[lang], href: `/news/${a.slug}` })),
  ];

  const data: HeaderData = { announcements, search };

  return <SiteHeader data={data} />;
}
