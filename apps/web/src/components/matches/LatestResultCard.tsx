import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Match } from '@/types';

interface LatestResultCardProps {
  match: Match;
}

export function LatestResultCard({ match }: LatestResultCardProps) {
  const t = useTranslations('matches');

  const isWydadHome = match.home_team.id === 'wydad';
  const wydadScore = isWydadHome ? match.score_home : match.score_away;
  const opponentScore = isWydadHome ? match.score_away : match.score_home;
  const isWin = (wydadScore ?? 0) > (opponentScore ?? 0);
  const isDraw = wydadScore === opponentScore;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-md"
    >
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-fg-muted">
            {match.competition.short_name} · {t('matchday')} {match.matchday}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              isWin
                ? 'bg-green-100 text-green-700'
                : isDraw
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {isWin ? t('win') : isDraw ? t('draw') : t('loss')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
              <span className="text-xs font-bold">{match.home_team.short_name}</span>
            </div>
            <span className="text-sm font-medium text-fg">{match.home_team.name}</span>
          </div>
          <span className="font-display text-2xl font-bold tabular-nums text-fg">
            {match.score_home}
          </span>
        </div>

        <div className="my-2 border-t border-border" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-secondary">
              <span className="text-xs font-bold">{match.away_team.short_name}</span>
            </div>
            <span className="text-sm font-medium text-fg">{match.away_team.name}</span>
          </div>
          <span className="font-display text-2xl font-bold tabular-nums text-fg">
            {match.score_away}
          </span>
        </div>
      </div>
    </Link>
  );
}
