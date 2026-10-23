import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { InstagramFeed } from '@/lib/instagram';
import { InstagramIcon, KindIcon } from '@/components/ui/InstagramIcons';

/** Same output on server and client in every locale (Intl grouping differs in Arabic) */
const grouped = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** A section account's latest posts: profile row with Follow, then a grid linking to each post. */
export async function InstagramFeedGrid({ feed, title }: { feed: InstagramFeed; title: string }) {
  const t = await getTranslations('sections');
  const { profile, posts } = feed;
  const profileUrl = `https://www.instagram.com/${profile.username}/`;

  return (
    <section aria-labelledby="ig-feed-title">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2 id="ig-feed-title" className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-5xl">
            {title}
          </h2>
          <div className="mt-4 flex items-center gap-3">
            <Image src={profile.avatar} alt="" width={44} height={44} className="h-11 w-11 rounded-full ring-2 ring-wydad-logo ring-offset-2 ring-offset-surface" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-fg" dir="ltr">@{profile.username}</p>
              <p className="text-sm text-fg-muted">
                <bdi>{grouped(profile.followers)}</bdi> {t('followers')} · <bdi>{grouped(profile.posts)}</bdi> {t('posts')}
              </p>
            </div>
          </div>
        </div>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-wydad-logo px-5 font-condensed text-lg font-bold uppercase text-white transition-colors hover:bg-wydad-red-hover"
        >
          <InstagramIcon className="h-5 w-5" />
          {t('follow')}
        </a>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {posts.slice(0, 6).map((p) => (
          <li key={p.shortcode} className="relative">
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-surface-secondary">
              <Image
                src={p.image}
                alt={p.caption || `@${profile.username}`}
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <KindIcon kind={p.kind} />
              {p.caption && (
                <span className="absolute inset-x-0 bottom-0 line-clamp-2 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {p.caption}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
