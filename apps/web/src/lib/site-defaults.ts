import { TICKETS_PAGE } from './links';
import { ACADEMY_URL, BRAND_URL, MEMBER_AREA_URL, STORE_URL, type NavLink } from './navigation-config';

/**
 * Site-wide content bundled with the site: used until the Supabase CMS is live, and imported
 * into it by scripts/seed.ts (site_settings, navigation_items).
 */
export type SocialNetwork = 'youtube' | 'instagram' | 'x' | 'facebook' | 'tiktok';

export interface SocialLink {
  network: SocialNetwork;
  url: string;
}

export interface Partner {
  name: string;
  logo_url: string;
  url?: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { network: 'youtube', url: 'https://youtube.com/@WydadAC' },
  { network: 'instagram', url: 'https://instagram.com/wydad.official' },
  { network: 'x', url: 'https://x.com/WACofficiel' },
  { network: 'facebook', url: 'https://facebook.com/WydadAC' },
];

export const PARTNERS: Partner[] = [
  { name: 'Ingelec', logo_url: '/images/sponsors/ingelec.png' },
  { name: 'Kappa', logo_url: '/images/sponsors/kappa.svg' },
  { name: 'Coca-Cola', logo_url: '/images/sponsors/coca-cola.webp' },
  { name: 'Fiat', logo_url: '/images/sponsors/fiat.svg' },
];

export const FOOTER_CLUB_LINKS: NavLink[] = [
  { key: 'news', href: '/news' },
  { key: 'football', href: '/team' },
  { key: 'basketball', href: '/basketball' },
  { key: 'wydad_tv', href: '/wydad-tv' },
  { key: 'club', href: '/club' },
  { key: 'fans', href: '/fans' },
  { key: 'academy', href: ACADEMY_URL },
];

export const FOOTER_SERVICE_LINKS: NavLink[] = [
  { key: 'member_area', href: MEMBER_AREA_URL },
  { key: 'tickets', href: TICKETS_PAGE },
  { key: 'store', href: STORE_URL },
  { key: 'brand', href: BRAND_URL },
  { key: 'gold_membership', href: '/gold-membership' },
];

/** Home page sections in their default order (home_sections in the CMS) */
export const HOME_SECTION_KEYS = ['fixtures', 'standings', 'brand', 'news', 'instagram'] as const;
export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];
