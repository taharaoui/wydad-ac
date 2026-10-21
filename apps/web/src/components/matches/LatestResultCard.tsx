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
      className="group block overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all hover:shadow-card-hover hover:border-border-hover"
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium text-fg-muted">
            {match.competition.short_name} · {t('matchday')} {match.matchday}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              isWin
                ? 'bg-accent-green/10 text-accent-green'
                : isDraw
                ? 'bg-accent-gold/10 text-accent-gold'
                : 'bg-wydad-red/10 text-wydad-red'
            }`}
          >
            {isWin ? t('win') : isDraw ? t('draw') : t('loss')}
          </span>
        </div>

        {/* Home team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-secondary transition-colors group-hover:bg-surface-elevated">
              <span className="text-xs font-bold text-fg-secondary">{match.home_team.short_name}</span>
            </div>
            <span className="text-sm font-semibold text-fg">{match.home_team.name}</span>
          </div>
          <span className="font-display text-2xl font-bold tabular-nums text-fg">
            {match.score_home}
          </span>
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-border" />

        {/* Away team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-secondary transition-colors group-hover:bg-surface-elevated">
              <span className="text-xs font-bold text-fg-secondary">{match.away_team.short_name}</span>
            </div>
            <span className="text-sm font-semibold text-fg">{match.away_team.name}</span>
          </div>
          <span className="font-display text-2xl font-bold tabular-nums text-fg">
            {match.score_away}
          </span>
        </div>

        {/* View details hint */}
        <div className="mt-4 flex items-center justify-end gap-1 text-xs font-medium text-fg-muted opacity-0 transition-opacity group-hover:opacity-100">
          <span>{t('full_time')}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
