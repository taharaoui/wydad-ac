import { getLocale, getTranslations } from 'next-intl/server';
import type { Player } from '@/types';
import { getSquad } from '@/services/players';
import { getLatestNews } from '@/services/news';
import { BAR_LINKS, SERVICE_LINKS, flattenMenu } from '@/lib/navigation-config';
import type { SearchEntry } from '@/lib/search';
import { SiteHeader } from './header/SiteHeader';
import type { HeaderData } from './header/types';

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
  const t = await getTranslations({ locale, namespace: 'header' });

  const [squad, news] = await Promise.all([getSquad(), getLatestNews(20)]);

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

  const data: HeaderData = { search };

  return <SiteHeader data={data} />;
}
