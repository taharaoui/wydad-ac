import { useTranslations } from 'next-intl';
import type { MatchStats as MatchStatsType } from '@/types';

interface MatchStatsProps {
  stats: MatchStatsType;
}

function StatBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  const homePercent = (home / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-fg">{home}</span>
        <span className="text-fg-muted">{label}</span>
        <span className="font-semibold text-fg">{away}</span>
      </div>
      <div className="flex h-1.5 gap-1 overflow-hidden rounded-full">
        <div
          className="rounded-full bg-wydad-red transition-all duration-500"
          style={{ width: `${homePercent}%` }}
        />
        <div
          className="flex-1 rounded-full bg-fg-muted/30"
        />
      </div>
    </div>
  );
}

function PossessionBar({ home, away }: { home: number; away: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-fg">{home}%</span>
        <span className="text-sm text-fg-muted">Possession</span>
        <span className="text-2xl font-bold text-fg">{away}%</span>
      </div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        <div
          className="rounded-full bg-wydad-red transition-all duration-500"
          style={{ width: `${home}%` }}
        />
        <div
          className="flex-1 rounded-full bg-accent-blue transition-all duration-500"
        />
      </div>
    </div>
  );
}

export function MatchStatsPanel({ stats }: MatchStatsProps) {
  const t = useTranslations('matches');

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h3 className="mb-5 font-display text-lg font-bold text-fg">
        {t('statistics')}
      </h3>

      <div className="space-y-5">
        <PossessionBar home={stats.possession_home} away={stats.possession_away} />

        <div className="space-y-4">
          <StatBar label={t('shots')} home={stats.shots_home} away={stats.shots_away} />
          <StatBar label={t('shots_on_target')} home={stats.shots_on_target_home} away={stats.shots_on_target_away} />
          <StatBar label={t('corners')} home={stats.corners_home} away={stats.corners_away} />
          <StatBar label={t('fouls')} home={stats.fouls_home} away={stats.fouls_away} />
          <StatBar label={t('offsides')} home={stats.offsides_home} away={stats.offsides_away} />
        </div>
      </div>
    </div>
  );
}
