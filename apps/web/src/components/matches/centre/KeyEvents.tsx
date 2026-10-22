import { useTranslations } from 'next-intl';
import type { Match } from '@/types';
import type { MatchSummary, Side } from '@/lib/match-summary';
import { TeamCrest } from '@/components/ui/TeamCrest';

function Row({ side, children }: { side: Side; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-3 py-2 text-sm ${side === 'away' ? 'flex-row-reverse text-end' : ''}`}>
      {children}
    </li>
  );
}

function Card({ color }: { color: 'yellow' | 'red' }) {
  return <span className={`h-4 w-3 shrink-0 rounded-[2px] ${color === 'red' ? 'bg-red-600' : 'bg-yellow-400'}`} />;
}

/** Goals, cards and substitutions, home on the left and away on the right (as on SofaScore). */
export function KeyEvents({ match, summary }: { match: Match; summary: MatchSummary }) {
  const t = useTranslations('matches');
  const empty = summary.goals.length + summary.cards.length + summary.subs.length === 0;

  const section = (title: string, items: React.ReactNode[]) =>
    items.length > 0 && (
      <div>
        <p className="mb-1 mt-4 text-center text-[11px] font-semibold uppercase tracking-wider text-fg-muted">{title}</p>
        <ul className="divide-y divide-border">{items}</ul>
      </div>
    );

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <TeamCrest team={match.home_team} size={22} fallbackClassName="rounded-full bg-surface-secondary text-fg-muted" />
        <h3 className="font-display text-base font-bold text-fg">{t('key_events')}</h3>
        <TeamCrest team={match.away_team} size={22} fallbackClassName="rounded-full bg-surface-secondary text-fg-muted" />
      </div>

      {empty ? (
        <p className="mt-4 text-center text-sm text-fg-muted">{t('no_events')}</p>
      ) : (
        <>
          {section(
            t('goals_title'),
            summary.goals.map((g) => (
              <Row key={`g-${g.player}`} side={g.side}>
                <span className="shrink-0" aria-hidden>⚽</span>
                <span className="min-w-0">
                  <span className="font-semibold text-fg">{g.player}</span>
                  {g.count > 1 && <span className="text-fg-muted"> ×{g.count}</span>}
                </span>
              </Row>
            )),
          )}
          {section(
            t('cards_title'),
            summary.cards.map((c) => (
              <Row key={`c-${c.player}`} side={c.side}>
                <Card color={c.color} />
                <span className="min-w-0 truncate text-fg">{c.player}</span>
              </Row>
            )),
          )}
          {section(
            t('subs_title'),
            summary.subs.map((s) => (
              <Row key={`s-${s.playerIn}`} side={s.side}>
                <span className="w-8 shrink-0 text-xs font-semibold tabular-nums text-fg-muted">{s.minute != null ? `${s.minute}'` : ''}</span>
                <span className="min-w-0">
                  <span className="block truncate text-fg"><span className="text-accent-green">↑ </span>{s.playerIn}</span>
                  {s.playerOut && <span className="block truncate text-xs text-fg-muted"><span className="text-wydad-red">↓ </span>{s.playerOut}</span>}
                </span>
              </Row>
            )),
          )}
          <p className="mt-4 text-center text-[11px] text-fg-muted">{t('events_note')}</p>
        </>
      )}
    </section>
  );
}
