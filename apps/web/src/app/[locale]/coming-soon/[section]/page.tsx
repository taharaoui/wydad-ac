import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { TICKETS_URL } from '@/lib/links';
import { locales } from '@/i18n/config';

/** Sections linked from the header that have no page yet (see lib/navigation-config.ts) */
const SECTIONS = { shop: 'shop', brand: 'brand', store: 'store', academy: 'academy', swimming: 'swimming', 'water-polo': 'water_polo', 'table-tennis': 'table_tennis', boxing: 'boxing', fencing: 'fencing' } as const;
type Section = keyof typeof SECTIONS;

export function generateStaticParams() {
  return locales.flatMap((locale) => Object.keys(SECTIONS).map((section) => ({ locale, section })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!(section in SECTIONS)) return {};
  const t = await getTranslations({ locale, namespace: 'header' });
  return { title: t(SECTIONS[section as Section]), robots: { index: false } };
}

export default async function ComingSoonPage({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!(section in SECTIONS)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'soon' });
  const tHeader = await getTranslations({ locale, namespace: 'header' });

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:py-28">
      <Image src="/images/wydad-crest.svg" alt="" width={64} height={81} className="h-20 w-auto" />
      <h1 className="mt-8 font-condensed text-4xl font-extrabold uppercase leading-none text-fg sm:text-5xl">
        {t('title', { section: tHeader(SECTIONS[section as Section]) })}
      </h1>
      <p className="mt-5 max-w-lg text-body-md text-fg-secondary">{t('text')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-lg bg-wydad-logo px-5 font-condensed text-lg font-bold uppercase text-white hover:bg-wydad-red-hover">
          {t('home')}
        </Link>
        <a href={TICKETS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 font-condensed text-lg font-bold uppercase text-fg hover:border-wydad-logo hover:text-wydad-red">
          {t('tickets')}
          <span className="sr-only"> {tHeader('new_tab')}</span>
        </a>
      </div>
    </div>
  );
}
