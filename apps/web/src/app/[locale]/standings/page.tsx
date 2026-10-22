import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FootballNav } from '@/components/team/FootballNav';
import { getStandings } from '@/services/matches';
import { isWydad } from '@/lib/clubs';
import { TeamCrest } from '@/components/ui/TeamCrest';
import { ZONES, ZONE_CELL, zoneFor } from '@/lib/standings-zones';

const FORM_STYLE = {
  W: 'bg-accent-green text-white',
  D: 'bg-fg-muted/40 text-fg',
  L: 'bg-wydad-logo text-white',
} as const;

export default async function StandingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'matches' });
  const standings = await getStandings();
  const hasForm = standings.some((r) => r.form && r.form.length > 0);

  const num = 'px-2 py-3 text-center tabular-nums';

  return (
    <>
    <FootballNav active="standings" />
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <p className="font-condensed text-sm font-bold uppercase tracking-[0.14em] text-wydad-red">
        {t('season_label')}
      </p>
      <h1 className="mt-1 font-condensed text-5xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-6xl">
        {t('standings')}
      </h1>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-secondary/60 text-xs font-semibold uppercase tracking-wide text-fg-muted">
              <th className="w-12 px-3 py-3 text-center">#</th>
              <th className="px-3 py-3 text-start">{t('team')}</th>
              <th className={num}>{t('played_short')}</th>
              <th className={num}>{t('won_short')}</th>
              <th className={num}>{t('drawn_short')}</th>
              <th className={num}>{t('lost_short')}</th>
              <th className={num}>{t('goals_for_short')}</th>
              <th className={num}>{t('goals_against_short')}</th>
              <th className={num}>{t('goal_diff_short')}</th>
              <th className={`${num} text-fg`}>{t('points_short')}</th>
              {hasForm && <th className="px-3 py-3 text-start">{t('form')}</th>}
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const wydad = isWydad(row.team.id);
              return (
                <tr
                  key={row.team.id}
                  className={`border-b border-border last:border-0 ${
                    wydad ? 'bg-wydad-red/[0.06]' : 'hover:bg-surface-secondary/50'
                  }`}
                >
                  <td className={`px-3 py-3 text-center tabular-nums ${zoneFor(row.position) ? ZONE_CELL[zoneFor(row.position)!] : wydad ? 'font-bold text-wydad-red' : 'text-fg-muted'}`}>
                    {row.position}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <TeamCrest
                        team={row.team}
                        size={28}
                        fallbackClassName={`rounded-lg ${wydad ? 'bg-wydad-logo text-white' : 'bg-surface-secondary text-fg-secondary'}`}
                      />
                      <span className={wydad ? 'font-bold text-wydad-red' : 'font-medium text-fg'}>
                        {row.team.name}
                      </span>
                    </div>
                  </td>
                  <td className={`${num} text-fg-secondary`}>{row.played}</td>
                  <td className={`${num} text-fg-secondary`}>{row.won}</td>
                  <td className={`${num} text-fg-secondary`}>{row.drawn}</td>
                  <td className={`${num} text-fg-secondary`}>{row.lost}</td>
                  <td className={`${num} text-fg-secondary`}>{row.goals_for}</td>
                  <td className={`${num} text-fg-secondary`}>{row.goals_against}</td>
                  <td className={num}>
                    <span className={row.goal_difference > 0 ? 'text-accent-green' : row.goal_difference < 0 ? 'text-wydad-red' : 'text-fg-muted'}>
                      {row.goal_difference > 0 ? '+' : ''}
                      {row.goal_difference}
                    </span>
                  </td>
                  <td className={`${num} font-bold text-fg`}>{row.points}</td>
                  {hasForm && (
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        {(row.form ?? []).slice(-5).map((r, i) => (
                          <span key={i} className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${FORM_STYLE[r]}`}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-fg-secondary">
        {ZONES.map((z) => (
          <li key={z} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-sm ${ZONE_CELL[z]}`} aria-hidden />
            {t(`zone_${z}`)}
          </li>
        ))}
      </ul>
    </div>
    </>
  );
}
