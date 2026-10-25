import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export const dynamic = 'force-dynamic';

/** Landing after the confirmation link: success, or an expired / used link */
export default async function ConfirmedPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ status?: string }> }) {
  const { locale } = await params;
  const { status } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'newsletter' });
  const ok = status !== 'invalid';
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <span className={`flex h-16 w-16 items-center justify-center rounded-full ${ok ? 'bg-wydad-logo text-white' : 'bg-surface-secondary text-fg-muted'}`} aria-hidden>
        {ok ? '✓' : '!'}
      </span>
      <h1 className="mt-6 font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">{t(ok ? 'confirmed_title' : 'invalid_link')}</h1>
      <p className="mt-4 text-fg-secondary">{t(ok ? 'confirmed_text' : 'invalid_link_text')}</p>
      <Link href={ok ? '/' : '/newsletter'} className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-wydad-logo px-6 font-condensed text-lg font-bold uppercase text-white hover:bg-wydad-red-hover">
        {ok ? t('back_home') : t('subscribe')}
      </Link>
    </div>
  );
}
