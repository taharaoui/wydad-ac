import type { Match } from '@/types';
import { resultFor } from '@/lib/match-summary';
import { clubShortName } from '@/lib/clubs';
import { Link } from '@/i18n/navigation';
import { TeamCrest } from '@/components/ui/TeamCrest';

const PILL = {
  W: 'bg-accent-green text-white',
  D: 'bg-fg-muted/50 text-white',
  L: 'bg-wydad-logo text-white',
} as const;

/** Five W/D/L pills, oldest → newest, with the score on hover. */
export function FormPills({ matches, teamId }: { matches: Match[]; teamId: string }) {
  return (
    <div className="flex gap-1" dir="ltr">
      {[...matches].reverse().map((m) => {
        const r = resultFor(m, teamId);
        if (!r) return null;
        return (
          <Link
            key={m.id}
            href={`/matches/${m.id}`}
            title={`${clubShortName(m.home_team)} ${m.score_home}-${m.score_away} ${clubShortName(m.away_team)}`}
            className={`flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold ${PILL[r]}`}
          >
            {r}
          </Link>
        );
      })}
    </div>
  );
}

/** Result rows: date, both crests, score, W/D/L from `teamId`'s side. */
export function MatchResultList({ matches, teamId, dateOf }: { matches: Match[]; teamId: string; dateOf: (m: Match) => string }) {
  return (
    <ul className="divide-y divide-border">
      {matches.map((m) => {
        const r = resultFor(m, teamId);
        return (
          <li key={m.id}>
            <Link href={`/matches/${m.id}`} className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3 py-2.5 text-sm hover:bg-surface-secondary/60">
              <span className="text-xs tabular-nums text-fg-muted">{dateOf(m)}</span>
              <span className="grid min-w-0 gap-1">
                {[m.home_team, m.away_team].map((tm, i) => (
                  <span key={tm.id} className="flex min-w-0 items-center gap-2">
                    <TeamCrest team={tm} size={18} fallbackClassName="rounded-full bg-surface-secondary text-fg-muted" />
                    <span className={`truncate ${tm.id === teamId ? 'font-semibold text-fg' : 'text-fg-secondary'}`}>{tm.name}</span>
                    <span className="ms-auto font-semibold tabular-nums text-fg">{i === 0 ? m.score_home : m.score_away}</span>
                  </span>
                ))}
              </span>
              {r && <span className={`flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold ${PILL[r]}`}>{r}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
