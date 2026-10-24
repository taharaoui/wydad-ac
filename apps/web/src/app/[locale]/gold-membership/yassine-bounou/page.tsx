import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

/** Gold ink from the membership artwork */
const GOLD = 'text-[#E8C468]';

/**
 * Cover photo of the Winners 2005 tifo "El Mítico" (Wydad – Sevilla, 2025). Drop the file at this path
 * and the cover shows it; until then a placeholder holds its place.
 */
const TIFO = '/images/membership/tifo-el-mitico.webp';
const hasTifo = fs.existsSync(path.join(process.cwd(), 'public', TIFO));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'bounou' });
  return {
    title: t('title'),
    description: t('intro'),
    openGraph: { images: [hasTifo ? TIFO : '/images/membership/gold-bounou.jpg'] },
  };
}

/** Yassine Bounou, first Gold Member: the Winners 2005 tifo "El Mítico" and his Gold Membership */
export default async function BounouPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'bounou' });
  const tGold = await getTranslations({ locale, namespace: 'gold' });

  return (
    <div className="bg-surface-dark text-white">
      {/* Cover: the tifo */}
      <section className="relative isolate overflow-hidden bg-[#0b0a0d]">
        <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
          {hasTifo ? (
            <Image src={TIFO} alt={t('tifo_alt')} fill priority sizes="100vw" className="object-cover" />
          ) : (
            // Placeholder until the tifo photo is added
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,#8a1016_0%,#3a0709_55%,#0b0a0d_100%)]" role="img" aria-label={t('tifo_alt')}>
              <svg viewBox="0 0 400 120" className="pointer-events-none absolute inset-x-0 bottom-0 w-full text-white/[0.06]" aria-hidden preserveAspectRatio="none">
                {Array.from({ length: 40 }, (_, i) => (
                  <rect key={i} x={i * 10} y={40 + ((i * 7) % 30)} width="8" height="80" fill="currentColor" />
                ))}
              </svg>
              <p className="relative px-6 text-center font-condensed text-6xl font-extrabold uppercase italic leading-none text-white/90 drop-shadow sm:text-8xl lg:text-9xl">El Mítico</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a0d] via-[#0b0a0d]/20 to-transparent" aria-hidden />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8">
              <p className={`font-condensed text-sm font-bold uppercase tracking-[0.2em] ${GOLD}`}>{t('kicker')}</p>
              <h1 className="mt-3 font-condensed text-6xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-8xl">Yassine Bounou</h1>
            </div>
          </div>
        </div>
        <p className="mx-auto max-w-7xl px-4 pb-2 text-xs text-white/45 sm:px-6 lg:px-8">{t('tifo_caption')}</p>
      </section>

      {/* El Mítico */}
      <section aria-labelledby="mitico" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <p className={`font-condensed text-sm font-bold uppercase tracking-[0.2em] ${GOLD}`}>Winners 2005 · 2025</p>
        <h2 id="mitico" className="mt-3 font-condensed text-5xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-6xl">
          «&nbsp;El Mítico&nbsp;»
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-white/80">{t('intro')}</p>
        <p className="mt-4 text-lg leading-relaxed text-white/70">{t('tifo_text')}</p>
      </section>

      {/* Gold Member n°1 */}
      <section aria-labelledby="gold-first" className="border-t border-[#E8C468]/15 bg-surface-dark-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="relative mx-auto w-full max-w-md lg:order-2">
            <Image
              src="/images/membership/gold-bounou.jpg"
              alt={tGold('first_owner_alt')}
              width={1152}
              height={1440}
              sizes="(min-width: 1024px) 448px, 90vw"
              className="h-auto w-full rounded-2xl ring-1 ring-white/10"
            />
          </div>
          <div className="lg:order-1">
            <p className={`font-condensed text-sm font-bold uppercase tracking-[0.2em] ${GOLD}`}>{tGold('first_owner_kicker')}</p>
            <h2 id="gold-first" className="mt-3 font-condensed text-4xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-5xl">
              Gold Membership
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">{tGold('first_owner_text')}</p>
            <Link
              href="/gold-membership"
              className="mt-8 inline-flex min-h-12 items-center bg-gradient-to-b from-[#F3D98A] to-[#C9A24A] px-7 font-condensed text-lg font-extrabold uppercase tracking-wide text-[#1a1407] transition-transform hover:-translate-y-0.5"
            >
              {t('back_to_gold')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
