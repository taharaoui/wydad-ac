import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getNextMatch, getLatestResult, getStandings } from '@/services/matches';
import { getLatestNews } from '@/services/news';
import { NextMatchCard } from '@/components/matches/NextMatchCard';
import { LatestResultCard } from '@/components/matches/LatestResultCard';
import { StandingsPreview } from '@/components/home/StandingsPreview';
import { NewsPreview } from '@/components/home/NewsPreview';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const [nextMatch, latestResult, standings, news] = await Promise.all([
    getNextMatch(),
    getLatestResult(),
    getStandings(),
    getLatestNews(3),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="py-10 sm:py-16">
        <div className="text-center">
          <h1 className="font-display text-display-lg font-bold tracking-tight text-fg sm:text-display-xl">
            {t('hero_title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-fg-muted">
            {t('hero_subtitle')}
          </p>
        </div>
      </section>

      {/* Match section: next match + latest result side by side */}
      <section className="grid gap-6 lg:grid-cols-2">
        {nextMatch && <NextMatchCard match={nextMatch} locale={locale} />}
        {latestResult && <LatestResultCard match={latestResult} />}
      </section>

      {/* Standings + Wydad+ CTA */}
      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StandingsPreview standings={standings} />
        </div>

        {/* Wydad+ CTA */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-surface-dark to-surface-dark-secondary p-6 text-white">
          <span className="font-display text-sm font-semibold uppercase tracking-wider text-wydad-red">
            Wydad+
          </span>
          <h3 className="mt-2 font-display text-xl font-bold">{t('wydad_plus_title')}</h3>
          <p className="mt-2 text-sm text-white/70">{t('wydad_plus_desc')}</p>
          <Link
            href="/wydad-plus"
            className="mt-4 inline-flex items-center rounded-xl bg-wydad-red px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wydad-red-hover"
          >
            {tCommon('learn_more')}
          </Link>
        </div>
      </section>

      {/* News */}
      <section className="mt-12 pb-16">
        <NewsPreview articles={news} locale={locale} />
      </section>
    </div>
  );
}
