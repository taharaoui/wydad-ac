import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { StandingRow } from '@/types';

interface StandingsPreviewProps {
  standings: StandingRow[];
}

export function StandingsPreview({ standings }: StandingsPreviewProps) {
  const t = useTranslations('matches');

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="font-display text-sm font-semibold text-fg">{t('standings')}</h3>
        <Link
          href="/matches"
          className="text-xs font-medium text-wydad-red hover:text-wydad-red-hover transition-colors"
        >
          {t('view_all')}
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-secondary text-xs text-fg-muted">
              <th className="px-3 py-2 text-start">#</th>
              <th className="px-3 py-2 text-start">{t('team')}</th>
              <th className="px-3 py-2 text-center">{t('played_short')}</th>
              <th className="px-3 py-2 text-center">{t('goal_diff_short')}</th>
              <th className="px-3 py-2 text-center font-bold">{t('points_short')}</th>
            </tr>
          </thead>
          <tbody>
            {standings.slice(0, 6).map((row) => {
              const isWydad = row.team.id === 'wydad';
              return (
                <tr
                  key={row.position}
                  className={`border-b border-border last:border-0 ${
                    isWydad ? 'bg-wydad-red-soft font-medium' : ''
                  }`}
                >
                  <td className="px-3 py-2.5 text-fg-muted">{row.position}</td>
                  <td className="px-3 py-2.5">
                    <span className={isWydad ? 'text-wydad-red font-semibold' : 'text-fg'}>
                      {row.team.short_name}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-fg-muted">{row.played}</td>
                  <td className="px-3 py-2.5 text-center text-fg-muted">
                    {row.goal_difference > 0 ? '+' : ''}
                    {row.goal_difference}
                  </td>
                  <td className="px-3 py-2.5 text-center font-bold text-fg">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
