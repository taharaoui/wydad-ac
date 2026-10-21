'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/config';

const NAV_ITEMS = [
  { key: 'matches', href: '/matches' },
  { key: 'team', href: '/team' },
  { key: 'news', href: '/news' },
  { key: 'club', href: '/club' },
  { key: 'wydad_plus', href: '/wydad-plus' },
] as const;

const LOCALE_LABELS: Record<Locale, string> = {
  ar: 'ع',
  fr: 'FR',
  en: 'EN',
};

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function switchLocale(next: Locale) {
    router.replace(pathname, { locale: next });
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-wydad-red">
            <span className="font-display text-lg font-bold text-white">W</span>
          </div>
          <span className="hidden font-display text-lg font-bold text-fg sm:block">
            {t('home')}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ key, href }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={key}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-wydad-red/10 text-wydad-red'
                    : 'text-fg-muted hover:bg-surface-secondary hover:text-fg'
                }`}
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex items-center rounded-lg border border-border">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                className={`px-2 py-1.5 text-xs font-medium transition-colors ${
                  locale === l
                    ? 'bg-wydad-red text-white'
                    : 'text-fg-muted hover:text-fg'
                } ${l === 'ar' ? 'rounded-s-lg' : ''} ${l === 'en' ? 'rounded-e-lg' : ''}`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-fg-muted hover:bg-surface-secondary md:hidden"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ key, href }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-wydad-red/10 text-wydad-red'
                      : 'text-fg-muted hover:bg-surface-secondary hover:text-fg'
                  }`}
                >
                  {t(key)}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
