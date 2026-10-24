import 'server-only';
import type { Tables } from '@/types/database';
import { BAR_LINKS, MENU, type MenuNode, type NavLink } from '@/lib/navigation-config';
import {
  FOOTER_CLUB_LINKS,
  FOOTER_SERVICE_LINKS,
  HOME_SECTION_KEYS,
  PARTNERS,
  SOCIAL_LINKS,
  type HomeSectionKey,
  type Partner,
  type SocialLink,
} from '@/lib/site-defaults';
import { cmsRead, unwrap } from './read';
import { pick, type L10n } from './l10n';

export interface SiteSettings {
  socialLinks: SocialLink[];
  partners: Partner[];
  seoTitle?: string;
  seoDescription?: string;
}

export async function getSiteSettings(locale: string): Promise<SiteSettings> {
  return cmsRead<SiteSettings>('site_settings', { socialLinks: SOCIAL_LINKS, partners: PARTNERS }, async (db) => {
    const row = unwrap(await db.from('site_settings').select('*').eq('id', 1).maybeSingle());
    if (!row) return null;
    return {
      socialLinks: (row.social_links as unknown as SocialLink[]) ?? [],
      partners: (row.partners as unknown as Partner[]) ?? [],
      seoTitle: pick(row.seo_title, locale) || undefined,
      seoDescription: pick(row.seo_description, locale) || undefined,
    };
  });
}

type NavRow = Tables<'navigation_items'>;

function toNode(row: NavRow, rows: NavRow[], locale: string): MenuNode {
  const children = rows.filter((r) => r.parent_id === row.id).map((r) => toNode(r, rows, locale));
  return {
    key: row.label_key ?? row.id,
    href: row.href ?? undefined,
    label: row.label ? pick(row.label, locale) : undefined,
    children: children.length ? children : undefined,
  };
}

export interface Navigation {
  main: MenuNode[];
  bar: NavLink[];
  footerClub: NavLink[];
  footerServices: NavLink[];
}

/** Menus from navigation_items (visible items only, in order), else the bundled ones */
export async function getNavigation(locale: string): Promise<Navigation> {
  const fallback: Navigation = { main: MENU, bar: BAR_LINKS, footerClub: FOOTER_CLUB_LINKS, footerServices: FOOTER_SERVICE_LINKS };
  return cmsRead('navigation_items', fallback, async (db) => {
    const rows = unwrap(await db.from('navigation_items').select('*').order('sort').order('created_at')) ?? [];
    const roots = (menu: NavRow['menu']) => rows.filter((r) => r.menu === menu && !r.parent_id).map((r) => toNode(r, rows, locale));
    const links = (menu: NavRow['menu']) => roots(menu).filter((n): n is NavLink & MenuNode => !!n.href).map(({ key, href, label }) => ({ key, href: href!, label }));
    return { main: roots('main'), bar: links('bar'), footerClub: links('footer_club'), footerServices: links('footer_services') };
  });
}

export interface Announcement {
  id: string;
  message: string;
  linkUrl?: string;
  linkLabel?: string;
}

/** Current announcement banners (RLS already keeps only active ones within their dates) */
export async function getAnnouncements(locale: string): Promise<Announcement[]> {
  return cmsRead('announcements', [] as Announcement[], async (db) => {
    const rows = unwrap(await db.from('announcements').select('*').order('sort')) ?? [];
    return rows.map((r) => ({
      id: r.id,
      message: pick(r.message, locale),
      linkUrl: r.link_url ?? undefined,
      linkLabel: r.link_label ? pick(r.link_label, locale) : undefined,
    }));
  });
}

export interface HomeSection {
  key: HomeSectionKey;
  /** Title written in the CMS; the section keeps its own title otherwise */
  title?: string;
}

/** Visible home sections in order */
export async function getHomeSections(locale: string): Promise<HomeSection[]> {
  const fallback = HOME_SECTION_KEYS.map((key) => ({ key }));
  return cmsRead('home_sections', fallback, async (db) => {
    const rows = unwrap(await db.from('home_sections').select('*').order('sort')) ?? [];
    if (rows.length === 0) return null;
    return rows
      .filter((r) => r.visible)
      .map((r) => ({ key: r.key as HomeSectionKey, title: r.title ? pick(r.title as L10n, locale) || undefined : undefined }));
  });
}
