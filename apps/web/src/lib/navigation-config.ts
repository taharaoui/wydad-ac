import { TICKETS_PAGE } from './links';

/**
 * Header navigation: every destination lives here, apart from rendering.
 * Labels are keys in the `header` messages. Hrefs starting with http open in a new tab.
 */

/** Sections without a page yet point to /coming-soon/{section} until a real URL is configured */
/** Club page showing the WAC Official Brand catalogue (wacofficialbrand.com) */
export const BRAND_URL = '/brand';
export const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || '/coming-soon/store';
export const ACADEMY_URL = process.env.NEXT_PUBLIC_ACADEMY_URL || '/sections/academy';
/** The header's Shop button opens the jersey store */
export const SHOP_URL = STORE_URL;
/** Login and member area share the account page until authentication ships */
export const SIGN_IN_URL = '/profile';
export const MEMBER_AREA_URL = process.env.NEXT_PUBLIC_MEMBER_AREA_URL || '/profile';
export const YOUTUBE_URL = 'https://youtube.com/@WydadAC';

export interface NavLink {
  key: string;
  href: string;
  /** Label written in the CMS, already in the page language; else `key` is a `header` message */
  label?: string;
}

/** Menu entry: a link, or a level that opens its children */
export interface MenuNode {
  key: string;
  href?: string;
  /** Label written in the CMS, already in the page language; else `key` is a `header` message */
  label?: string;
  children?: MenuNode[];
}

export const isExternal = (href: string) => /^https?:\/\//.test(href);

/** Links shown directly in the top bar (psg.fr: News, PSG TV) */
export const BAR_LINKS: NavLink[] = [
  { key: 'news', href: '/news' },
  { key: 'wydad_tv', href: '/wydad-tv' },
];

/** Account and commerce links (for search; the bar renders them itself) */
export const SERVICE_LINKS: NavLink[] = [
  { key: 'sign_in', href: SIGN_IN_URL },
  { key: 'member_area', href: MEMBER_AREA_URL },
  { key: 'tickets', href: TICKETS_PAGE },
];

/**
 * The club's sports sections (French Wikipedia, "Wydad Athletic Club": basketball, football,
 * boxing, fencing), plus swimming (with water polo), handball and table tennis as confirmed by the
 * club. Sections fed by their Instagram account live at /sections/{key} (lib/sections.ts); the
 * rest go to /coming-soon.
 */
export const SECTIONS: MenuNode[] = [
  {
    key: 'football',
    // First team or Espoirs (U23)
    children: [
      {
        key: 'first_team',
        children: [
          { key: 'squad', href: '/team' },
          { key: 'staff', href: '/team/staff' },
          { key: 'fixtures_results', href: '/matches' },
          { key: 'standings', href: '/standings' },
          { key: 'honours_football', href: '/team/honours' },
        ],
      },
      {
        key: 'espoirs',
        children: [
          { key: 'squad', href: '/team/espoirs' },
          { key: 'fixtures_results', href: '/team/espoirs/fixtures' },
        ],
      },
      { key: 'women', href: '/sections/women' },
    ],
  },
  {
    key: 'basketball',
    children: [
      { key: 'squad', href: '/basketball/squad' },
      { key: 'staff', href: '/basketball/staff' },
      { key: 'fixtures_results', href: '/basketball' },
      { key: 'standings', href: '/basketball/standings' },
      { key: 'honours_football', href: '/basketball/honours' },
    ],
  },
  {
    key: 'swimming',
    children: [
      { key: 'swimming_section', href: '/sections/swimming' },
      { key: 'water_polo', href: '/coming-soon/water-polo' },
    ],
  },
  { key: 'handball', href: '/sections/handball' },
  { key: 'boxing', href: '/sections/boxing' },
  { key: 'fencing', href: '/sections/fencing' },
  { key: 'table_tennis', href: '/coming-soon/table-tennis' },
];

/** Side menu (all sizes), after psg.fr: main list, then levels in a grey panel beside it */
export const MENU: MenuNode[] = [
  { key: 'news', href: '/news' },
  { key: 'teams', children: [...SECTIONS, { key: 'academy', href: ACADEMY_URL }] },
  {
    key: 'wydad_tv',
    children: [
      { key: 'all_videos', href: '/wydad-tv' },
      { key: 'youtube_channel', href: YOUTUBE_URL },
    ],
  },
  {
    key: 'club',
    children: [
      { key: 'history', href: '/club#history' },
      { key: 'facilities', href: '/club#stadium' },
      { key: 'honours', href: '/club#honours' },
      { key: 'figures', href: '/club#figures' },
    ],
  },
  {
    key: 'fans',
    children: [
      { key: 'gold_membership', href: '/gold-membership' },
      { key: 'podcasts', href: '/fans#podcasts' },
      { key: 'ultras', href: '/fans#ultras' },
      { key: 'historic_members', href: '/fans#historic-members' },
      { key: 'community', href: '/fans#community' },
    ],
  },
  {
    key: 'shop',
    children: [
      { key: 'brand', href: BRAND_URL },
      { key: 'store', href: STORE_URL },
    ],
  },
];

/** Every link in the menu, depth-first (for search) */
export function flattenMenu(nodes: MenuNode[] = MENU, parent?: string): { key: string; href: string; parent?: string }[] {
  return nodes.flatMap((n) => [
    ...(n.href ? [{ key: n.key, href: n.href, parent }] : []),
    ...flattenMenu(n.children ?? [], n.key),
  ]);
}

export function isActive(pathname: string, href: string) {
  if (isExternal(href)) return false;
  const path = href.split('#')[0];
  if (path === '/') return pathname === '/' || pathname === '';
  return pathname === path || pathname.startsWith(`${path}/`);
}
