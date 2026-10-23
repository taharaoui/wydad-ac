import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { SectionConfig } from '@/lib/sections';

/** "À la une": the section's notable news, each retelling a post and linking to it. */
export async function SectionHighlights({ section, locale }: { section: SectionConfig; locale: string }) {
  const t = await getTranslations('sections');
  if (section.highlights.length === 0) return null;
  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MA-u-nu-latn' : locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso));

  return (
    <section aria-labelledby="highlights-title">
      <h2 id="highlights-title" className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-5xl">
        {t('highlights')}
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {section.highlights.map((h) => (
          <article key={h.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-secondary">
              <Image src={h.image} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <time dateTime={h.date} className="text-sm text-fg-muted">{date(h.date)}</time>
              <h3 className="mt-2 font-condensed text-2xl font-extrabold uppercase leading-tight text-fg">{t(`${section.key}.${h.id}_title`)}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-fg-secondary">{t(`${section.key}.${h.id}_text`)}</p>
              <a
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  h.cta
                    ? 'mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-wydad-logo px-5 font-condensed text-lg font-bold uppercase text-white transition-colors hover:bg-wydad-red-hover'
                    : 'mt-5 inline-flex items-center gap-1.5 font-condensed text-lg font-bold uppercase text-wydad-red hover:underline'
                }
              >
                {h.cta ? t(h.cta) : t('see_post')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180" aria-hidden>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
