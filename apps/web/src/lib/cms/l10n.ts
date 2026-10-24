import type { Json } from '@/types/database';

/** Translated text as stored in Supabase: { ar, fr, en }, any of them possibly missing */
export type L10n = { ar?: string; fr?: string; en?: string };
export type Lang = 'ar' | 'fr' | 'en';

export const LANGS: Lang[] = ['fr', 'ar', 'en'];

export const toLang = (locale: string): Lang => (locale === 'ar' || locale === 'fr' ? locale : 'en');

export function asL10n(value: Json | null | undefined): L10n {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: L10n = {};
  for (const lang of LANGS) {
    const v = (value as Record<string, unknown>)[lang];
    if (typeof v === 'string' && v.trim()) out[lang] = v;
  }
  return out;
}

/** The text in the page language, else French, Arabic, English — whichever exists */
export function pick(value: Json | L10n | null | undefined, locale: string): string {
  const v = asL10n(value as Json);
  return v[toLang(locale)] ?? v.fr ?? v.ar ?? v.en ?? '';
}

/** All three languages filled with the same fallback, for types that require every language */
export function full(value: Json | L10n | null | undefined): { ar: string; fr: string; en: string } {
  const v = asL10n(value as Json);
  const any = v.fr ?? v.ar ?? v.en ?? '';
  return { ar: v.ar ?? any, fr: v.fr ?? any, en: v.en ?? any };
}
