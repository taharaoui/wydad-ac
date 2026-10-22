import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getLatestNews } from '@/services/news';
import { getMatchById } from '@/services/matches';
import { Link } from '@/i18n/navigation';
import { clubShortName } from '@/lib/clubs';
import { formatKickoffLong } from '@/lib/datetime';
import { TeamCrest } from '@/components/ui/TeamCrest';

export async function generateStaticParams() {
  const articles = await getLatestNews(50);
  const locales = ['ar', 'fr', 'en'];
  return locales.flatMap(locale =>
    articles.map(article => ({
      locale,
      slug: article.slug,
    }))
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'news' });
  const tMatches = await getTranslations({ locale, namespace: 'matches' });

  const article = await getNewsBySlug(slug);
  if (!article) notFound();
  const match = article.match_id ? await getMatchById(article.match_id) : null;

  const lang = (locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr' : 'en') as keyof typeof article.title;
  const dateLocale = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB';
  const published = new Date(article.published_at).toLocaleDateString(dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Casablanca',
  });
  const paragraphs = article.body[lang].split(/\n{2,}/);
  const goals = (match?.events ?? []).filter((e) => e.type === 'goal' || e.type === 'penalty_scored' || e.type === 'own_goal');

  return (
    <article className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-14">
        {/* Story */}
        <div className="min-w-0">
          <h1 className="font-condensed text-5xl font-extrabold uppercase italic leading-[0.95] text-fg rtl:not-italic sm:text-6xl lg:text-[64px]">
            {article.title[lang]}
          </h1>
          <p className="mt-5 flex flex-wrap items-center gap-2 font-condensed text-sm font-bold uppercase tracking-wide text-fg-muted">
            <span className="text-wydad-red">{t(article.category)}</span>
            <span aria-hidden>•</span>
            <span>{published}</span>
            <span aria-hidden>•</span>
            <span>{article.read_time_minutes} {t('min_read')}</span>
          </p>

          <p className="mt-8 text-xl leading-relaxed text-fg sm:text-2xl sm:leading-relaxed">
            {article.excerpt[lang]}
          </p>

          {/* Photo inline on small screens; in the side column on desktop */}
          {article.cover_image_url && (
            <div className="relative mt-8 aspect-[4/5] overflow-hidden bg-surface-secondary sm:aspect-[4/3] lg:hidden">
              <Image src={article.cover_image_url} alt={article.title[lang]} fill sizes="100vw" className="object-cover" style={{ objectPosition: article.cover_position ?? 'center 75%' }} />
            </div>
          )}

          <div className="mt-10 max-w-2xl space-y-5 text-lg leading-relaxed text-fg-secondary">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {article.author && (
            <p className="mt-10 border-t border-border pt-5 text-sm text-fg-muted">{article.author}</p>
          )}
        </div>

        {/* Side column: photo + "in this article" */}
        <aside className="min-w-0">
          {article.cover_image_url && (
            <div className="relative hidden aspect-[4/5] overflow-hidden bg-surface-secondary lg:block">
              <Image src={article.cover_image_url} alt={article.title[lang]} fill priority sizes="460px" className="object-cover" style={{ objectPosition: article.cover_position ?? 'center 75%' }} />
            </div>
          )}

          {match && (
            <div className="lg:sticky lg:top-24">
              <h2 className="mt-10 border-t border-border pt-8 font-condensed text-3xl font-extrabold uppercase italic text-fg rtl:not-italic lg:mt-8">
                {t('in_this_article')}
              </h2>

              <Link
                href={`/matches/${match.id}`}
                className="group mt-4 block bg-surface-secondary p-5 transition-colors hover:bg-border"
              >
                <p className="font-condensed text-sm font-bold uppercase tracking-wide text-fg-muted">
                  Botola Pro{match.matchday ? ` · ${tMatches('matchday')} ${match.matchday}` : ''}
                </p>
                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3" dir="ltr">
                  {[match.home_team, null, match.away_team].map((team, i) =>
                    team ? (
                      <div key={team.id} className="flex flex-col items-center gap-2 text-center">
                        <TeamCrest team={team} size={48} fallbackClassName="rounded-full bg-border text-fg" />
                        <span className="font-condensed text-lg font-bold uppercase leading-none text-fg">{clubShortName(team)}</span>
                      </div>
                    ) : (
                      <span key={i} className="font-condensed text-4xl font-extrabold tabular-nums text-fg">
                        {match.score_home ?? '-'}<span className="mx-1.5 text-fg-muted">-</span>{match.score_away ?? '-'}
                      </span>
                    ),
                  )}
                </div>
                {goals.length > 0 && (
                  <ul className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-fg-secondary">
                    {goals.map((g) => (
                      <li key={g.id} className="flex justify-between gap-3">
                        <span>{g.player_name}{g.type === 'penalty_scored' ? ` (${t('penalty')})` : ''}</span>
                        <span className="tabular-nums text-fg-muted">{g.minute}&apos;</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 text-xs text-fg-muted">{formatKickoffLong(match.kickoff, locale)}</p>
                <span className="mt-3 flex items-center justify-between font-condensed text-lg font-bold uppercase text-fg group-hover:text-wydad-red">
                  {t('match_centre')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </Link>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
