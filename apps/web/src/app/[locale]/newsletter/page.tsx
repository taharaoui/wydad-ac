import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { NewsletterForm } from '@/components/newsletter/NewsletterForm';
import { TOPICS } from '@/lib/newsletter/schema';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'newsletter' });
  return { title: t('title'), description: t('intro') };
}

/** Newsletter landing: editorial pitch, topic picker, consent */
export default async function NewsletterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'newsletter' });

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-wydad-logo text-white">
        <Image src="/images/club/stade-mohammed-v.webp" alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-25 mix-blend-multiply" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:px-8">
          <div>
            <p className="font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white/75">{t('kicker')}</p>
            <h1 className="mt-3 font-condensed text-6xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-8xl">{t('title')}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{t('intro')}</p>
            <h2 className="mt-10 font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white/75">{t('what')}</h2>
            <ul className="mt-3 grid max-w-lg gap-2 sm:grid-cols-2">
              {TOPICS.map((k) => (
                <li key={k} className="flex items-center gap-2.5 text-white/90">
                  <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-white" aria-hidden />
                  {t(`t_${k}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="self-center rounded-2xl bg-white p-6 text-fg shadow-2xl sm:p-8">
            <NewsletterForm variant="full" source="newsletter-page" />
          </div>
        </div>
      </section>
    </div>
  );
}
