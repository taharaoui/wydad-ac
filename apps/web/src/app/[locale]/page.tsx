import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getStandings, getRecentMatches, getMatchById } from '@/services/matches';
import { getLatestNews } from '@/services/news';
import { BotolaRecordCard } from '@/components/home/BotolaRecordCard';
import { StandingsPreview } from '@/components/home/StandingsPreview';
import { NewsPreview } from '@/components/home/NewsPreview';
import { HeroSection } from '@/components/home/HeroSection';
import { FixturesCarousel } from '@/components/home/FixturesCarousel';
import { formatKickoff } from '@/lib/datetime';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { getVideos } from '@/lib/videos';
import { FEATURED_COLLECTION, getBrandProducts } from '@/lib/brand-store';
import { BrandRail } from '@/components/home/BrandRail';
import { InstagramStories } from '@/components/home/InstagramStories';
import { getInstagram } from '@/lib/instagram';
import { getManualFixtures, upcoming as upcomingOf } from '@/lib/cms/club';
import { getHomeSections } from '@/lib/cms/site';
import type { HomeSectionKey } from '@/lib/site-defaults';
import type { ReactNode } from 'react';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const [standings, news, recentMatches, brandProducts, instagram, basketball, sections] = await Promise.all([
    getStandings(),
    getLatestNews(9, locale),
    getRecentMatches(8),
    getBrandProducts(FEATURED_COLLECTION),
    getInstagram(),
    getManualFixtures('basketball'),
    getHomeSections(locale),
  ]);

  // Next Wydad kick-off, for the countdown
  const upcoming = recentMatches
    .filter((m) => m.status === 'scheduled' || m.status === 'live')
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));

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


  // Each section the CMS can show, hide, reorder or retitle (home_sections)
  const render: Record<HomeSectionKey, (title?: string) => ReactNode> = {
    fixtures: (title) =>
      recentMatches.length > 0 && (
        <FixturesCarousel
          title={title}
          items={[...recentMatches, ...upcomingOf(basketball.matches)]
            .sort((x, y) => x.kickoff.localeCompare(y.kickoff))
            .map((match) => ({ match, ...formatKickoff(match.kickoff, locale), ticketsUrl: basketball.tickets[match.id] }))}
          nextKickoff={upcoming[0]?.kickoff}
          extra={<BotolaRecordCard />}
        />
      ),
    standings: (title) => (
      <ScrollReveal delay={100}>
        <section className="pt-12 min-w-0">
          <StandingsPreview standings={standings} title={title} />
        </section>
      </ScrollReveal>
    ),
    brand: (title) => (
      <ScrollReveal delay={100}>
        <div className="mt-16">
          <BrandRail products={brandProducts} title={title} />
        </div>
      </ScrollReveal>
    ),
    news: (title) => (
      <ScrollReveal delay={150}>
        <section className="mt-12 pb-16">
          <NewsPreview articles={news} locale={locale} title={title} />
        </section>
      </ScrollReveal>
    ),
    instagram: (title) => (
      <ScrollReveal delay={100}>
        <div className="pb-16">
          <InstagramStories profile={instagram.profile} posts={instagram.posts} title={title} />
        </div>
      </ScrollReveal>
    ),
  };

  return (
    <div>
      {/* Hero — full-bleed, outside the container */}
      <HeroSection stories={heroStories} videos={(await getVideos()).slice(0, 1)} locale={locale} />

      {sections.map(({ key, title }) => (
        <HomeBlock key={key} id={key}>
          {render[key](title)}
        </HomeBlock>
      ))}
    </div>
  );
}

/** The fixtures strip is full-bleed; the other sections sit in the page container */
function HomeBlock({ id, children }: { id: HomeSectionKey; children: ReactNode }) {
  if (id === 'fixtures') return <>{children}</>;
  return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>;
}
