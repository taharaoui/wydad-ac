import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { VIDEOS, getVideo, getVideos, videoThumbnail, youtubeUrl } from '@/lib/videos';

export function generateStaticParams() {
  return ['ar', 'fr', 'en'].flatMap((locale) => VIDEOS.map((v) => ({ locale, id: v.id })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const video = await getVideo(id);
  if (!video) return {};
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';
  return { title: `${video.title} | Wydad TV`, openGraph: { images: [videoThumbnail(id)] } };
}

export default async function VideoPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const video = await getVideo(id);
  if (!video) notFound();

  const t = await getTranslations({ locale, namespace: 'tv' });
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';
  const dateLocale = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB';
  const date = video.published_at && new Date(video.published_at).toLocaleDateString(dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Casablanca',
  });
  const more = (await getVideos()).filter((v) => v.id !== video.id).slice(0, 9);

  return (
    <div className="bg-surface-dark pb-20 text-white">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link href="/wydad-tv" className="inline-flex items-center gap-2 font-condensed text-lg font-extrabold uppercase italic tracking-wide text-white rtl:not-italic">
          <span className="flex h-6 w-6 items-center justify-center bg-white text-wydad-logo">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M7 4.5v15l12-7.5z" />
            </svg>
          </span>
          {t('back')}
        </Link>

        {/* Player: autoplays since the visitor clicked "Watch now" */}
        <div className="relative mt-6 aspect-video overflow-hidden bg-black shadow-[0_24px_80px_rgb(217_41_47/0.18)]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>

        <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 max-w-3xl">
            <p className="font-condensed text-sm font-bold uppercase tracking-wide text-white/60">
              <span className="text-white">{t(video.category)}</span>
              {date && (
                <>
                  <span className="mx-2" aria-hidden>•</span>
                  {date}
                </>
              )}
            </p>
            <h1 className="mt-3 font-condensed text-4xl font-extrabold uppercase italic leading-[0.95] rtl:not-italic sm:text-5xl">
              {video.title}
            </h1>
          </div>
          <a
            href={youtubeUrl(video.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-black"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .6 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-4.8 31 31 0 0 0-.4-4.8zM9.7 15.1V8.9L15.5 12z" />
            </svg>
            {t('watch_on_youtube')}
          </a>
        </div>

        {more.length > 0 && (
          <section className="mt-16">
            <h2 className="font-condensed text-3xl font-extrabold uppercase italic rtl:not-italic">{t('more')}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((v) => (
                <Link key={v.id} href={`/wydad-tv/${v.id}`} className="group block">
                  <div className="relative aspect-video overflow-hidden bg-white/5">
                    <Image src={videoThumbnail(v.id, 'hq')} alt="" fill sizes="400px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <p className="mt-3 line-clamp-2 font-semibold group-hover:text-white/75">{v.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
