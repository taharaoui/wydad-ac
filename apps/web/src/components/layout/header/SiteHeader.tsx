'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { TICKETS_PAGE } from '@/lib/links';
import { BRAND_URL, SIGN_IN_URL, isActive } from '@/lib/navigation-config';
import { MenuIcon, SearchIcon, TicketIcon, UserIcon } from './icons';
import { LanguageSelector } from './LanguageSelector';
import { MenuPanel } from './MenuPanel';
import { SearchDialog } from './SearchDialog';
import { SmartLink } from './SmartLink';
import type { HeaderData } from './types';

/** Main bar height, mobile / lg+ */
const BAR_H = 'h-16 lg:h-[72px]';

const barLink =
  'relative flex h-full items-center whitespace-nowrap font-condensed text-[19px] font-extrabold uppercase italic tracking-wide text-white transition-colors hover:text-white/75 rtl:not-italic';
const pill =
  'flex h-10 items-center gap-2 rounded px-3.5 font-condensed text-[17px] font-extrabold uppercase italic tracking-wide transition-colors rtl:not-italic';

/**
 * psg.fr-style header: a full-width bar (MENU, crest, News, Wydad TV | search, sign in, tickets,
 * shop, language), transparent over the homepage hero and dark everywhere else or once scrolled.
 * The bar stays pinned at the top (sticky).
 */
export function SiteHeader({ data }: { data: HeaderData }) {
  const t = useTranslations('header');
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname === '';
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // "/" or Cmd/Ctrl+K opens search, unless the visitor is typing somewhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
      if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const transparent = isHome && !scrolled;

  return (
    <>
      <a
        href="#main"
        className="fixed start-4 top-2 z-[80] -translate-y-24 rounded-lg bg-wydad-logo px-4 py-2.5 font-semibold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        {t('skip')}
      </a>

      <header className="sticky top-0 z-50">

        {/* Zero-height layer: on the homepage the hero runs underneath the bar */}
        <div className="relative h-0">
          <div
            className={`absolute inset-x-0 top-0 ${BAR_H} transition-[background-color,box-shadow] duration-300 motion-reduce:transition-none ${
              transparent ? 'bg-gradient-to-b from-black/60 to-transparent' : 'bg-wydad-logo shadow-[0_2px_12px_rgb(0_0_0/0.12)]'
            }`}
          >
            <div className="flex h-full items-stretch">
              <button
                ref={menuButton}
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label={t('menu')}
                aria-expanded={menuOpen}
                aria-haspopup="dialog"
                className={`flex w-16 shrink-0 flex-col items-center justify-center gap-1 text-white transition-colors lg:w-[88px] ${
                  transparent ? 'hover:bg-white/10' : 'bg-wydad-red-dark hover:bg-black/20'
                }`}
              >
                <MenuIcon size={24} />
                <span className="font-condensed text-[11px] font-bold uppercase leading-none tracking-[0.14em]">{t('menu')}</span>
              </button>

              <div className="flex min-w-0 flex-1 items-center gap-3 ps-3 pe-2 sm:ps-5 lg:gap-8 lg:ps-8 lg:pe-6">
                <Link href="/" aria-label={t('home_label')} className="shrink-0 transition-transform hover:scale-[1.04]">
                  <Image src="/images/wydad-crest.svg" alt="Wydad Athletic Club" width={40} height={51} className="h-11 w-auto lg:h-[52px]" priority />
                </Link>

                <nav aria-label={t('main_nav')} className="hidden h-full md:block">
                  <ul className="flex h-full items-center gap-8">
                    {data.bar.map((l) => {
                      const active = isActive(pathname, l.href);
                      return (
                        <li key={l.key} className="h-full">
                          <Link href={l.href} aria-current={active ? 'page' : undefined} className={barLink}>
                            {l.label ?? t(l.key)}
                            {active && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-wydad-logo" aria-hidden />}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="ms-auto flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    aria-label={t('search')}
                    aria-haspopup="dialog"
                    aria-keyshortcuts="/ Control+K Meta+K"
                    className="flex h-11 w-11 items-center justify-center rounded text-white transition-colors hover:bg-white/10"
                  >
                    <SearchIcon size={21} />
                  </button>
                  <SmartLink href={SIGN_IN_URL} className={`${pill} hidden text-white hover:bg-white/10 lg:flex`}>
                    <UserIcon size={20} />
                    {t('sign_in')}
                  </SmartLink>
                  <SmartLink href={TICKETS_PAGE} className={`${pill} bg-white text-wydad-logo hover:bg-white/90`}>
                    <TicketIcon size={18} className="sm:hidden" />
                    <span className="sr-only sm:not-sr-only">{t('tickets')}</span>
                  </SmartLink>
                  <SmartLink href={BRAND_URL} className={`${pill} hidden bg-white/15 text-white hover:bg-white/25 sm:flex`}>
                    {t('brand_short')}
                  </SmartLink>
                  <div className="hidden md:block">
                    <LanguageSelector tone="light" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Reserve the bar's space on pages without a full-bleed hero */}
      {!isHome && <div className={BAR_H} aria-hidden />}

      <MenuPanel menu={data.menu} open={menuOpen} onClose={() => setMenuOpen(false)} trigger={menuButton} />
      {searchOpen && <SearchDialog index={data.search} onClose={() => setSearchOpen(false)} />}
    </>
  );
}
