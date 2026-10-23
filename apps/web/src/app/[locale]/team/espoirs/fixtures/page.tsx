import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getEspoirMatches } from '@/services/matches';
import { clubShortName } from '@/lib/clubs';
import { formatKickoffLong } from '@/lib/datetime';
import { TeamCrest } from '@/components/ui/TeamCrest';
import { FootballNav } from '@/components/team/FootballNav';
import { PendingNotice } from '@/components/basketball/SectionPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'football' });
  return { title: `${t('fixtures')} · ${t('espoirs')}` };
}

/** Wydad AC Espoir (U23) fixtures and results, from TheStatsAPI when published */
export default async function EspoirsFixturesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'football' });
  const matches = await getEspoirMatches();

  return (
    <div>
      <FootballNav sport="espoirs" active="fixtures" />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <h1 className="font-condensed text-6xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-7xl">{t('fixtures')}</h1>
        <p className="mt-3 font-condensed text-2xl font-bold text-fg">
          {t('espoirs')} · {t('season')}
        </p>
        <div className="mt-12">
          {matches.length === 0 ? (
            <PendingNotice text={t('espoirs_fixtures_pending')} />
          ) : (
            <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
              {matches.map((m) => {
                const played = m.status === 'finished' || m.status === 'live';
                return (
                  <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 px-5 py-4 sm:px-8">
                    <span className="flex min-w-0 items-center justify-end gap-3 font-semibold text-fg">
                      <span className="truncate">{clubShortName(m.home_team)}</span>
                      <TeamCrest team={m.home_team} size={28} fallbackClassName="rounded-full bg-surface-secondary text-fg" />
                    </span>
                    <span className="text-center">
                      <span className="block font-condensed text-xl font-extrabold tabular-nums text-fg" dir="ltr">
                        {played ? `${m.score_home}-${m.score_away}` : 'vs'}
                      </span>
                      <span className="block text-xs text-fg-muted">{formatKickoffLong(m.kickoff, locale)}</span>
                    </span>
                    <span className="flex min-w-0 items-center gap-3 font-semibold text-fg">
                      <TeamCrest team={m.away_team} size={28} fallbackClassName="rounded-full bg-surface-secondary text-fg" />
                      <span className="truncate">{clubShortName(m.away_team)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
