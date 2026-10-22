import { useTranslations } from 'next-intl';
import type { MatchStats as MatchStatsType, StatRow } from '@/types';

interface MatchStatsProps {
  stats: MatchStatsType;
  homeColor: string;
  awayColor: string;
}

type Colors = { home: string; away: string };

function formatValue(row: StatRow, value: number): string {
  if (row.unit === 'percent') return `${value}%`;
  if (row.unit === 'decimal') return value.toFixed(2);
  return String(value);
}

function StatBar({ row, label, colors }: { row: StatRow; label: string; colors: Colors }) {
  const total = row.home + row.away;
  const homePercent = total > 0 ? (row.home / total) * 100 : 50;
  const homeLeads = row.home > row.away;
  const awayLeads = row.away > row.home;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span
          className={`min-w-[3rem] rounded-md px-1.5 py-0.5 text-start font-semibold tabular-nums ${homeLeads ? 'text-white' : 'text-fg'}`}
          style={homeLeads ? { backgroundColor: colors.home } : undefined}
        >
          {formatValue(row, row.home)}
        </span>
        <span className="text-center text-fg-muted">{label}</span>
        <span
          className={`min-w-[3rem] rounded-md px-1.5 py-0.5 text-end font-semibold tabular-nums ${awayLeads ? 'text-white' : 'text-fg'}`}
          style={awayLeads ? { backgroundColor: colors.away } : undefined}
        >
          {formatValue(row, row.away)}
        </span>
      </div>
      <div className="flex h-1.5 gap-1">
        <div className="flex flex-1 justify-end overflow-hidden rounded-full bg-fg-muted/15">
          <div className="rounded-full transition-all duration-500" style={{ width: `${homePercent}%`, backgroundColor: colors.home }} />
        </div>
        <div className="flex flex-1 overflow-hidden rounded-full bg-fg-muted/15">
          <div className="rounded-full transition-all duration-500" style={{ width: `${100 - homePercent}%`, backgroundColor: colors.away }} />
        </div>
      </div>
    </div>
  );
}

function PossessionBar({ home, away, label, colors }: { home: number; away: number; label: string; colors: Colors }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold tabular-nums text-fg">{home}%</span>
        <span className="text-sm text-fg-muted">{label}</span>
        <span className="text-2xl font-bold tabular-nums text-fg">{away}%</span>
      </div>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
        <div className="rounded-full transition-all duration-500" style={{ width: `${home}%`, backgroundColor: colors.home }} />
        <div className="flex-1 rounded-full transition-all duration-500" style={{ backgroundColor: colors.away }} />
      </div>
    </div>
  );
}

export function MatchStatsPanel({ stats, homeColor, awayColor }: MatchStatsProps) {
  const t = useTranslations('matches');
  const colors = { home: homeColor, away: awayColor };

  const label = (key: string) =>
    t.has(`stat.${key}`) ? t(`stat.${key}`) : key.replace(/_/g, ' ');

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h3 className="mb-5 font-display text-lg font-bold text-fg">
        {t('statistics')}
      </h3>

      <div className="space-y-8">
        {stats.groups.map((group) => {
          const possession = group.rows.find((r) => r.key === 'ball_possession');
          const rows = group.rows.filter((r) => r !== possession);
          return (
            <section key={group.key}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-fg-muted">
                {t.has(`stat_groups.${group.key}`) ? t(`stat_groups.${group.key}`) : group.key}
              </h4>
              <div className="space-y-4">
                {possession && (
                  <PossessionBar home={possession.home} away={possession.away} label={label('ball_possession')} colors={colors} />
                )}
                {rows.map((row) => (
                  <StatBar key={row.key} row={row} label={label(row.key)} colors={colors} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
