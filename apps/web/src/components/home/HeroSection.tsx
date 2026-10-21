'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function HeroSection() {
  const t = useTranslations('home');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-black sm:min-h-screen">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://cdn.wallpapersafari.com/52/88/EQSnvB.jpg')`,
        }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent rtl:bg-gradient-to-l" />

      {/* Content */}
      <div className="relative flex min-h-[85vh] items-end sm:min-h-screen">
        <div className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8 lg:pb-40">
          {/* Headline — PSG-style bold italic uppercase */}
          <h1
            className="max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.95] text-white sm:text-5xl md:text-6xl lg:text-7xl animate-slide-up"
            style={{ fontStyle: 'italic' }}
          >
            {t('hero_title')}
          </h1>

          {/* CTA */}
          <div className="mt-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Link
              href="/news"
              className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/90 transition-colors hover:text-white"
            >
              {tCommon('learn_more')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom fade to page content */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-surface to-transparent" />
    </section>
  );
}
