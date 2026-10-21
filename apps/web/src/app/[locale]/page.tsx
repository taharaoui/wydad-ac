import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getNextMatch, getLatestResult, getStandings, getRecentMatches } from '@/services/matches';
import { getLatestNews } from '@/services/news';
import { NextMatchCard } from '@/components/matches/NextMatchCard';
import { LatestResultCard } from '@/components/matches/LatestResultCard';
import { StandingsPreview } from '@/components/home/StandingsPreview';
import { NewsPreview } from '@/components/home/NewsPreview';
import { HeroSection } from '@/components/home/HeroSection';
import { FixturesCarousel } from '@/components/home/FixturesCarousel';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const [nextMatch, latestResult, standings, news, recentMatches] = await Promise.all([
    getNextMatch(),
    getLatestResult(),
    getStandings(),
    getLatestNews(3),
    getRecentMatches(8),
  ]);

  return (
    <div>
      {/* Hero — full-bleed, outside the container */}
      <HeroSection />

      {/* Fixtures carousel — dark strip bridging hero to content */}
      {recentMatches.length > 0 && <FixturesCarousel matches={recentMatches} />}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Match section: next match + latest result side by side */}
        <ScrollReveal>
          <section className="grid gap-6 lg:grid-cols-2">
            {nextMatch && <NextMatchCard match={nextMatch} locale={locale} />}
            {latestResult && <LatestResultCard match={latestResult} />}
          </section>
        </ScrollReveal>

        {/* Standings + Wydad+ CTA */}
        <ScrollReveal delay={100}>
          <section className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
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
                  className="mt-4 inline-flex items-center rounded-xl bg-wydad-red px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-wydad-red/20 transition-all hover:bg-wydad-red-hover hover:shadow-xl hover:shadow-wydad-red/30 hover:-translate-y-0.5"
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
