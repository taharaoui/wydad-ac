import { useTranslations } from 'next-intl';
import type { Match } from '@/types';
import type { MatchContext } from '@/services/matches';
import { resultFor } from '@/lib/match-summary';
import { clubShortName } from '@/lib/clubs';
import { TeamCrest } from '@/components/ui/TeamCrest';
import { MatchResultList } from './FormGuide';

interface H2HPanelProps {
  context: MatchContext;
  wydad: Match['home_team'];
  dateOf: (m: Match) => string;
}

export function H2HPanel({ context, wydad, dateOf }: H2HPanelProps) {
  const t = useTranslations('matches');
  const { h2h, opponent } = context;
  const results = h2h.map((m) => resultFor(m, wydad.id));
  const wins = results.filter((r) => r === 'W').length;
  const draws = results.filter((r) => r === 'D').length;
  const losses = results.filter((r) => r === 'L').length;
  const total = Math.max(1, h2h.length);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-base font-bold text-fg">{t('head_to_head')}</h3>
          <span className="text-xs text-fg-muted">{t('h2h_scope')}</span>
        </div>
        {h2h.length === 0 ? (
          <p className="mt-4 text-sm text-fg-muted">{t('no_h2h')}</p>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-3 items-end text-center">
              {[
                [wins, t('wins_of', { team: clubShortName(wydad) }), wydad],
                [draws, t('draws'), null],
                [losses, t('wins_of', { team: clubShortName(opponent) }), opponent],
              ].map(([n, label, team], i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  {team ? <TeamCrest team={team as Match['home_team']} size={32} fallbackClassName="rounded-full bg-surface-secondary text-fg-muted" /> : <span className="h-8" />}
                  <span className="font-condensed text-4xl font-extrabold leading-none text-fg">{n as number}</span>
                  <span className="text-xs text-fg-muted">{label as string}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex h-2 overflow-hidden rounded-full" dir="ltr">
              <div className="bg-wydad-logo" style={{ width: `${(wins / total) * 100}%` }} />
              <div className="bg-fg-muted/40" style={{ width: `${(draws / total) * 100}%` }} />
              <div className="bg-accent-blue" style={{ width: `${(losses / total) * 100}%` }} />
            </div>
            <div className="mt-4">
              <MatchResultList matches={h2h} teamId={wydad.id} dateOf={dateOf} />
            </div>
          </>
        )}
      </section>

      {[
        [wydad, context.wydadForm],
        [opponent, context.opponentForm],
      ].map(([team, matches]) => {
        const tm = team as Match['home_team'];
        const list = matches as Match[];
        return (
          <section key={tm.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="mb-2 flex items-center gap-2">
              <TeamCrest team={tm} size={24} fallbackClassName="rounded-full bg-surface-secondary text-fg-muted" />
              <h3 className="font-display text-base font-bold text-fg">{tm.name}</h3>
              <span className="ms-auto text-xs text-fg-muted">{t('recent_form')}</span>
            </div>
            {list.length === 0 ? (
              <p className="py-3 text-sm text-fg-muted">{t('no_form')}</p>
            ) : (
              <MatchResultList matches={list} teamId={tm.id} dateOf={dateOf} />
            )}
          </section>
        );
      })}
    </div>
  );
}
