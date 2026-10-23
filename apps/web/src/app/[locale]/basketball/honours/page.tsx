import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BASKETBALL_HONOURS } from '@/lib/basketball';
import { HonoursList } from '@/components/club/HonoursList';
import { PendingNotice, SectionPage } from '@/components/basketball/SectionPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'basketball' });
  return { title: `${t('honours')} · ${t('title')}` };
}

export default async function BasketballHonoursPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'basketball' });
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';

  return (
    <SectionPage active="honours" title={t('honours')} season={t('title')}>
      {BASKETBALL_HONOURS.length === 0 ? (
        <PendingNotice text={t('honours_pending')} />
      ) : (
        <HonoursList title={t('honours')} trophies={BASKETBALL_HONOURS} lang={lang} />
      )}
    </SectionPage>
  );
}
