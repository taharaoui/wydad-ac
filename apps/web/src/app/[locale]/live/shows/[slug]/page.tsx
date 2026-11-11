import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { findCreator, getLiveHub, showEpisodes } from '@/lib/live';
import { DemoChip, EpisodeCard, LiveBadge, toLang, type CardLabels } from '@/components/live/parts';

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const show = (await getLiveHub()).shows.find((s) => s.slug === slug);
  return show ? { title: show.title[toLang(locale)], description: show.description[toLang(locale)] } : {};
}

/** A show: banner, hosts, live / upcoming / replays */
export default async function ShowPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'live' });
  const lang = toLang(locale);
  const hub = await getLiveHub();
  const show = hub.shows.find((s) => s.slug === slug);
  if (!show) notFound();
  const episodes = showEpisodes(hub, slug);
  const isLive = episodes.some((e) => e.status === 'live');
  const creators = show.creatorSlugs.map((s) => findCreator(hub, s)).filter((c) => !!c);
  const labels: CardLabels = { live: t('live_now'), upcoming: t('upcoming'), demo: t('demo'), views: (n) => t('views', { n }) };

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-wydad-charcoal text-white">
        {show.cover ? (
          <Image src={show.cover} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,#d21f26_0%,#7a1218_40%,#171719_100%)]" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-wydad-charcoal to-transparent" />
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 lg:px-8">
          <Link href="/live" className="text-sm font-semibold text-white/60 hover:text-white">
            ← {t('title')}
          </Link>
          <div className="mt-16 flex flex-wrap items-center gap-2">
            <span className="font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white/70">{t(`cat_${show.category}`)}</span>
            {isLive && <LiveBadge label={t('live_now')} size="lg" />}
            {show.demo && <DemoChip label={t('demo')} />}
          </div>
          <h1 className="mt-2 font-condensed text-6xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-8xl">{show.title[lang]}</h1>
          <p className="mt-3 font-condensed text-xl font-bold uppercase text-white/80">
            {show.tagline[lang]}
            {show.slot ? ` · ${show.slot[lang]}` : ''}
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">{show.description[lang]}</p>
          {creators.length > 0 && (
            <p className="mt-5 text-white/70">
              {t('hosted_by')}{' '}
              {creators.map((c, i) => (
                <span key={c!.slug}>
                  {i > 0 && ', '}
                  <Link href={`/live/creators/${c!.slug}`} className="font-semibold text-white underline-offset-4 hover:underline">
                    {c!.name}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        {episodes.length === 0 ? (
          <p className="rounded-xl bg-surface-secondary/70 px-6 py-10 text-center text-fg-secondary">{t('no_replays')}</p>
        ) : (
          <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.slice(0, 24).map((e) => (
              <li key={e.id}>
                <EpisodeCard episode={e} show={show} locale={locale} labels={labels} />
              </li>
            ))}
          </ul>
        )}
        {show.demo && <p className="mt-10 rounded-xl bg-surface-secondary/70 px-5 py-4 text-sm text-fg-secondary">{t('demo_note')}</p>}
      </div>
    </div>
  );
}
