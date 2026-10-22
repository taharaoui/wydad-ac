import { useTranslations } from 'next-intl';
import type { LineupPlayer } from '@/types';
import { RatingBadge } from './RatingBadge';

interface PlayerOfTheMatchProps {
  player: LineupPlayer;
  teamName: string;
  color: string;
}

const HIGHLIGHTS = ['goals', 'assists', 'total_shots', 'key_passes', 'duel_won', 'tackles', 'saves'];

export function PlayerOfTheMatch({ player, teamName, color }: PlayerOfTheMatchProps) {
  const t = useTranslations('matches');
  const stats = player.stats ?? {};
  const highlights = HIGHLIGHTS.filter((k) => (stats[k] ?? 0) > 0).slice(0, 4);
  const passes = stats.total_passes
    ? `${stats.accurate_passes ?? 0}/${stats.total_passes}`
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent-gold/40 bg-gradient-to-br from-accent-gold-bg via-surface to-surface p-5 sm:p-6">
      <p className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-gold">
        <span aria-hidden>★</span> {t('player_of_the_match')}
      </p>

      <div className="flex items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-accent-gold text-xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {player.number || ''}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-bold text-fg">{player.name}</p>
          <p className="text-sm text-fg-muted">
            {teamName}
            {player.minutes ? <> · {player.minutes}&apos;</> : null}
          </p>
        </div>
        <RatingBadge rating={player.rating} size="lg" />
      </div>

      {(highlights.length > 0 || passes) && (
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {highlights.map((k) => (
            <div key={k} className="rounded-lg bg-surface-secondary px-3 py-2">
              <dt className="truncate text-xs text-fg-muted">{t(`player_stat.${k}`)}</dt>
              <dd className="text-lg font-bold tabular-nums text-fg">{stats[k]}</dd>
            </div>
          ))}
          {passes && (
            <div className="rounded-lg bg-surface-secondary px-3 py-2">
              <dt className="truncate text-xs text-fg-muted">{t('player_stat.accurate_passes')}</dt>
              <dd className="text-lg font-bold tabular-nums text-fg">{passes}</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
