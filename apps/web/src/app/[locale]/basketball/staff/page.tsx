import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BASKETBALL_STAFF } from '@/lib/basketball';
import { PendingNotice, SectionPage } from '@/components/basketball/SectionPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'basketball' });
  return { title: `${t('staff')} · ${t('title')}` };
}

export default async function BasketballStaffPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'basketball' });
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';
  const staff = [...BASKETBALL_STAFF].sort((a, b) => Number(!!b.head) - Number(!!a.head));

  return (
    <SectionPage active="staff" title={t('staff')} season={t('season')}>
      {staff.length === 0 ? (
        <PendingNotice text={t('staff_pending')} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((m) => (
            <li key={m.name} className={`rounded-xl p-5 ${m.head ? 'bg-wydad-logo text-white' : 'bg-surface-secondary/70'}`}>
              <p className={`font-condensed text-xs font-bold uppercase tracking-[0.12em] ${m.head ? 'text-white/80' : 'text-wydad-red'}`}>{m.role[lang]}</p>
              <p className="mt-1 font-condensed text-2xl font-extrabold uppercase leading-tight">{lang === 'ar' && m.name_ar ? m.name_ar : m.name}</p>
            </li>
          ))}
        </ul>
      )}
    </SectionPage>
  );
}
