import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/config';
import { SECTION_ROUTES, bundledHighlights, getSection, getSectionFeed } from '@/lib/sections';
import { getGallery, getSectionHighlights } from '@/lib/cms/club';
import { InstagramFeedGrid } from '@/components/sections/InstagramFeedGrid';
import { SectionHighlights } from '@/components/sections/SectionHighlights';

export const revalidate = 3600;

export function generateStaticParams() {
  return locales.flatMap((locale) => SECTION_ROUTES.map((sport) => ({ locale, sport })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; sport: string }> }) {
  const { locale, sport } = await params;
  if (!SECTION_ROUTES.includes(sport as never)) return {};
  const t = await getTranslations({ locale, namespace: 'sections' });
  return { title: t(`${sport}.title`), description: t(`${sport}.intro`) };
}

/** A club section (swimming, boxing, fencing, handball, women's football, academy) from its official account */
export default async function SectionPage({ params }: { params: Promise<{ locale: string; sport: string }> }) {
  const { locale, sport } = await params;
  const section = getSection(sport);
  if (!section || !SECTION_ROUTES.includes(section.key)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'sections' });
  const [feed, cmsHighlights, archives] = await Promise.all([
    getSectionFeed(section),
    getSectionHighlights(section.key, locale),
    section.gallery ? getGallery(`${section.key}-archives`, locale) : Promise.resolve([]),
  ]);
  const highlights = cmsHighlights ?? bundledHighlights(section, (key) => t(key as never));
  const k = section.key;

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-surface-dark text-white">
        <Image src={section.hero} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-55" style={{ objectPosition: section.heroPosition }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/40 to-black/20" aria-hidden />
        <div className="mx-auto flex min-h-[460px] max-w-7xl flex-col justify-end px-4 pb-14 pt-32 sm:min-h-[540px] sm:px-6 sm:pb-20 lg:px-8">
          <p className="font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white/80">{t('kicker')}</p>
          <h1 className="mt-3 font-condensed text-6xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-8xl">{t(`${k}.title`)}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">{t(`${k}.intro`)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`https://www.instagram.com/${section.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-lg bg-white px-5 font-condensed text-lg font-bold uppercase text-wydad-logo transition-colors hover:bg-white/90"
            >
              Instagram
            </a>
            {section.facebook && (
              <a
                href={section.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-white/40 px-5 font-condensed text-lg font-bold uppercase text-white transition-colors hover:bg-white/10"
              >
                Facebook
              </a>
            )}
          </div>
        </div>
      </section>

      {section.staff && (
        <div className="border-b border-border bg-surface-secondary">
          <dl className="mx-auto grid max-w-7xl gap-x-8 gap-y-5 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {section.staff.map((s) => (
              <div key={s.role}>
                <dt className="font-condensed text-sm font-bold uppercase tracking-[0.12em] text-wydad-red">{t(`staff_${s.role}`)}</dt>
                <dd className="mt-1 font-semibold text-fg">{s.name}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <SectionHighlights items={highlights} locale={locale} />

        <InstagramFeedGrid feed={feed} title={t('latest')} />

        {section.gallery && archives.length > 0 && (
          <section aria-labelledby="gallery-title">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="gallery-title" className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-5xl">
                  {t(`${k}.gallery_title`)}
                </h2>
                <p className="mt-3 max-w-2xl text-fg-secondary">{t(`${k}.gallery_text`)}</p>
              </div>
              <a href={section.gallery.url} target="_blank" rel="noopener noreferrer" className="font-condensed text-lg font-bold uppercase text-wydad-red hover:underline">
                {t('more_photos')}
              </a>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
              {archives.map(({ src, caption }) => (
                <li key={src} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-secondary">
                  <Image src={src} alt={caption ?? ""} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover sepia-[.15]" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
