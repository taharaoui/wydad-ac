import { useTranslations } from 'next-intl';
import type { Lineup, LineupPlayer } from '@/types';

interface MatchLineupProps {
  homeLineup: Lineup;
  awayLineup: Lineup;
  homeTeamName: string;
  awayTeamName: string;
}

function PlayerRow({ player, isHome }: { player: LineupPlayer; isHome: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-secondary ${
      isHome ? 'flex-row' : 'flex-row-reverse'
    }`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-xs font-bold text-fg-secondary">
        {player.number}
      </span>
      <span className={`min-w-0 flex-1 truncate text-sm font-medium text-fg ${
        isHome ? 'text-start' : 'text-end'
      }`}>
        {player.short_name}
        {player.is_captain && (
          <span className="ms-1 text-xs text-wydad-red">(C)</span>
        )}
      </span>
      {player.substituted_out && (
        <span className="shrink-0 text-xs text-wydad-red">
          ↓ {player.substituted_out}&apos;
        </span>
      )}
      {player.substituted_in && (
        <span className="shrink-0 text-xs text-accent-green">
          ↑ {player.substituted_in}&apos;
        </span>
      )}
    </div>
  );
}

export function MatchLineup({ homeLineup, awayLineup, homeTeamName, awayTeamName }: MatchLineupProps) {
  const t = useTranslations('matches');

  const homeStarters = homeLineup.players.filter(p => p.is_starter);
  const homeSubs = homeLineup.players.filter(p => !p.is_starter);
  const awayStarters = awayLineup.players.filter(p => p.is_starter);
  const awaySubs = awayLineup.players.filter(p => !p.is_starter);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h3 className="mb-5 font-display text-lg font-bold text-fg">
        {t('lineup')}
      </h3>

      {/* Formation badges */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-fg">{homeTeamName}</span>
          <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-bold text-fg-secondary">
            {homeLineup.formation}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-bold text-fg-secondary">
            {awayLineup.formation}
          </span>
          <span className="text-sm font-semibold text-fg">{awayTeamName}</span>
        </div>
      </div>

      {/* Starters */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">
          {t('starters')}
        </p>
        <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
          <div className="space-y-0">
            {homeStarters.map(player => (
              <PlayerRow key={player.id} player={player} isHome={true} />
            ))}
          </div>
          <div className="mt-2 border-t border-border pt-2 sm:mt-0 sm:border-t-0 sm:pt-0">
            {awayStarters.map(player => (
              <PlayerRow key={player.id} player={player} isHome={false} />
            ))}
          </div>
        </div>
      </div>

      {/* Substitutes */}
      {(homeSubs.length > 0 || awaySubs.length > 0) && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">
            {t('substitutes')}
          </p>
          <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
            <div className="space-y-0">
              {homeSubs.map(player => (
                <PlayerRow key={player.id} player={player} isHome={true} />
              ))}
            </div>
            <div className="mt-2 border-t border-border pt-2 sm:mt-0 sm:border-t-0 sm:pt-0">
              {awaySubs.map(player => (
                <PlayerRow key={player.id} player={player} isHome={false} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
