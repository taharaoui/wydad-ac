import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { findCreator, getEpisode, showEpisodes } from '@/lib/live';
import { DemoChip, EpisodeCard, LiveBadge, Player, externalWatchUrl, formatWhen, toLang, type CardLabels } from '@/components/live/parts';

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await params;
  const found = await getEpisode(id);
  if (!found) return {};
  return { title: found.episode.title, openGraph: { images: found.episode.thumbnail ? [found.episode.thumbnail] : undefined } };
}

/** One video: player (or the demo notice), its show and hosts, then more videos */
export default async function WatchPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'live' });
  const lang = toLang(locale);
  const found = await getEpisode(id);
  if (!found) notFound();
  const { episode, show, hub } = found;
  const labels: CardLabels = { live: t('live_now'), upcoming: t('upcoming'), demo: t('demo'), views: (n) => t('views', { n }) };
  const sameShow = showEpisodes(hub, episode.showSlug).filter((e) => e.id !== episode.id).slice(0, 4);
  const more = hub.replays.filter((e) => e.id !== episode.id && e.showSlug !== episode.showSlug).slice(0, 4);
  const creators = (show?.creatorSlugs ?? []).map((s) => findCreator(hub, s)).filter((c) => !!c);
  const external = externalWatchUrl(episode);

  return (
    <div>
      <section className="bg-wydad-charcoal text-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6 lg:px-8">
          <Link href="/live" className="text-sm font-semibold text-white/60 hover:text-white">
            ← {t('title')}
          </Link>
          <div className="mt-4">
            {episode.source ? (
              <Player episode={episode} title={episode.title} autoplay={episode.status === 'live'} />
            ) : (
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_top_left,#d21f26_0%,#7a1218_45%,#2a070a_100%)] p-6 text-center ring-1 ring-white/10">
                <Image src="/images/wydad-crest-white.svg" alt="" width={200} height={254} className="absolute -bottom-10 -end-10 h-3/4 w-auto opacity-10" />
                <div className="relative max-w-md">
                  <DemoChip label={t('demo_episode')} />
                  <p className="mt-4 font-condensed text-3xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-4xl">{show?.title[lang]}</p>
                  <p className="mt-3 text-white/80">{episode.status === 'upcoming' ? formatWhen(episode.date, locale, true) : ''}</p>
                  <p className="mt-3 text-sm text-white/70">{t('demo_episode_text')}</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {episode.status === 'live' && <LiveBadge label={t('live_now')} size="lg" />}
                {episode.status === 'upcoming' && <span className="rounded bg-white px-2 py-0.5 font-condensed text-sm font-extrabold uppercase text-wydad-logo">{t('upcoming')}</span>}
                {episode.demo && <DemoChip label={t('demo')} />}
              </div>
              <h1 className="mt-2 font-condensed text-3xl font-extrabold uppercase leading-tight sm:text-4xl">{episode.title}</h1>
              <p className="mt-1 text-sm capitalize text-white/60">
                {formatWhen(episode.date, locale, episode.status === 'upcoming')}
                {episode.views != null && ` · ${t('views', { n: new Intl.NumberFormat(locale).format(episode.views) })}`}
              </p>
            </div>
            {external && (
              <a href={external} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg border border-white/25 px-5 font-condensed text-lg font-bold uppercase hover:bg-white/10">
                {t('watch_on_youtube')}
              </a>
            )}
          </div>
          {show && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white/[0.05] p-4 ring-1 ring-white/10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">{t(`cat_${show.category}`)}</p>
                <p className="font-condensed text-2xl font-extrabold uppercase">{show.title[lang]}</p>
                {creators.length > 0 && (
                  <p className="text-sm text-white/70">
                    {t('hosted_by')}{' '}
                    {creators.map((c, i) => (
                      <span key={c!.slug}>
                        {i > 0 && ', '}
                        <Link href={`/live/creators/${c!.slug}`} className="font-semibold text-white hover:underline">
                          {c!.name}
                        </Link>
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <Link href={`/live/shows/${show.slug}`} className="inline-flex min-h-11 items-center rounded-lg bg-white px-5 font-condensed text-lg font-bold uppercase text-wydad-logo hover:bg-white/90">
                {t('show_page')}
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14 sm:px-6 lg:px-8">
        {[
          { key: 'same', title: t('more_from_show'), list: sameShow },
          { key: 'more', title: t('more_videos'), list: more },
        ]
          .filter((s) => s.list.length > 0)
          .map((s) => (
            <section key={s.key} aria-labelledby={`more-${s.key}`}>
              <h2 id={`more-${s.key}`} className="font-condensed text-3xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">{s.title}</h2>
              <ul className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                {s.list.map((e) => (
                  <li key={e.id}>
                    <EpisodeCard episode={e} show={hub.shows.find((x) => x.slug === e.showSlug)} locale={locale} labels={labels} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </div>
    </div>
  );
}
