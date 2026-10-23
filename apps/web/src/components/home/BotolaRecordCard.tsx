import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/** Botola 2026-27 card: club and league crests, and the club's title record */
export function BotolaRecordCard() {
  const t = useTranslations('matches');
  return (
    <Link
      href="/standings"
      className="group relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-wydad-logo to-[#7d0f12] p-6 text-white"
    >
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/clubs/tm_805667.svg" alt="Wydad Athletic Club" className="h-16 w-auto drop-shadow transition-transform duration-500 group-hover:scale-105" />
        <span className="h-10 w-px bg-white/30" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/competitions/botola-pro-emblem.svg" alt="Botola Pro" className="h-14 w-auto brightness-0 invert" />
      </div>
      <div className="mt-5">
        <p className="font-condensed text-xs font-bold uppercase tracking-[0.16em] text-white/75">{t('record_label')}</p>
        <p className="mt-1 flex items-baseline gap-2 font-condensed font-extrabold uppercase leading-none">
          <span className="text-6xl tabular-nums">22</span>
          <span className="text-2xl">{t('record_titles')}</span>
        </p>
        <p className="mt-2 text-sm text-white/85">{t('record_gap')}</p>
      </div>
      <span className="mt-5 inline-flex items-center gap-1 font-condensed text-lg font-bold uppercase underline underline-offset-4 group-hover:no-underline">
        {t('see_botola')}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180" aria-hidden>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </span>
    </Link>
  );
}
