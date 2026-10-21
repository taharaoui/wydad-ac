'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/config';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Image from 'next/image';

const NAV_ITEMS = [
  { key: 'news', href: '/news' },
  { key: 'matches', href: '/matches' },
  { key: 'team', href: '/team' },
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
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === '/' || pathname === '';

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function switchLocale(next: Locale) {
    router.replace(pathname, { locale: next });
    setMobileOpen(false);
  }

  // On the homepage, header is transparent until scrolled
  const headerBg = isHome && !scrolled
    ? 'bg-transparent'
    : '';
  const headerStyle = isHome && !scrolled
    ? {}
    : { background: 'var(--header-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' };
  const textColor = isHome && !scrolled ? 'text-white' : 'text-fg';
  const textMutedColor = isHome && !scrolled ? 'text-white/70' : 'text-fg-secondary';
  const borderColor = isHome && !scrolled ? 'border-white/10' : 'border-border';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg} ${
          scrolled
            ? 'border-b border-border shadow-header'
            : isHome
            ? 'border-b border-transparent'
            : 'border-b border-transparent'
        }`}
        style={headerStyle}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo + Crest */}
          <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Image
              src="/images/crest-stars.png"
              alt="Wydad AC"
              width={36}
              height={42}
              className="h-[42px] w-auto"
              priority
            />
            <span className={`hidden font-display text-lg font-bold sm:block ${textColor}`}>
              WAC
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV_ITEMS.map(({ key, href }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={key}
                  href={href}
                  className={`relative px-3.5 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                    isActive
                      ? 'text-wydad-red'
                      : `${textMutedColor} hover:${textColor}`
                  }`}
                >
                  {t(key)}
                  {isActive && (
                    <span className="absolute inset-x-2 -bottom-[1px] h-[2px] rounded-full bg-wydad-red" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Sign In */}
            <Link
              href="/profile"
              className={`hidden items-center gap-1.5 text-sm font-semibold uppercase tracking-wide transition-colors md:flex ${textMutedColor} hover:${textColor}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {locale === 'ar' ? 'تسجيل' : locale === 'fr' ? 'Connexion' : 'Sign in'}
            </Link>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Language switcher */}
            <div className={`flex items-center overflow-hidden rounded-lg border ${borderColor}`}>
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className={`px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    locale === l
                      ? 'bg-wydad-red text-white'
                      : `${textMutedColor} hover:text-white hover:bg-white/10`
                  }`}
                >
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`relative rounded-lg p-2 md:hidden ${textMutedColor}`}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <div className="flex h-5 w-5 flex-col items-center justify-center gap-1">
                <span
                  className={`block h-[2px] w-4 rounded-full bg-current transition-all duration-300 ${
                    mobileOpen ? 'translate-y-[3px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`block h-[2px] w-4 rounded-full bg-current transition-all duration-300 ${
                    mobileOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block h-[2px] w-4 rounded-full bg-current transition-all duration-300 ${
                    mobileOpen ? '-translate-y-[3px] -rotate-45' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for non-home pages where header is fixed */}
      {!isHome && <div className="h-16" />}

      {/* Mobile nav overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile nav drawer */}
      <nav
        className={`fixed top-0 right-0 z-40 h-full w-72 bg-surface-dark text-white shadow-xl transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : 'ltr:translate-x-full rtl:-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <Image
            src="/images/crest-stars.png"
            alt="Wydad AC"
            width={28}
            height={33}
            className="h-[33px] w-auto"
          />
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-white/60 hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-1 p-4">
          {NAV_ITEMS.map(({ key, href }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={key}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all ${
                  isActive
                    ? 'bg-wydad-red/20 text-wydad-red'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t(key)}
              </Link>
            );
          })}

          <hr className="my-2 border-white/10" />
          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {locale === 'ar' ? 'حسابي' : locale === 'fr' ? 'Mon compte' : 'My Account'}
          </Link>
        </div>
      </nav>
    </>
  );
}
