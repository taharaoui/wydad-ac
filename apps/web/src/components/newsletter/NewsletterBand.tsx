import { getTranslations } from 'next-intl/server';
import { NewsletterForm } from './NewsletterForm';

/** Red signup band for the home page (and other pages) */
export async function NewsletterBand({ locale, source }: { locale: string; source: string }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  return (
    <section aria-labelledby="nl-band" className="relative overflow-hidden rounded-2xl bg-wydad-logo px-6 py-10 text-white sm:px-10 sm:py-12">
      <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div>
          <h2 id="nl-band" className="font-condensed text-4xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-5xl">{t('newsletter_title')}</h2>
          <p className="mt-3 max-w-md text-white/85">{t('newsletter_text')}</p>
        </div>
        <NewsletterForm variant="compact" source={source} tone="dark" />
      </div>
    </section>
  );
}
