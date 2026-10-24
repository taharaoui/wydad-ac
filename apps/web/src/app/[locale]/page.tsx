import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getStandings, getRecentMatches, getMatchById } from '@/services/matches';
import { getHomeFeed, hasPicture } from '@/lib/feed';
import { BotolaRecordCard } from '@/components/home/BotolaRecordCard';
import { StandingsPreview } from '@/components/home/StandingsPreview';
import { NewsPreview } from '@/components/home/NewsPreview';
import { HeroSection } from '@/components/home/HeroSection';
import { FixturesCarousel } from '@/components/home/FixturesCarousel';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { FEATURED_COLLECTION, getBrandProducts } from '@/lib/brand-store';
import { BrandRail } from '@/components/home/BrandRail';
import { InstagramStories } from '@/components/home/InstagramStories';
import { getInstagram } from '@/lib/instagram';
import { BASKETBALL_TICKETS, upcomingBasketball } from '@/lib/basketball';
import { MatchAutoRefresh } from '@/components/matches/MatchAutoRefresh';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const [standings, feed, recentMatches, brandProducts, instagram] = await Promise.all([
    getStandings(),
    getHomeFeed(9),
    getRecentMatches(8),
    getBrandProducts(FEATURED_COLLECTION),
    getInstagram(),
  ]);

  // Next Wydad kick-off, for the countdown
  const upcoming = recentMatches
    .filter((m) => m.status === 'scheduled' || m.status === 'live')
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));

  // Hero: the three latest news items with a picture (article, YouTube video or Facebook post), so a
  // new upload or post leads it as soon as it appears; match reports bring their scoreline
  const heroItems = await Promise.all(
    feed
      .filter(hasPicture)
      .slice(0, 3)
      .map(async (item) => {
        const matchId = item.kind === 'article' ? item.article.match_id : undefined;
        const match = matchId ? recentMatches.find((m) => m.id === matchId) ?? (await getMatchById(matchId)) ?? undefined : undefined;
        return { ...item, match };
      }),
  );

  return (
    <div>
      {/* Hero — full-bleed, outside the container */}
      {/* Score refresh at kick-off, half-time and full time of the next Wydad game */}
      {upcoming[0] && <MatchAutoRefresh kickoff={upcoming[0].kickoff} finished={false} />}
      <HeroSection items={heroItems} locale={locale} />

      {/* Fixtures carousel — dark strip bridging hero to content */}
      {recentMatches.length > 0 && (
        <FixturesCarousel
          items={[...recentMatches, ...upcomingBasketball()]
            .sort((x, y) => x.kickoff.localeCompare(y.kickoff))
            .map((match) => ({ match, ticketsUrl: BASKETBALL_TICKETS[match.id] }))}
          nextMatch={upcoming[0]}
          extra={<BotolaRecordCard />}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Standings */}
        <ScrollReveal delay={100}>
          <section className="pt-12 min-w-0">
            <StandingsPreview standings={standings} />
          </section>
        </ScrollReveal>

        {/* WAC Official Brand */}
        <ScrollReveal delay={100}>
          <div className="mt-16">
            <BrandRail products={brandProducts} />
          </div>
        </ScrollReveal>

        {/* News */}
        <ScrollReveal delay={150}>
          <section className="mt-12 pb-16">
            <NewsPreview items={feed} locale={locale} />
          </section>
        </ScrollReveal>

        {/* Instagram */}
        <ScrollReveal delay={100}>
          <div className="pb-16">
            <InstagramStories profile={instagram.profile} posts={instagram.posts} />
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
