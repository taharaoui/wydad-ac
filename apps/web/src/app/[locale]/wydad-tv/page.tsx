import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getVideos, videoThumbnail } from '@/lib/videos';

function PlayBadge({ size = 56 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-wydad-logo text-white shadow-lg transition-transform group-hover:scale-110"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.36} height={size * 0.36} viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ms-0.5">
        <path d="M7 4.5v15l12-7.5z" />
      </svg>
    </span>
  );
}

export default async function WydadTvPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'tv' });
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';
  const [featured, ...rest] = await getVideos();

  return (
    <div className="min-h-screen bg-surface-dark pb-20 text-white">
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
        <h1 className="font-condensed text-6xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-7xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-white/60">{t('subtitle')}</p>

        {featured && (
          <Link href={`/wydad-tv/${featured.id}`} className="group relative mt-10 block aspect-video overflow-hidden bg-white/5">
            <Image src={videoThumbnail(featured.id)} alt="" fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end gap-5 p-6 sm:p-10">
              <PlayBadge size={64} />
              <div className="min-w-0">
                <p className="font-condensed text-sm font-bold uppercase tracking-wide text-white/70">{t(featured.category)}</p>
                <p className="mt-1 font-condensed text-3xl font-extrabold uppercase italic leading-[0.95] rtl:not-italic sm:text-5xl">
                  {featured.title}
                </p>
              </div>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <section className="mt-14">
            <h2 className="font-condensed text-3xl font-extrabold uppercase italic rtl:not-italic">{t('latest')}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((v) => (
                <Link key={v.id} href={`/wydad-tv/${v.id}`} className="group block">
                  <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-white/5">
                    <Image src={videoThumbnail(v.id, 'hq')} alt="" fill sizes="400px" className="object-cover" />
                    <span className="relative"><PlayBadge size={44} /></span>
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
