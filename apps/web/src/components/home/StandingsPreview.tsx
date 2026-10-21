import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { StandingRow } from '@/types';

interface StandingsPreviewProps {
  standings: StandingRow[];
}

export function StandingsPreview({ standings }: StandingsPreviewProps) {
  const t = useTranslations('matches');

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h3 className="font-display text-sm font-bold text-fg">{t('standings')}</h3>
        <Link
          href="/matches"
          className="group/link inline-flex items-center gap-1 text-xs font-medium text-wydad-red transition-colors hover:text-wydad-red-hover"
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
            <tr className="border-b border-border bg-surface-secondary/50 text-xs text-fg-muted">
              <th className="px-3 py-2.5 text-start">#</th>
              <th className="px-3 py-2.5 text-start">{t('team')}</th>
              <th className="px-3 py-2.5 text-center">{t('played_short')}</th>
              <th className="px-3 py-2.5 text-center">{t('goal_diff_short')}</th>
              <th className="px-3 py-2.5 text-center font-bold">{t('points_short')}</th>
            </tr>
          </thead>
          <tbody>
            {standings.slice(0, 6).map((row) => {
              const isWydad = row.team.id === 'wydad';
              return (
                <tr
                  key={row.position}
                  className={`border-b border-border last:border-0 transition-colors ${
                    isWydad
                      ? 'bg-wydad-red/[0.04] hover:bg-wydad-red/[0.08]'
                      : 'hover:bg-surface-secondary/50'
                  }`}
                >
                  <td className="px-3 py-3 tabular-nums text-fg-muted">{row.position}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold ${
                        isWydad
                          ? 'bg-wydad-red text-white'
                          : 'bg-surface-secondary text-fg-secondary'
                      }`}>
                        {row.team.short_name.slice(0, 2)}
                      </div>
                      <span className={isWydad ? 'font-bold text-wydad-red' : 'text-fg'}>
                        {row.team.short_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center tabular-nums text-fg-muted">{row.played}</td>
                  <td className="px-3 py-3 text-center tabular-nums text-fg-muted">
                    <span className={row.goal_difference > 0 ? 'text-accent-green' : row.goal_difference < 0 ? 'text-wydad-red' : ''}>
                      {row.goal_difference > 0 ? '+' : ''}
                      {row.goal_difference}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold tabular-nums ${
                      isWydad
                        ? 'bg-wydad-red text-white'
                        : 'bg-surface-secondary text-fg'
                    }`}>
                      {row.points}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
