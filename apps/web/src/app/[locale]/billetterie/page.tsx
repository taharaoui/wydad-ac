import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TICKETS_URL } from '@/lib/links';
import { getTicketEvents } from '@/lib/ticketing';

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tickets' });
  return { title: t('title') };
}

const ExternalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

/**
 * Matches on sale, shown on the club site; buying (sign-in, seats, CMI payment) happens on the
 * official ticketing platform, which embeds badly (blocked cookies, 3-D Secure in frames).
 */
export default async function TicketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'tickets' });
  const events = await getTicketEvents();
  const open = events.filter((e) => e.buyUrl);
  const closed = events.filter((e) => !e.buyUrl);

  const card = (e: (typeof events)[number]) => (
    <li key={`${e.title}-${e.date}`} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="relative aspect-[4/5] bg-surface-secondary">
        {e.image && <Image src={e.image} alt={e.title} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />}
        {!e.buyUrl && <div className="absolute inset-0 bg-white/40" aria-hidden />}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-condensed text-2xl font-extrabold uppercase leading-tight text-fg">{e.title}</h3>
        <p className="mt-1 text-sm capitalize text-fg-secondary">{e.date}</p>
        <p className="text-sm text-fg-muted">{e.venue}</p>
        {e.price && <p className="mt-3 font-condensed text-lg font-bold text-fg">{e.price}</p>}
        <div className="mt-auto pt-5">
          {e.buyUrl ? (
            <a
              href={e.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-wydad-logo font-condensed text-lg font-bold uppercase tracking-wide text-white transition-colors hover:bg-wydad-red-hover"
            >
              {t('buy')}
              <ExternalIcon />
              <span className="sr-only"> {t('new_tab')}</span>
            </a>
          ) : (
            <span className="flex min-h-12 w-full items-center justify-center rounded-md bg-surface-secondary font-condensed text-lg font-bold uppercase tracking-wide text-fg-muted">
              {e.status || t('sale_closed')}
            </span>
          )}
        </div>
      </div>
    </li>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-condensed text-6xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-7xl">{t('title')}</h1>
          <p className="mt-3 max-w-2xl text-lg text-fg-secondary">{t('subtitle')}</p>
        </div>
        <a
          href={TICKETS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-semibold text-fg transition-colors hover:border-wydad-logo hover:text-wydad-red"
        >
          {t('platform')}
          <ExternalIcon />
        </a>
      </div>

      <section aria-labelledby="on-sale" className="mt-12">
        <h2 id="on-sale" className="font-condensed text-3xl font-extrabold uppercase italic text-fg rtl:not-italic">{t('on_sale')}</h2>
        {open.length > 0 ? (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{open.map(card)}</ul>
        ) : (
          <p className="mt-4 rounded-xl bg-surface-secondary/70 p-6 text-fg-secondary">{t('none_on_sale')}</p>
        )}
      </section>

      {closed.length > 0 && (
        <section aria-labelledby="past-sales" className="mt-16">
          <h2 id="past-sales" className="font-condensed text-3xl font-extrabold uppercase italic text-fg rtl:not-italic">{t('past')}</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{closed.slice(0, 6).map(card)}</ul>
        </section>
      )}

      <p className="mt-14 text-sm text-fg-muted">{t('note')}</p>
    </div>
  );
}
