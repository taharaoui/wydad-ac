import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Match, NewsArticle } from '@/types';
import { clubShortName } from '@/lib/clubs';
import { videoThumbnail } from '@/lib/videos';
import type { FeedItem } from '@/lib/feed';
import { TeamCrest } from '@/components/ui/TeamCrest';
import { HeroSlider, type HeroSlide } from './HeroSlider';

/** A feed item for the hero; match reports carry their match for the scoreline */
export type HeroItem = FeedItem & { match?: Match };

interface HeroSectionProps {
  /** Latest news items with a picture (articles, videos, Facebook posts), newest first */
  items?: HeroItem[];
  locale: string;
}

const FALLBACK_IMAGE = 'https://cdn.wallpapersafari.com/52/88/EQSnvB.jpg';

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

const titleClass =
  'mt-5 max-w-4xl font-condensed text-5xl font-extrabold uppercase italic leading-[0.92] text-white rtl:not-italic sm:text-6xl lg:text-7xl';
const primaryCta =
  'group inline-flex items-center gap-2 bg-white px-5 py-3 font-condensed text-lg font-bold uppercase leading-none text-black transition-colors hover:bg-wydad-logo hover:text-white';

export function HeroSection({ items = [], locale }: HeroSectionProps) {
  const t = useTranslations('home');
  const tNews = useTranslations('news');
  const tMatches = useTranslations('matches');
  const tTv = useTranslations('tv');
  const tCommon = useTranslations('common');
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';
  const slides: HeroSlide[] = [];

  const articleSlide = (article: NewsArticle, match?: Match) => {
    const played = match && (match.status === 'finished' || match.status === 'live');
    slides.push({
      id: `article-${article.id}`,
      image: article.cover_image_url ?? FALLBACK_IMAGE,
      imagePosition: article.cover_position,
      poster: article.cover_orientation === 'portrait',
      label: tNews(article.category),
      content: (
        <>
          <div className="flex flex-wrap items-center gap-2 font-condensed text-sm font-bold uppercase tracking-wide text-white">
            <span className="bg-wydad-logo px-2 py-1 leading-none">{tNews(article.category)}</span>
            {match && (
              <span className="text-white/75">
                Botola Pro{match.matchday ? ` · ${tMatches('matchday')} ${match.matchday}` : ''}
              </span>
            )}
          </div>

          {match && played && (
            <div className="mt-5 inline-flex items-center gap-3 bg-white/10 px-4 py-2.5 backdrop-blur-md" dir="ltr">
              <TeamCrest team={match.home_team} size={30} fallbackClassName="rounded-full bg-white/15 text-white" />
              <span className="font-condensed text-xl font-bold uppercase text-white">{clubShortName(match.home_team)}</span>
              <span className="font-condensed text-3xl font-extrabold tabular-nums text-white">
                {match.score_home}<span className="mx-1.5 text-white/50">-</span>{match.score_away}
              </span>
              <span className="font-condensed text-xl font-bold uppercase text-white">{clubShortName(match.away_team)}</span>
              <TeamCrest team={match.away_team} size={30} fallbackClassName="rounded-full bg-white/15 text-white" />
            </div>
          )}

          <h2 className={titleClass}>{article.title[lang]}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{article.excerpt[lang]}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={`/news/${article.slug}`} className={primaryCta}>
              {t(article.category === 'match_report' ? 'read_report' : 'read_article')}
              <Chevron />
            </Link>
            {match && (
              <Link
                href={`/matches/${match.id}`}
                className="group inline-flex items-center gap-2 font-condensed text-lg font-bold uppercase leading-none text-white/85 transition-colors hover:text-white"
              >
                {tNews('match_centre')}
                <Chevron />
              </Link>
            )}
          </div>
        </>
      ),
    });
  };

  const videoSlide = (video: Extract<FeedItem, { kind: 'video' }>['video']) => {
    slides.push({
      id: `video-${video.id}`,
      image: videoThumbnail(video.id),
      label: tTv('title'),
      content: (
        <>
          <div className="flex flex-wrap items-center gap-2 font-condensed text-sm font-bold uppercase tracking-wide text-white">
            <span className="flex items-center gap-1.5 bg-wydad-logo px-2 py-1 leading-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M7 4.5v15l12-7.5z" />
              </svg>
              {tTv('title')}
            </span>
            <span className="text-white/75">{tTv(video.category)}</span>
          </div>
          <h2 className={titleClass}>{video.title}</h2>
          <div className="mt-7">
            <Link href={`/wydad-tv/${video.id}`} className={primaryCta}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M7 4.5v15l12-7.5z" />
              </svg>
              {t('watch_now')}
            </Link>
          </div>
        </>
      ),
    });
  };

  const facebookSlide = (post: Extract<FeedItem, { kind: 'facebook' }>['post']) => {
    slides.push({
      id: `facebook-${post.id}`,
      image: post.image ?? FALLBACK_IMAGE,
      imagePosition: 'center 30%',
      label: 'Facebook',
      content: (
        <>
          <div className="flex flex-wrap items-center gap-2 font-condensed text-sm font-bold uppercase tracking-wide text-white">
            <span className="flex items-center gap-1.5 bg-wydad-logo px-2 py-1 leading-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.02 24 18.06 24 12.07z" />
              </svg>
              Facebook
            </span>
          </div>
          <h2 className={titleClass}>{post.title}</h2>
          {post.text && <p className="mt-4 line-clamp-3 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{post.text}</p>}
          <div className="mt-7">
            <a href={post.url} target="_blank" rel="noopener noreferrer" className={primaryCta}>
              {t('see_post')}
              <Chevron />
            </a>
          </div>
        </>
      ),
    });
  };

  for (const item of items) {
    if (item.kind === 'article') articleSlide(item.article, item.match);
    else if (item.kind === 'video') videoSlide(item.video);
    else facebookSlide(item.post);
  }

  if (slides.length === 0) {
    slides.push({
      id: 'default',
      image: FALLBACK_IMAGE,
      label: t('hero_title'),
      content: (
        <>
          <h2 className={titleClass}>{t('hero_title')}</h2>
          <div className="mt-6">
            <Link href="/news" className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/90 hover:text-white">
              {tCommon('learn_more')}
              <Chevron />
            </Link>
          </div>
        </>
      ),
    });
  }

  return (
    <HeroSlider slides={slides} />
  );
}
