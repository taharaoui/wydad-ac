import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { StandingRow } from '@/types';
import { clubShortName, isWydad as isWydadTeam } from '@/lib/clubs';
import { ZONES, ZONE_CELL, zoneFor } from '@/lib/standings-zones';
import { TeamCrest } from '@/components/ui/TeamCrest';

interface StandingsPreviewProps {
  standings: StandingRow[];
  /** Title set in the CMS (home_sections) */
  title?: string;
}

/** Full league table in the classic broadcast style: red title bar, coloured position cells for each zone. */
export function StandingsPreview({ standings, title }: StandingsPreviewProps) {
  const t = useTranslations('matches');
  const num = 'px-1 py-2.5 text-center tabular-nums sm:px-2.5';

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between bg-wydad-logo px-4 py-2.5 text-white">
        <h3 className="font-condensed text-lg font-bold uppercase tracking-wide">{title ?? t('season_title')}</h3>
        <Link
          href="/standings"
          className="group/link inline-flex items-center gap-1 text-xs font-semibold text-white/90 transition-colors hover:text-white"
        >
          {t('view_all')}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-0.5 rtl:rotate-180 rtl:group-hover/link:-translate-x-0.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-semibold text-fg-muted">
              <th className="w-10 px-1 py-2 text-center sm:w-12">{t('pos_short')}</th>
              <th className="px-2 py-2 text-start">{t('team')}</th>
              <th className={num}>{t('played_short')}</th>
              <th className={num}>{t('won_short')}</th>
              <th className={num}>{t('drawn_short')}</th>
              <th className={num}>{t('lost_short')}</th>
              <th className={num}>{t('gd_short_sign')}</th>
              <th className={`${num} text-fg`}>{t('points_short')}</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => {
              const wydad = isWydadTeam(row.team.id);
              const zone = zoneFor(row.position);
              // Dashed line where one zone ends and the next begins
              const nextZone = standings[i + 1] ? zoneFor(standings[i + 1].position) : zone;
              const boundary = i < standings.length - 1 && nextZone !== zone;
              return (
                <tr
                  key={row.team.id}
                  className={`${boundary ? 'border-b border-dashed border-fg-muted/50' : 'border-b border-border'} last:border-0 transition-colors ${
                    wydad ? 'bg-fg/[0.07]' : 'hover:bg-surface-secondary/60'
                  }`}
                >
                  <td className={`px-1 py-2.5 text-center font-semibold tabular-nums ${zone ? ZONE_CELL[zone] : 'text-fg-secondary'}`}>
                    {row.position}
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <TeamCrest team={row.team} size={22} fallbackClassName="rounded-full bg-surface-secondary text-fg-secondary" />
                      <span className={`max-w-[9rem] truncate ${wydad ? 'font-bold text-fg' : 'text-fg'}`}>{clubShortName(row.team)}</span>
                    </div>
                  </td>
                  <td className={`${num} text-fg-secondary`}>{row.played}</td>
                  <td className={`${num} text-fg-secondary`}>{row.won}</td>
                  <td className={`${num} text-fg-secondary`}>{row.drawn}</td>
                  <td className={`${num} text-fg-secondary`}>{row.lost}</td>
                  <td className={`${num} text-fg-secondary`}>{row.goal_difference}</td>
                  <td className={`${num} font-bold text-fg`}>{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <ul className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border px-4 py-3 text-xs text-fg-secondary">
        {ZONES.map((z) => (
          <li key={z} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-sm ${ZONE_CELL[z]}`} aria-hidden />
            {t(`zone_${z}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
