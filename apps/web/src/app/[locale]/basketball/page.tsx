import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { clubShortName } from '@/lib/clubs';
import { BASKETBALL_TICKETS, upcomingBasketball } from '@/lib/basketball';
import { TeamCrest } from '@/components/ui/TeamCrest';
import { NextMatchStatus } from '@/components/home/NextMatchStatus';
import { FootballNav } from '@/components/team/FootballNav';
import { getSection, getSectionFeed } from '@/lib/sections';
import { InstagramFeedGrid } from '@/components/sections/InstagramFeedGrid';
import { SectionHighlights } from '@/components/sections/SectionHighlights';
import { LocalKickoff } from '@/components/ui/LocalKickoff';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'basketball' });
  return { title: t('title') };
}

/** Wydad basketball section: the next league game from lib/basketball.ts */
export default async function BasketballPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'basketball' });
  const [next, ...later] = upcomingBasketball();
  const section = getSection('basketball')!;
  const [feed, tSections] = await Promise.all([getSectionFeed(section), getTranslations({ locale, namespace: 'sections' })]);

  return (
    <div>
      <FootballNav sport="basketball" active="fixtures" />
      <section className="relative overflow-hidden bg-surface-dark text-white">
        <div className="pointer-events-none absolute -start-32 top-0 h-[460px] w-[460px] rounded-full bg-white/10 blur-[120px]" aria-hidden />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6" className="pointer-events-none absolute -end-24 -top-10 hidden h-[560px] w-[560px] text-white/[0.05] md:block" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2v20M5 5c3 3 3 11 0 14M19 5c-3 3-3 11 0 14" />
        </svg>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white/75">{t('kicker')}</p>
          <h1 className="mt-3 font-condensed text-6xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-8xl">{t('title')}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">{t('intro')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-5xl">{t('next_game')}</h2>

        {next ? (
          <article className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-wydad-logo px-5 py-3 font-condensed text-sm font-bold uppercase tracking-wide text-white sm:px-8">
              <span>{next.competition.name}</span>
              {next.matchday && <span>{t('matchday', { n: next.matchday })}</span>}
            </div>

            <div className="grid items-center gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]" dir="ltr">
              {[next.home_team, next.away_team].map((team, i) => (
                <div key={team.id} className={`flex flex-col items-center gap-4 text-center ${i === 1 ? 'order-3' : 'order-1'}`}>
                  <TeamCrest team={team} size={96} fallbackClassName="rounded-full bg-surface-secondary text-fg" />
                  <span className="font-condensed text-3xl font-extrabold uppercase italic text-fg sm:text-4xl">{clubShortName(team)}</span>
                </div>
              ))}
              <div className="order-2 flex flex-col items-center gap-4">
                <span className="font-condensed text-2xl font-bold uppercase text-fg-muted">vs</span>
                <NextMatchStatus match={next} />
              </div>
            </div>

            <dl className="grid border-t border-border sm:grid-cols-2">
              <div className="px-5 py-4 sm:px-8">
                <dt className="text-sm text-fg-muted">{t('date')}</dt>
                <dd className="mt-0.5 font-semibold text-fg"><LocalKickoff iso={next.kickoff} locale={locale} kind="long" /></dd>
              </div>
              <div className="border-t border-border px-5 py-4 sm:border-s sm:border-t-0 sm:px-8">
                <dt className="text-sm text-fg-muted">{t('venue')}</dt>
                <dd className="mt-0.5 font-semibold text-fg">{t('venue_mohammed_v')}</dd>
              </div>
            </dl>
            {BASKETBALL_TICKETS[next.id] && (
              <div className="border-t border-border px-5 py-5 sm:px-8">
                <a
                  href={BASKETBALL_TICKETS[next.id]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-wydad-logo font-condensed text-lg font-bold uppercase tracking-wide text-white transition-colors hover:bg-wydad-red-hover sm:w-auto sm:px-8"
                >
                  {t('buy_tickets')}
                  <span className="sr-only"> {t('new_tab')}</span>
                </a>
              </div>
            )}
          </article>
        ) : (
          <p className="mt-6 text-fg-secondary">{t('no_game')}</p>
        )}

        {later.length > 0 && (
          <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
            {later.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
                <span className="font-semibold text-fg" dir="ltr">
                  {clubShortName(m.home_team)} – {clubShortName(m.away_team)}
                </span>
                <span className="text-sm text-fg-muted"><LocalKickoff iso={m.kickoff} locale={locale} kind="long" /></span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-14 flex items-center gap-4 rounded-2xl bg-surface-secondary/60 p-6 sm:p-8">
          <Image src="/images/wydad-crest.svg" alt="" width={48} height={61} className="h-14 w-auto shrink-0" />
          <p className="text-fg-secondary">{t('multisport')}</p>
        </div>

        <div className="mt-16 space-y-16">
          <SectionHighlights section={section} locale={locale} />
          <InstagramFeedGrid feed={feed} title={tSections('latest')} />
        </div>
      </section>
    </div>
  );
}
