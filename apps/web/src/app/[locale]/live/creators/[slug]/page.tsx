import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { findCreator, getLiveHub } from '@/lib/live';
import { DemoChip, toLang } from '@/components/live/parts';

export const revalidate = 300;

/** A creator: profile, links and the shows they host */
export default async function CreatorPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'live' });
  const lang = toLang(locale);
  const hub = await getLiveHub();
  const creator = findCreator(hub, slug);
  if (!creator) notFound();
  const shows = hub.shows.filter((s) => s.creatorSlugs.includes(slug));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/live" className="text-sm font-semibold text-fg-muted hover:text-fg">
        ← {t('title')}
      </Link>
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <span className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-wydad-logo ring-4 ring-wydad-logo/20">
          {creator.avatar ? <Image src={creator.avatar} alt="" fill sizes="112px" className="object-contain p-3" /> : <span className="font-condensed text-5xl font-extrabold text-white">?</span>}
        </span>
        <div className="min-w-0">
          <p className="font-condensed text-sm font-bold uppercase tracking-[0.16em] text-wydad-red">{creator.role[lang]}</p>
          <h1 className="mt-1 font-condensed text-5xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-6xl">{creator.name}</h1>
          {creator.demo && (
            <span className="mt-3 inline-block">
              <span className="rounded border border-dashed border-fg-muted px-1.5 py-0.5 font-condensed text-xs font-bold uppercase text-fg-muted">{t('demo')}</span>
            </span>
          )}
        </div>
      </div>
      <p className="mt-8 max-w-2xl text-lg leading-relaxed text-fg-secondary">{creator.bio[lang]}</p>
      {creator.links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {creator.links.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg bg-wydad-logo px-5 font-condensed text-lg font-bold uppercase text-white hover:bg-wydad-red-hover">
              {l.label}
            </a>
          ))}
        </div>
      )}
      {shows.length > 0 && (
        <section className="mt-12" aria-labelledby="creator-shows">
          <h2 id="creator-shows" className="font-condensed text-3xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">{t('shows')}</h2>
          <ul className="mt-5 divide-y divide-border rounded-2xl border border-border bg-surface">
            {shows.map((s) => (
              <li key={s.slug}>
                <Link href={`/live/shows/${s.slug}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-secondary/60">
                  <span>
                    <span className="block font-semibold text-fg">{s.title[lang]}</span>
                    <span className="block text-sm text-fg-muted">{s.tagline[lang]}</span>
                  </span>
                  {s.demo && <span className="shrink-0 rounded border border-dashed border-fg-muted px-1.5 py-0.5 font-condensed text-xs font-bold uppercase text-fg-muted">{t('demo')}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
