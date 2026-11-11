import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getStandings, getRecentMatches, getMatchById } from '@/services/matches';
import { getHomeFeed, hasPicture } from '@/lib/feed';
import { BotolaRecordCard } from '@/components/home/BotolaRecordCard';
import { GoldShowcase } from '@/components/home/GoldShowcase';
import { StandingsPreview } from '@/components/home/StandingsPreview';
import { NewsPreview } from '@/components/home/NewsPreview';
import { NewsletterBand } from '@/components/newsletter/NewsletterBand';
import { HeroSection } from '@/components/home/HeroSection';
import { FixturesCarousel } from '@/components/home/FixturesCarousel';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { FEATURED_COLLECTION, getBrandProducts } from '@/lib/brand-store';
import { BrandRail } from '@/components/home/BrandRail';
import { InstagramStories } from '@/components/home/InstagramStories';
import { getInstagram } from '@/lib/instagram';
import { getManualFixtures, recent as recentOf, upcoming as upcomingOf } from '@/lib/cms/club';
import { getHomeSections } from '@/lib/cms/site';
import type { HomeSectionKey } from '@/lib/site-defaults';
import type { ReactNode } from 'react';
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

  const [standings, feed, recentMatches, brandProducts, instagram, basketball, sections] = await Promise.all([
    getStandings(),
    getHomeFeed(9, locale),
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

  // Hero: the three latest news items with a picture (article, YouTube video or Facebook post), so a
  // new upload or post leads it as soon as it appears; match reports bring their scoreline
  const heroItems = await Promise.all(
    feed
      .filter(hasPicture)
      // An article marked "featured" in the newsroom leads the hero
      .sort((a, b) => Number(b.kind === 'article' && !!b.article.featured) - Number(a.kind === 'article' && !!a.article.featured))
      .slice(0, 3)
      .map(async (item) => {
        const matchId = item.kind === 'article' ? item.article.match_id : undefined;
        const match = matchId ? recentMatches.find((m) => m.id === matchId) ?? (await getMatchById(matchId)) ?? undefined : undefined;
        return { ...item, match };
      }),
  );


  // Each section the CMS can show, hide, reorder or retitle (home_sections)
  const render: Record<HomeSectionKey, (title?: string) => ReactNode> = {
    fixtures: (title) =>
      recentMatches.length > 0 && (
        <FixturesCarousel
          title={title}
          items={[...recentMatches, ...recentOf(basketball.matches), ...upcomingOf(basketball.matches)]
            .sort((x, y) => x.kickoff.localeCompare(y.kickoff))
            .map((match) => ({ match, ticketsUrl: basketball.tickets[match.id] }))}
          nextMatch={upcoming[0]}
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
    // Gold Membership showcase right under the brand (same card film as the membership page)
    brand: (title) => (
      <>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={100}>
            <div className="mt-16">
              <BrandRail products={brandProducts} title={title} />
            </div>
          </ScrollReveal>
        </div>
        <div className="mt-16">
          <GoldShowcase locale={locale} />
        </div>
      </>
    ),
    news: (title) => (
      <ScrollReveal delay={150}>
        <section className="py-12 sm:py-16">
          <NewsPreview items={feed} locale={locale} title={title} />
        </section>
      </ScrollReveal>
    ),
    newsletter: (title) => (
      <ScrollReveal delay={100}>
        <div className="pb-16">
          <NewsletterBand locale={locale} source="home" title={title} />
        </div>
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
      {/* 1. Hero — full-bleed, outside the container */}
      {/* Score refresh at kick-off, half-time and full time of the next Wydad game */}
      {upcoming[0] && <MatchAutoRefresh kickoff={upcoming[0].kickoff} finished={false} />}
      <HeroSection items={heroItems} locale={locale} />

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
  // The Gold showcase under the brand is full-bleed: only the rail sits in the container
  if (id === 'brand') return <>{children}</>;
  return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>;
}
