import { useTranslations } from 'next-intl';
import type { MatchEvent } from '@/types';

interface MatchEventsProps {
  events: MatchEvent[];
  homeTeamId: string;
}

function EventIcon({ type }: { type: MatchEvent['type'] }) {
  switch (type) {
    case 'goal':
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-green text-white">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      );
    case 'own_goal':
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-fg-muted text-white">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      );
    case 'yellow_card':
      return (
        <div className="h-5 w-3.5 rounded-[2px] bg-yellow-400" />
      );
    case 'red_card':
      return (
        <div className="h-5 w-3.5 rounded-[2px] bg-red-600" />
      );
    case 'substitution':
      return (
        <div className="flex h-7 w-7 items-center justify-center">
          <svg className="h-5 w-5 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M7 17l-4-4 4-4M17 7l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
    case 'penalty_scored':
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-green text-xs font-bold text-white">
          P
        </div>
      );
    case 'penalty_missed':
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-fg-muted text-xs font-bold text-white">
          P
        </div>
      );
    case 'var':
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-accent-blue text-xs font-bold text-accent-blue">
          V
        </div>
      );
    default:
      return null;
  }
}

export function MatchEvents({ events, homeTeamId }: MatchEventsProps) {
  const t = useTranslations('matches');

  if (!events.length) return null;

  const sortedEvents = [...events].sort((a, b) => {
    const minuteA = a.minute + (a.added_time || 0) * 0.01;
    const minuteB = b.minute + (b.added_time || 0) * 0.01;
    return minuteA - minuteB;
  });

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h3 className="mb-5 font-display text-lg font-bold text-fg">
        {t('events')}
      </h3>

      <div className="space-y-1">
        {sortedEvents.map((event) => {
          const isHome = event.team_id === homeTeamId;

          return (
            <div
              key={event.id}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-secondary ${
                isHome ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              {/* Minute */}
              <span className="w-10 shrink-0 text-center font-mono text-sm font-semibold text-fg-muted">
                {event.minute}&apos;
                {event.added_time ? `+${event.added_time}` : ''}
              </span>

              {/* Icon */}
              <div className="shrink-0">
                <EventIcon type={event.type} />
              </div>

              {/* Player info */}
              <div className={`min-w-0 flex-1 ${isHome ? 'text-start' : 'text-end'}`}>
                <p className="truncate text-sm font-semibold text-fg">
                  {event.player_name}
                </p>
                {event.assist_name && (
                  <p className="truncate text-xs text-fg-muted">
                    {event.assist_name}
                  </p>
                )}
                <p className="text-xs text-fg-muted">
                  {t(event.type)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
