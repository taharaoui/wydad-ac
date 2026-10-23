import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TICKETS_URL } from '@/lib/links';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tickets' });
  return { title: t('title') };
}

/**
 * Official ticketing (wydad.ticketing.ma) embedded in the club site, so fans stay on it.
 * The platform's session cookies are not SameSite=None, so browsers that block third-party cookies
 * (Safari, some Chrome setups) may break sign-in or checkout inside the frame: an "open in a new
 * tab" button is always offered as a fallback.
 */
export default async function TicketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'tickets' });

  return (
    <div className="flex flex-col bg-surface">
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="font-condensed text-3xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-4xl">{t('title')}</h1>
            <p className="mt-1 text-sm text-fg-secondary">{t('subtitle')}</p>
          </div>
          <a
            href={TICKETS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold text-fg transition-colors hover:border-wydad-logo hover:text-wydad-red"
          >
            {t('open_new_tab')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </a>
        </div>
      </div>
      {/* Fills the viewport below the 64–72px header and the title bar */}
      <iframe
        src={TICKETS_URL}
        title={t('frame_title')}
        className="block h-[calc(100dvh-64px-88px)] min-h-[600px] w-full border-0 lg:h-[calc(100dvh-72px-88px)]"
        allow="payment; clipboard-write"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
