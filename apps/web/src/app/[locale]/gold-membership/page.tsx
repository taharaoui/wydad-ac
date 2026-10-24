import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { GoldCardStage } from '@/components/gold/GoldCardStage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'gold' });
  return { title: 'Gold Membership', description: t('intro'), openGraph: { images: ['/images/membership/gold-membership.jpg'] } };
}

const BENEFITS = ['box', 'hospitality', 'memorabilia', 'away_tickets', 'team_experiences', 'jersey', 'partner_events', 'privileges'] as const;

/** Gold ink from the membership artwork */
const GOLD = 'text-[#E8C468]';

/** Gold Membership: the club's top-tier membership, launched in the 2026-27 preseason. */
export default async function GoldMembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'gold' });

  return (
    <div className="bg-surface-dark text-white">
      {/* Hero: black stage so the card film (no alpha) blends into the section */}
      <section className="relative overflow-hidden bg-[#0b0a0d]">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#16130d] to-transparent" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6 lg:px-8">
          <div className="order-2 lg:order-1">
            <p className={`font-condensed text-sm font-bold uppercase tracking-[0.24em] ${GOLD}`}>{t('kicker')}</p>
            <h1 className="mt-5 font-condensed text-5xl font-extrabold uppercase leading-[0.9] text-white sm:text-7xl">
              {t('hero_title_1')}
              <span className={`block ${GOLD}`}>{t('hero_title_2')}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">{t('intro')}</p>

            <ul className="mt-8 grid max-w-xl gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {(['box', 'hospitality', 'away_tickets', 'team_experiences'] as const).map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-white/85">
                  <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-[#E8C468]" aria-hidden />
                  {t(`benefit_${b}`)}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-end gap-x-8 gap-y-5">
              <div>
                <p className="font-condensed text-xs font-bold uppercase tracking-[0.16em] text-white/45">{t('price_label')}</p>
                <p className={`mt-1 whitespace-nowrap font-condensed text-4xl font-extrabold tabular-nums ${GOLD}`} dir="ltr">
                  1&nbsp;000&nbsp;000 <span className="text-2xl">DH</span>
                </p>
              </div>
              <a
                href="#gold-benefits"
                className="inline-flex min-h-12 items-center bg-gradient-to-b from-[#F3D98A] to-[#C9A24A] px-7 font-condensed text-lg font-extrabold uppercase tracking-wide text-[#1a1407] shadow-[0_10px_30px_rgb(232_196_104/0.25)] transition-transform hover:-translate-y-0.5"
              >
                {t('cta')}
              </a>
            </div>
            <p className="mt-4 font-condensed text-sm uppercase tracking-[0.14em] text-white/45">
              {t('launch_label')} · {t('launch_value')}
            </p>
          </div>

          <div className="order-1 mx-auto w-full max-w-[560px] lg:order-2">
            <GoldCardStage alt={t('card_alt')} />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section aria-labelledby="gold-benefits" className="border-y border-[#E8C468]/15 bg-surface-dark-secondary">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 id="gold-benefits" className={`font-condensed text-4xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-5xl ${GOLD}`}>
            {t('benefits_title')}
          </h2>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-[#E8C468]/15 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => (
              <li key={b} className="bg-surface-dark-secondary p-6">
                <span className={`font-condensed text-sm font-bold tabular-nums ${GOLD}`}>{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-2 font-condensed text-2xl font-bold uppercase leading-tight">{t(`benefit_${b}`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* First owner */}
      <section aria-labelledby="gold-first" className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="relative mx-auto w-full max-w-md lg:order-2">
          <Image
            src="/images/membership/gold-bounou.jpg"
            alt={t('first_owner_alt')}
            width={1152}
            height={1440}
            sizes="(min-width: 1024px) 448px, 90vw"
            className="h-auto w-full rounded-2xl ring-1 ring-white/10"
          />
        </div>
        <div className="lg:order-1">
          <p className={`font-condensed text-sm font-bold uppercase tracking-[0.2em] ${GOLD}`}>{t('first_owner_kicker')}</p>
          <h2 id="gold-first" className="mt-3 font-condensed text-5xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-7xl">
            {t('first_owner_name')}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">{t('first_owner_text')}</p>
          <Link href="/gold-membership/yassine-bounou" className={`mt-6 inline-flex items-center gap-1.5 font-condensed text-lg font-bold uppercase ${GOLD} hover:underline`}>
            {t('read_story')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180" aria-hidden>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
