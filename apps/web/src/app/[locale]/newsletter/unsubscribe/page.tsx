import { getTranslations, setRequestLocale } from 'next-intl/server';
import { UnsubscribeButton } from '@/components/newsletter/UnsubscribeButton';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false } };

/** Unsubscribe link from emails: one click to confirm (no automatic action on GET) */
export default async function UnsubscribePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string }> }) {
  const { locale } = await params;
  const { token = '' } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'newsletter' });
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <h1 className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">{t('unsubscribe_title')}</h1>
      <p className="mt-4 text-fg-secondary">{t('unsubscribe_text')}</p>
      <div className="mt-8">
        <UnsubscribeButton token={token} />
      </div>
    </div>
  );
}
