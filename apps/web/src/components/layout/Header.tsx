import { getLocale, getTranslations } from 'next-intl/server';
import type { Player } from '@/types';
import { getSquad } from '@/services/players';
import { getLatestNews } from '@/services/news';
import { SERVICE_LINKS, flattenMenu } from '@/lib/navigation-config';
import { getNavigation } from '@/lib/cms/site';
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

  const [squad, news, nav] = await Promise.all([getSquad(), getLatestNews(20, locale), getNavigation(locale)]);

  const players = [...squad].sort(byNumber);

  // Search index: pages (one entry per destination), squad, recent news
  const pages = new Map<string, SearchEntry>();
  const addPage = (label: string, href: string, meta?: string) => {
    if (!pages.has(href)) pages.set(href, { kind: 'page', label, href, meta });
  };
  const labels = new Map<string, string>();
  const collect = (nodes: typeof nav.main) => nodes.forEach((n) => (labels.set(n.key, n.label ?? t(n.key)), collect(n.children ?? [])));
  collect(nav.main);
  for (const link of flattenMenu(nav.main)) addPage(labels.get(link.key) ?? t(link.key), link.href, link.parent && labels.get(link.parent));
  for (const p of [...nav.bar, ...SERVICE_LINKS]) addPage(p.label ?? t(p.key), p.href);

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

  const data: HeaderData = { search, menu: nav.main, bar: nav.bar };

  return <SiteHeader data={data} />;
}
