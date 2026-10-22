import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';

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
    <div className="bg-[#0d0c0f] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -start-40 top-10 h-[520px] w-[520px] rounded-full bg-[#E8C468]/10 blur-[140px]" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:px-8">
          <div>
            <p className={`font-condensed text-sm font-bold uppercase tracking-[0.2em] ${GOLD}`}>{t('kicker')}</p>
            <h1 className={`mt-4 font-condensed text-7xl font-extrabold uppercase leading-[0.85] sm:text-8xl ${GOLD}`} dir="ltr">
              Gold
              <br />
              Member<span className="font-semibold italic">ship</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/75">{t('intro')}</p>

            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-px overflow-hidden rounded-xl bg-[#E8C468]/25 ring-1 ring-[#E8C468]/25">
              <div className="bg-[#0d0c0f] p-5">
                <dt className="font-condensed text-xs font-bold uppercase tracking-[0.14em] text-white/50">{t('price_label')}</dt>
                <dd className={`mt-1 whitespace-nowrap font-condensed text-3xl font-extrabold tabular-nums sm:text-4xl ${GOLD}`} dir="ltr">
                  1&nbsp;000&nbsp;000 <span className="text-xl sm:text-2xl">DH</span>
                </dd>
              </div>
              <div className="bg-[#0d0c0f] p-5">
                <dt className="font-condensed text-xs font-bold uppercase tracking-[0.14em] text-white/50">{t('launch_label')}</dt>
                <dd className="mt-1 font-condensed text-2xl font-bold">{t('launch_value')}</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <Image
              src="/images/membership/gold-membership.jpg"
              alt={t('poster_alt')}
              width={1600}
              height={2000}
              priority
              sizes="(min-width: 1024px) 448px, 90vw"
              className="h-auto w-full rounded-2xl shadow-[0_40px_100px_rgb(232_196_104/0.18)] ring-1 ring-[#E8C468]/30"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section aria-labelledby="gold-benefits" className="border-y border-[#E8C468]/15 bg-[#121015]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 id="gold-benefits" className={`font-condensed text-4xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-5xl ${GOLD}`}>
            {t('benefits_title')}
          </h2>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-[#E8C468]/15 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b, i) => (
              <li key={b} className="bg-[#121015] p-6">
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
        </div>
      </section>
    </div>
  );
}
