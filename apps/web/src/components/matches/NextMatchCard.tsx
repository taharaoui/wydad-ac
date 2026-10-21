import { useTranslations } from 'next-intl';
import type { Match } from '@/types';

interface NextMatchCardProps {
  match: Match;
  locale: string;
}

export function NextMatchCard({ match, locale }: NextMatchCardProps) {
  const t = useTranslations('matches');

  const kickoffDate = new Date(match.kickoff);
  const dateStr = kickoffDate.toLocaleDateString(locale === 'ar' ? 'ar-MA' : locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const timeStr = kickoffDate.toLocaleTimeString(locale === 'ar' ? 'ar-MA' : locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-wydad-red to-wydad-red-dark p-6 text-white shadow-lg sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
          {match.competition.short_name} · {t('matchday')} {match.matchday}
        </span>
        <span className="text-sm text-white/80">{match.venue}</span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 sm:h-20 sm:w-20">
            <span className="font-display text-xl font-bold">{match.home_team.short_name}</span>
          </div>
          <span className="text-sm font-medium">{match.home_team.name}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-3xl font-bold tracking-tight text-white/40">VS</span>
          <span className="text-sm text-white/80">{timeStr}</span>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 sm:h-20 sm:w-20">
            <span className="font-display text-xl font-bold">{match.away_team.short_name}</span>
          </div>
          <span className="text-sm font-medium">{match.away_team.name}</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-white/70">{dateStr}</p>
      </div>
    </div>
  );
}
