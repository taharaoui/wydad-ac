/**
 * The newsroom's publishing standard: one place for the numbers shown in the guidelines, checked by
 * the editor as the journalist types and enforced again by the server before publication.
 */

export type Lang = 'fr' | 'ar' | 'en';

export const LANGUAGES: { code: Lang; label: string; native: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'fr', label: 'Français', native: 'Français', dir: 'ltr' },
  { code: 'ar', label: 'Arabe', native: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'Anglais', native: 'English', dir: 'ltr' },
];
export const isLang = (v: unknown): v is Lang => v === 'fr' || v === 'ar' || v === 'en';
export const dirOf = (lang: Lang) => (lang === 'ar' ? 'rtl' : 'ltr');

/** Featured image: 16:9, exported at 1200 × 675 */
export const COVER = { width: 1200, height: 675, ratio: 16 / 9, label: '1200 × 675 px (16:9)' } as const;
/** Optional phone crop: 4:5, exported at 1080 × 1350 */
export const COVER_MOBILE = { width: 1080, height: 1350, ratio: 4 / 5, label: '1080 × 1350 px (4:5)' } as const;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const IMAGE_FORMATS = ['image/webp', 'image/jpeg'] as const;

export const LIMITS = {
  title: { recommended: 90, max: 120 },
  excerpt: { min: 80, recommended: 260, max: 400 },
  alt: { min: 10, max: 180 },
  /** Longer articles need intertitles */
  wordsBeforeSubheadings: 400,
  /** A paragraph past this length reads as a wall of text on a phone */
  paragraphWords: 120,
  /** A word longer than this can't wrap and overflows a phone screen */
  longestWord: 28,
  seoTitle: 70,
  seoDescription: 160,
} as const;

export type Status = 'draft' | 'review' | 'published' | 'archived';

/** The 7 points the journalist ticks before publication (also required by the server) */
export const CHECKLIST = [
  { id: 'title', label: 'Le titre est correct (orthographe, noms, chiffres).' },
  { id: 'content', label: 'Le texte a été relu en entier.' },
  { id: 'language', label: 'La langue sélectionnée est celle de l’article.' },
  { id: 'category', label: 'La catégorie est la bonne.' },
  { id: 'image', label: 'L’image principale respecte les consignes.' },
  { id: 'alt', label: 'Le texte alternatif de l’image est renseigné.' },
  { id: 'facts', label: 'Les faits, noms, dates et scores ont été vérifiés.' },
] as const;
export type ChecklistId = (typeof CHECKLIST)[number]['id'];

/** Screens every article is rendered and checked on before publication */
export const DEVICES = [
  { id: 'desktop', label: 'Ordinateur', width: 1280, height: 900 },
  { id: 'tablet', label: 'Tablette', width: 768, height: 1024 },
  { id: 'mobile', label: 'Mobile', width: 375, height: 812 },
] as const;
export type DeviceId = (typeof DEVICES)[number]['id'];

/** Slug from a title: lowercase latin words joined by dashes (Arabic titles get a dated slug) */
export function slugify(title: string): string {
  const slug = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return slug.length >= 3 ? slug : '';
}
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
