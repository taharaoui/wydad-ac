import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { videoThumbnail, type Video } from '@/lib/videos';

/** Club videos about this match (Inside The Match, press conference), from @WACofficiel. */
export function BehindTheScenes({ videos }: { videos: Video[] }) {
  const t = useTranslations('tv');
  if (videos.length === 0) return null;
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h3 className="font-display text-base font-bold text-fg">{t('match_bts')}</h3>
        <span className="rounded-md bg-wydad-logo px-2 py-1 font-condensed text-xs font-bold uppercase tracking-wide text-white">Wydad TV</span>
      </div>
      <ul className="grid gap-px bg-border sm:grid-cols-2">
        {videos.map((v) => (
          <li key={v.id} className="bg-surface">
            <Link href={`/wydad-tv/${v.id}`} className="group block p-4">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-secondary">
                <Image src={videoThumbnail(v.id, 'hq')} alt="" fill sizes="(min-width: 1024px) 320px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute bottom-2 start-2 flex h-9 w-9 items-center justify-center rounded-full bg-wydad-logo text-white shadow" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="ms-0.5">
                    <path d="M7 4.5v15l12-7.5z" />
                  </svg>
                </span>
              </div>
              <p className="mt-3 font-condensed text-xs font-bold uppercase tracking-wide text-wydad-red">{t(v.category)}</p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-fg group-hover:text-wydad-red">{v.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
