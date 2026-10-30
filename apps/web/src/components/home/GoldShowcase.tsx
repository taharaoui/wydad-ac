import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { GoldCardStage } from '@/components/gold/GoldCardStage';

/** Gold ink from the membership artwork */
const GOLD = 'text-[#E8C468]';

/**
 * Home page showcase of the Gold Membership: the same card film as the membership page
 * (GoldCardStage, which plays only on screen and falls back to a still for reduced motion),
 * on a black-to-burgundy stage, with a CTA to /gold-membership.
 */
export async function GoldShowcase({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  const tGold = await getTranslations({ locale, namespace: 'gold' });

  return (
    <section aria-labelledby="gold-showcase" className="relative isolate overflow-hidden bg-[#0b0a0d] text-white">
      {/* Cinematic light: burgundy glow behind the card, red edge, gold hairlines */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_50%,#5c0d12_0%,#2a070a_38%,#0b0a0d_72%)]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E8C468]/60 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#E8C468]/40 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute -start-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-wydad-logo/25 blur-[110px]" aria-hidden />

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6 lg:px-8">
        <div className="order-2 lg:order-1">
          <p className={`font-condensed text-sm font-bold uppercase tracking-[0.24em] ${GOLD}`}>Gold Membership</p>
          <h2 id="gold-showcase" className="mt-4 font-condensed text-5xl font-extrabold uppercase leading-[0.9] sm:text-7xl">
            {t('gold_title_1')}
            <span className="block bg-gradient-to-b from-[#F6E3A1] via-[#E8C468] to-[#B8892F] bg-clip-text text-transparent">{t('gold_title_2')}</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">{t('gold_text')}</p>

          <ul className="mt-7 flex flex-wrap gap-2">
            {(['box', 'hospitality', 'team_experiences'] as const).map((b) => (
              <li key={b} className="inline-flex items-center gap-2 rounded-full border border-[#E8C468]/30 bg-white/[0.04] px-3.5 py-1.5 text-sm text-white/85">
                <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-[#E8C468]" aria-hidden />
                {tGold(`benefit_${b}`)}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
            <Link
              href="/gold-membership"
              className="group inline-flex min-h-12 items-center gap-2 bg-gradient-to-b from-[#F3D98A] to-[#C9A24A] px-7 font-condensed text-lg font-extrabold uppercase tracking-wide text-[#1a1407] shadow-[0_10px_30px_rgb(232_196_104/0.25)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E8C468]/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              {t('gold_cta')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
            <p className="font-condensed uppercase tracking-[0.14em] text-white/55">
              {tGold('first_owner_kicker')} · <span className="text-white">{tGold('first_owner_name')}</span>
            </p>
          </div>
        </div>

        <div className="order-1 mx-auto w-full max-w-[460px] lg:order-2 lg:max-w-[520px]">
          <GoldCardStage alt={tGold('card_alt')} />
        </div>
      </div>
    </section>
  );
}
