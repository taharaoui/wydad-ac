import { Link } from '@/i18n/navigation';
import type { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const positionColors: Record<string, string> = {
    goalkeeper: 'bg-accent-gold-bg text-accent-gold',
    defender: 'bg-accent-blue-bg text-accent-blue',
    midfielder: 'bg-accent-green-bg text-accent-green',
    forward: 'bg-wydad-red-soft text-wydad-red',
  };

  return (
    <Link
      href={`/team/${player.id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-wydad-red/30 hover:shadow-md"
    >
      {/* Photo placeholder */}
      <div className="relative aspect-[3/4] bg-gradient-to-b from-surface-secondary to-surface-dark/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-6xl font-bold text-fg-muted/20">
            {player.number}
          </span>
        </div>
        {/* Number badge */}
        <div className="absolute start-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-surface-dark text-sm font-bold text-white">
          {player.number}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="font-display text-base font-bold text-fg group-hover:text-wydad-red transition-colors">
          {player.short_name}
        </p>
        <p className="mt-0.5 text-xs text-fg-muted">{player.name}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${positionColors[player.position] || ''}`}>
            {player.position}
          </span>
          {player.stats && (
            <div className="flex items-center gap-3 text-xs text-fg-muted">
              {player.stats.goals > 0 && (
                <span className="font-semibold text-fg">{player.stats.goals} ⚽</span>
              )}
              {player.stats.assists > 0 && (
                <span>{player.stats.assists} 🅰️</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
