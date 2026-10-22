import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FootballNav } from '@/components/team/FootballNav';
import { HonoursList } from '@/components/club/HonoursList';
import { TROPHIES_INTERNATIONAL, TROPHIES_NATIONAL } from '@/lib/club-info';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'football' });
  return { title: t('honours') };
}

export default async function FootballHonoursPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'football' });
  const tClub = await getTranslations({ locale, namespace: 'club' });
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';
  const total = [...TROPHIES_NATIONAL, ...TROPHIES_INTERNATIONAL].reduce((n, tr) => n + tr.years.length, 0);

  return (
    <div>
      <FootballNav active="honours" />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <h1 className="font-condensed text-6xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-7xl">{t('honours')}</h1>
        <p className="mt-3 font-condensed text-2xl font-bold text-fg">{t('total_titles', { count: total })}</p>
        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <HonoursList title={tClub('honours_national')} trophies={TROPHIES_NATIONAL} lang={lang} />
          <HonoursList title={tClub('honours_international')} trophies={TROPHIES_INTERNATIONAL} lang={lang} />
        </div>
      </div>
    </div>
  );
}
