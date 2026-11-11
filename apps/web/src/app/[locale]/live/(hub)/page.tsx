import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getLiveHub, type Episode, type Show } from '@/lib/live';
import { DemoChip, EpisodeCard, LiveBadge, Player, externalWatchUrl, formatWhen, toLang, type CardLabels } from '@/components/live/parts';

/** Live status and new uploads are re-checked every 2 minutes */
export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'live' });
  return { title: t('title'), description: t('intro') };
}

const initials = (s: string) =>
  s
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** Wydad Live: Twitch/Kick-style home for live shows, podcasts and replays */
export default async function LivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'live' });
  const lang = toLang(locale);
  const hub = await getLiveHub();
  const showOf = (e: Episode): Show | undefined => hub.shows.find((s) => s.slug === e.showSlug);
  const labels: CardLabels = { live: t('live_now'), upcoming: t('upcoming'), demo: t('demo'), views: (n) => t('views', { n }) };

  const featured = hub.live[0] ?? hub.replays.find((e) => e.showSlug === 'wydad-tv' && e.source);
  const isLive = featured?.status === 'live';
  const nextLive = hub.upcoming[0];
  const liveShows = new Set(hub.live.map((e) => e.showSlug));

  const channel = (show: Show) => (
    <Link
      key={show.slug}
      href={`/live/shows/${show.slug}`}
      className="group flex min-w-0 items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.06] focus-visible:bg-white/[0.08] focus-visible:outline-none"
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-wydad-logo font-condensed text-sm font-extrabold text-white">
        {show.slug === 'wydad-tv' ? <Image src="/images/wydad-crest-white.svg" alt="" width={20} height={25} className="h-6 w-auto" /> : initials(show.title[lang])}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-white">{show.title[lang]}</span>
        <span className="block truncate text-xs text-white/55">{t(`cat_${show.category}`)}</span>
      </span>
      {liveShows.has(show.slug) ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-wydad-logo ring-2 ring-wydad-logo/30" aria-label={t('live_now')} /> : show.demo ? <DemoChip label={t('demo')} /> : null}
    </Link>
  );

  return (
    <div>
      {/* Stage */}
      <section className="bg-wydad-charcoal text-white">
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[16rem_minmax(0,1fr)]">
          {/* Channel rail (desktop) */}
          <aside className="hidden border-e border-white/10 px-3 py-8 lg:block">
            <p className="px-2 font-condensed text-xs font-bold uppercase tracking-[0.16em] text-white/50">{t('channels')}</p>
            <nav aria-label={t('channels')} className="mt-3 space-y-0.5">
              {hub.shows.map(channel)}
            </nav>
          </aside>

          <div className="min-w-0 px-4 pb-12 pt-8 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white/60">{t('kicker')}</p>
                <h1 className="mt-1 font-condensed text-5xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-7xl">{t('title')}</h1>
              </div>
              <p className="max-w-md text-white/70">{t('intro')}</p>
            </div>

            {/* Channels as chips on small screens */}
            <nav aria-label={t('channels')} className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 lg:hidden">
              {hub.shows.map((s) => (
                <Link key={s.slug} href={`/live/shows/${s.slug}`} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/[0.08] px-3 py-2 text-sm font-semibold text-white">
                  {liveShows.has(s.slug) && <span className="h-2 w-2 rounded-full bg-wydad-logo" aria-hidden />}
                  {s.title[lang]}
                  {s.demo && <span className="text-xs font-normal text-white/50">· {t('demo')}</span>}
                </Link>
              ))}
            </nav>

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="min-w-0">
                {!isLive && (
                  <div className="mb-4 flex items-start gap-3 rounded-lg bg-white/[0.06] px-4 py-3 text-sm text-white/80" role="status">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-white/40" aria-hidden />
                    <span>
                      <span className="font-semibold text-white">{t('offline')}.</span> {t('offline_text')}
                    </span>
                  </div>
                )}
                {featured ? (
                  <>
                    <Player episode={featured} title={featured.title} autoplay={isLive} />
                    <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {isLive ? <LiveBadge label={t('live_now')} size="lg" /> : <span className="font-condensed text-sm font-bold uppercase tracking-wide text-white/60">{t('latest_video')}</span>}
                        </div>
                        <h2 className="mt-2 font-condensed text-2xl font-extrabold uppercase leading-tight sm:text-3xl">{featured.title}</h2>
                        <p className="mt-1 text-sm text-white/60">
                          {showOf(featured)?.title[lang]}
                          {featured.views != null && ` · ${t('views', { n: new Intl.NumberFormat(locale).format(featured.views) })}`}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/live/watch/${featured.id}`} className="inline-flex min-h-11 items-center rounded-lg bg-wydad-logo px-5 font-condensed text-lg font-bold uppercase text-white hover:bg-wydad-red-hover">
                          {isLive ? t('watch_live') : t('watch')}
                        </Link>
                        {externalWatchUrl(featured) && (
                          <a href={externalWatchUrl(featured)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg border border-white/25 px-5 font-condensed text-lg font-bold uppercase text-white hover:bg-white/10">
                            {t('watch_on_youtube')}
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="rounded-xl bg-white/[0.06] px-6 py-16 text-center text-white/70">{t('no_replays')}</p>
                )}
              </div>

              {/* Next live */}
              {nextLive && (
                <Link href={`/live/watch/${nextLive.id}`} className="group flex flex-col overflow-hidden rounded-xl bg-white/[0.05] ring-1 ring-white/10 transition hover:bg-white/[0.08] xl:self-start">
                  <div className="relative aspect-video">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#d21f26_0%,#7a1218_45%,#2a070a_100%)]" />
                    <p className="absolute inset-x-4 bottom-4 font-condensed text-3xl font-extrabold uppercase italic leading-none rtl:not-italic">{showOf(nextLive)?.title[lang]}</p>
                    <div className="absolute start-3 top-3 flex gap-1.5">
                      <span className="rounded bg-white px-1.5 py-0.5 font-condensed text-xs font-extrabold uppercase text-wydad-logo">{t('next_live')}</span>
                      {nextLive.demo && <DemoChip label={t('demo')} />}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold">{nextLive.title}</p>
                    <p className="mt-1 text-sm capitalize text-white/60">{formatWhen(nextLive.date, locale, true)}</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-6 lg:px-8">
        {/* Live now (besides the featured one) */}
        {hub.live.length > 1 && (
          <section aria-labelledby="live-now">
            <h2 id="live-now" className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">{t('live_now')}</h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {hub.live.slice(1).map((e) => (
                <li key={e.id}>
                  <EpisodeCard episode={e} show={showOf(e)} locale={locale} labels={labels} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Schedule */}
        <section aria-labelledby="schedule">
          <h2 id="schedule" className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">{t('schedule')}</h2>
          {hub.upcoming.length === 0 ? (
            <p className="mt-4 text-fg-muted">{t('no_schedule')}</p>
          ) : (
            <ol className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {hub.upcoming.map((e) => (
                <li key={e.id}>
                  <Link href={`/live/watch/${e.id}`} className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 hover:bg-surface-secondary/60 sm:px-6">
                    <span className="w-full font-condensed text-lg font-bold uppercase text-wydad-red sm:w-52 sm:shrink-0">{formatWhen(e.date, locale, true)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-fg">{e.title}</span>
                      <span className="block text-sm text-fg-muted">{showOf(e)?.title[lang]}</span>
                    </span>
                    {e.demo && <span className="rounded border border-dashed border-fg-muted px-1.5 py-0.5 font-condensed text-xs font-bold uppercase text-fg-muted">{t('demo')}</span>}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Replays */}
        <section aria-labelledby="replays">
          <h2 id="replays" className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">{t('replays')}</h2>
          {hub.replays.length === 0 ? (
            <p className="mt-4 text-fg-muted">{t('no_replays')}</p>
          ) : (
            <ul className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {hub.replays
                .filter((e) => e.id !== featured?.id)
                .slice(0, 8)
                .map((e) => (
                  <li key={e.id}>
                    <EpisodeCard episode={e} show={showOf(e)} locale={locale} labels={labels} />
                  </li>
                ))}
            </ul>
          )}
        </section>

        {/* Shows */}
        <section aria-labelledby="shows">
          <h2 id="shows" className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">{t('shows')}</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hub.shows.map((s) => (
              <li key={s.slug}>
                <Link href={`/live/shows/${s.slug}`} className="group relative flex h-full min-h-[220px] flex-col justify-end overflow-hidden rounded-2xl bg-wydad-charcoal p-6 text-white">
                  {s.cover ? (
                    <Image src={s.cover} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover opacity-50 transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#d21f26_0%,#7a1218_40%,#171719_100%)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-condensed text-xs font-bold uppercase tracking-[0.14em] text-white/70">{t(`cat_${s.category}`)}</span>
                      {liveShows.has(s.slug) && <LiveBadge label={t('live_now')} />}
                      {s.demo && <DemoChip label={t('demo')} />}
                    </div>
                    <h3 className="mt-2 font-condensed text-3xl font-extrabold uppercase italic leading-none rtl:not-italic">{s.title[lang]}</h3>
                    <p className="mt-2 text-sm text-white/75">{s.tagline[lang]}{s.slot ? ` · ${s.slot[lang]}` : ''}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Creators */}
        <section aria-labelledby="creators">
          <h2 id="creators" className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">{t('creators')}</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {hub.creators.map((c) => (
              <li key={c.slug}>
                <Link href={`/live/creators/${c.slug}`} className={`flex h-full items-center gap-5 rounded-2xl p-5 transition-colors ${c.demo ? 'border-2 border-dashed border-border hover:border-wydad-logo' : 'border border-border bg-surface hover:border-wydad-logo'}`}>
                  <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-wydad-logo">
                    {c.avatar ? <Image src={c.avatar} alt="" fill sizes="64px" className="object-contain p-2" /> : <span className="font-condensed text-2xl font-extrabold text-white">?</span>}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-condensed text-2xl font-extrabold uppercase leading-none text-fg">{c.name}</span>
                    <span className="mt-1 block text-sm font-semibold text-wydad-red">{c.role[lang]}</span>
                    <span className="mt-1 line-clamp-2 block text-sm text-fg-secondary">{c.bio[lang]}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="rounded-xl bg-surface-secondary/70 px-5 py-4 text-sm text-fg-secondary">{t('demo_note')}</p>
      </div>
    </div>
  );
}
