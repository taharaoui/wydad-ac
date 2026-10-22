'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, rtlLocales, type Locale } from '@/i18n/config';
import { CheckIcon, ChevronDownIcon } from './icons';

export const LOCALE_CODES: Record<Locale, string> = { fr: 'FR', ar: 'AR', en: 'EN' };
/** Display order in selectors */
export const LOCALE_ORDER: Locale[] = ['fr', 'ar', 'en'];

/**
 * Switches to the same page in another locale. The [locale] layout renders <html lang dir>;
 * flipping them right away avoids a frame of mirrored layout. next-intl's middleware stores
 * the choice in the NEXT_LOCALE cookie.
 */
export function useSwitchLocale() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  return {
    locale,
    switchTo(next: Locale) {
      if (next === locale) return;
      document.documentElement.dir = rtlLocales.includes(next) ? 'rtl' : 'ltr';
      document.documentElement.lang = next;
      router.replace(`${pathname}${window.location.hash}`, { locale: next });
    },
  };
}

/** Compact "FR ▾" popover for the desktop capsule. Arrow keys move between languages, Escape closes. */
/** `tone="light"` for white text on the dark bar */
export function LanguageSelector({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const t = useTranslations('header');
  const { locale, switchTo } = useSwitchLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.focus();
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const options = () => Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('[data-locale]') ?? []);

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(e) => {
        if (!open) return;
        if (e.key === 'Escape') {
          e.stopPropagation();
          setOpen(false);
          buttonRef.current?.focus();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const items = options();
          const i = items.indexOf(document.activeElement as HTMLButtonElement);
          items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
        }
      }}
      onBlur={(e) => {
        if (open && !e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('change_language', { lang: localeNames[locale] })}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`flex h-11 items-center gap-1.5 rounded-lg px-2.5 font-condensed text-[17px] font-bold uppercase italic transition-colors rtl:not-italic ${
          tone === 'light' ? 'text-white hover:bg-white/10' : 'text-wydad-charcoal hover:bg-black/[0.05]'
        }`}
      >
        {LOCALE_CODES[locale]}
        <ChevronDownIcon size={16} className={`transition-transform ${tone === 'light' ? 'text-white/80' : 'text-wydad-charcoal/50'} ${open ? 'rotate-180' : ''}`} />
      </button>

      <ul
        id={listId}
        hidden={!open}
        className="absolute end-0 top-full z-10 mt-2 w-48 overflow-hidden rounded-xl border border-black/[0.08] bg-white p-1.5 shadow-[0_16px_40px_rgb(23_23_25/0.16)]"
      >
        {LOCALE_ORDER.map((l) => (
          <li key={l}>
            <button
              type="button"
              data-locale={l}
              lang={l}
              aria-current={l === locale}
              onClick={() => {
                setOpen(false);
                switchTo(l);
              }}
              className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-start text-sm transition-colors hover:bg-black/[0.04] focus-visible:bg-black/[0.04] ${
                l === locale ? 'font-semibold text-wydad-logo' : 'text-wydad-charcoal'
              }`}
            >
              <span className="w-7 font-condensed text-xs font-bold tracking-wider text-wydad-charcoal/50">{LOCALE_CODES[l]}</span>
              <span className="flex-1">{localeNames[l]}</span>
              {l === locale && <CheckIcon size={16} />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
