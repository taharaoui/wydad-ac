import { useTranslations } from 'next-intl';
import type { Match } from '@/types';
import { TeamCrest } from '@/components/ui/TeamCrest';
import { MatchCountdown } from './MatchCountdown';

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
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-wydad-logo via-wydad-logo to-wydad-red-dark p-6 text-white shadow-lg shadow-wydad-red/20 transition-shadow hover:shadow-xl hover:shadow-wydad-red/30 sm:p-8">
      {/* Subtle diagonal pattern */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              white 20px,
              white 21px
            )`,
          }}
        />
      </div>

      {/* Glow on hover */}
      <div className="absolute -top-20 -end-20 h-40 w-40 rounded-full bg-white/[0.08] blur-3xl transition-all duration-500 group-hover:bg-white/[0.12]" />

      <div className="relative">
        {/* Competition badge */}
        <div className="mb-5 flex items-center justify-between">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            {match.competition.short_name} · {t('matchday')} {match.matchday}
          </span>
          <span className="text-body-sm text-white/70">{match.venue}</span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="flex h-16 w-16 items-center justify-center transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20">
              <TeamCrest team={match.home_team} size={64} fallbackClassName="rounded-2xl bg-white/15 font-display text-white" />
            </div>
            <span className="text-sm font-medium text-white/90">{match.home_team.name}</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="font-display text-2xl font-bold tracking-tight text-white/30 sm:text-3xl">VS</span>
            <span className="text-sm font-medium text-white/70">{timeStr}</span>
          </div>

          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="flex h-16 w-16 items-center justify-center transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20">
              <TeamCrest team={match.away_team} size={64} fallbackClassName="rounded-2xl bg-white/15 font-display text-white" />
            </div>
            <span className="text-sm font-medium text-white/90">{match.away_team.name}</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="mt-6 rounded-xl bg-black/20 px-4 py-3 backdrop-blur-sm">
          <MatchCountdown kickoff={match.kickoff} />
        </div>

        {/* Date */}
        <p className="mt-4 text-center text-body-sm text-white/60">{dateStr}</p>
      </div>
    </div>
  );
}
