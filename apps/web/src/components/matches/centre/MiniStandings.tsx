import { useTranslations } from 'next-intl';
import type { StandingRow } from '@/types';
import { Link } from '@/i18n/navigation';
import { isWydad } from '@/lib/clubs';
import { TeamCrest } from '@/components/ui/TeamCrest';

/** The two teams' rows from the current table. */
export function MiniStandings({ standings, teamIds }: { standings: StandingRow[]; teamIds: string[] }) {
  const t = useTranslations('matches');
  const rows = standings.filter((r) => teamIds.includes(r.team.id));
  if (rows.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-fg">{t('standings')}</h3>
        <Link href="/standings" className="text-xs font-medium text-wydad-red hover:underline">{t('full_table')}</Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-fg-muted">
            <th className="py-2 text-start font-medium">#</th>
            <th className="py-2 text-start font-medium">{t('team')}</th>
            <th className="py-2 text-center font-medium">{t('played_short')}</th>
            <th className="py-2 text-center font-medium">{t('goal_diff_short')}</th>
            <th className="py-2 text-center font-medium">{t('points_short')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.team.id} className={`border-t border-border ${isWydad(r.team.id) ? 'font-semibold text-wydad-red' : 'text-fg'}`}>
              <td className="py-2.5 tabular-nums">{r.position}</td>
              <td className="py-2.5">
                <span className="flex items-center gap-2">
                  <TeamCrest team={r.team} size={20} fallbackClassName="rounded-full bg-surface-secondary text-fg-muted" />
                  <span className="truncate">{r.team.name}</span>
                </span>
              </td>
              <td className="py-2.5 text-center tabular-nums">{r.played}</td>
              <td className="py-2.5 text-center tabular-nums">{r.goal_difference > 0 ? '+' : ''}{r.goal_difference}</td>
              <td className="py-2.5 text-center font-bold tabular-nums">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
