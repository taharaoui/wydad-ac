import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getStandings, getRecentMatches, getMatchById } from '@/services/matches';
import { getLatestNews } from '@/services/news';
import { CalendarSection } from '@/components/home/CalendarSection';
import { StandingsPreview } from '@/components/home/StandingsPreview';
import { NewsPreview } from '@/components/home/NewsPreview';
import { HeroSection } from '@/components/home/HeroSection';
import { FixturesCarousel } from '@/components/home/FixturesCarousel';
import { formatKickoff, formatKickoffLong } from '@/lib/datetime';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { VIDEOS } from '@/lib/videos';
import { upcomingBasketball } from '@/lib/basketball';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const [standings, news, recentMatches] = await Promise.all([
    getStandings(),
    getLatestNews(9),
    getRecentMatches(8),
  ]);

  // Up to three cards: upcoming games first (soonest first), then the latest results
  const upcoming = recentMatches
    .filter((m) => m.status === 'scheduled' || m.status === 'live')
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  const results = recentMatches
    .filter((m) => m.status === 'finished')
    .sort((a, b) => b.kickoff.localeCompare(a.kickoff));
  const calendarMatches = [...upcoming, ...results].slice(0, 3);

  // Hero stories: the two latest articles with a cover (e.g. today's statement, then the match report)
  const heroStories = await Promise.all(
    news
      .filter((a) => a.cover_image_url)
      .slice(0, 2)
      .map(async (article) => ({
        article,
        match: article.match_id
          ? recentMatches.find((m) => m.id === article.match_id) ?? (await getMatchById(article.match_id)) ?? undefined
          : undefined,
      })),
  );

  return (
    <div>
      {/* Hero — full-bleed, outside the container */}
      <HeroSection stories={heroStories} videos={VIDEOS.slice(0, 3)} locale={locale} />

      {/* Fixtures carousel — dark strip bridging hero to content */}
      {recentMatches.length > 0 && (
        <FixturesCarousel
          items={[...recentMatches, ...upcomingBasketball()]
            .sort((x, y) => x.kickoff.localeCompare(y.kickoff))
            .map((match) => ({ match, ...formatKickoff(match.kickoff, locale) }))}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Calendar: countdown + the next games (topped up with latest results) */}
        <ScrollReveal>
          <div className="pt-12">
            <CalendarSection
              items={calendarMatches.map((match) => ({ match, dateLabel: formatKickoffLong(match.kickoff, locale) }))}
              nextKickoff={upcoming[0]?.kickoff}
            />
          </div>
        </ScrollReveal>

        {/* Standings + Wydad+ CTA */}
        <ScrollReveal delay={100}>
          <section className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <StandingsPreview standings={standings} />
            </div>

            {/* Wydad+ CTA */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-dark to-surface-dark p-6 text-white">
              {/* Subtle glow */}
              <div className="absolute -top-10 -end-10 h-32 w-32 rounded-full bg-wydad-red/10 blur-3xl transition-all duration-500 group-hover:bg-wydad-red/20" />
              <div className="relative">
                <span className="font-display text-sm font-semibold uppercase tracking-wider text-wydad-red">
                  Wydad+
                </span>
                <h3 className="mt-2 font-display text-xl font-bold">{t('wydad_plus_title')}</h3>
                <p className="mt-2 text-sm text-white/70">{t('wydad_plus_desc')}</p>
                <Link
                  href="/wydad-plus"
                  className="mt-4 inline-flex items-center rounded-xl bg-wydad-logo px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-wydad-red/20 transition-all hover:bg-wydad-red-hover hover:shadow-xl hover:shadow-wydad-red/30 hover:-translate-y-0.5"
                >
                  {tCommon('learn_more')}
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* News */}
        <ScrollReveal delay={150}>
          <section className="mt-12 pb-16">
            <NewsPreview articles={news} locale={locale} />
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
