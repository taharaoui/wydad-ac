'use client';

import { useState, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import type { Lineup, LineupPlayer } from '@/types';
import { RatingBadge } from './RatingBadge';
import { TeamCrest } from '@/components/ui/TeamCrest';

type Side = 'home' | 'away';

interface TeamInfo {
  team: { id: string; name: string; short_name: string; logo_url?: string };
  name: string;
  lineup: Lineup;
  /** Shirt colour on the pitch */
  color: string;
  /** Average player rating (SofaScore-style team rating) */
  rating?: number | null;
  coach?: string;
}

interface MatchPitchProps {
  home: TeamInfo;
  away: TeamInfo;
  playerOfTheMatchId?: string;
  /** player id → photo URL, for players with an uploaded photo */
  photos?: Record<string, string>;
}

// ── Layout ──

/** Split starters into rows (GK first) using the formation; fall back to position lines. */
function pitchRows(lineup: Lineup): LineupPlayer[][] {
  const starters = lineup.players.filter((p) => p.is_starter);
  const gk = starters.filter((p) => p.position === 'goalkeeper');
  const outfield = starters.filter((p) => p.position !== 'goalkeeper');
  const counts = lineup.formation.split('-').map(Number).filter((n) => n > 0);

  if (gk.length === 1 && counts.reduce((a, b) => a + b, 0) === outfield.length) {
    const rows = [gk];
    let i = 0;
    for (const c of counts) {
      rows.push(outfield.slice(i, i + c));
      i += c;
    }
    return rows;
  }

  // Source data doesn't match the formation (e.g. 12 listed starters): group by position
  return (['goalkeeper', 'defender', 'midfielder', 'forward'] as const)
    .map((pos) => starters.filter((p) => p.position === pos))
    .filter((row) => row.length > 0);
}

/**
 * Position as % of the pitch: `along` runs goal-to-goal (home goal at 0),
 * `across` runs touchline-to-touchline.
 */
function placePlayers(lineup: Lineup, side: Side) {
  const rows = pitchRows(lineup);
  const outfieldRows = rows.length - 1;

  return rows.flatMap((row, r) => {
    // Depth within own half: GK near the goal, outfield rows spread towards halfway
    // (GK kept off the goal line so its name/rating badge isn't clipped by the pitch edge)
    const depth = r === 0 ? 0.13 : outfieldRows === 1 ? 0.6 : 0.34 + ((r - 1) * 0.56) / (outfieldRows - 1);
    return row.map((player, i) => {
      const across = 10 + (80 * (i + 0.5)) / row.length;
      return {
        player,
        along: side === 'home' ? depth * 50 : 100 - depth * 50,
        across: side === 'home' ? across : 100 - across,
      };
    });
  });
}

// ── Pitch markings ──

function Markings() {
  const line = { fill: 'none', stroke: 'rgba(255,255,255,0.45)', strokeWidth: 0.35 };
  // Drawn in a 105×68 landscape frame
  const shapes = (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={i * 10.5} y={0} width={10.5} height={68} fill={i % 2 ? 'rgba(255,255,255,0.035)' : 'transparent'} />
      ))}
      <rect x={0.5} y={0.5} width={104} height={67} {...line} />
      <line x1={52.5} y1={0.5} x2={52.5} y2={67.5} {...line} />
      <circle cx={52.5} cy={34} r={9.15} {...line} />
      <circle cx={52.5} cy={34} r={0.5} fill="rgba(255,255,255,0.45)" />
      <rect x={0.5} y={13.84} width={16.5} height={40.32} {...line} />
      <rect x={0.5} y={24.84} width={5.5} height={18.32} {...line} />
      <rect x={88} y={13.84} width={16.5} height={40.32} {...line} />
      <rect x={99} y={24.84} width={5.5} height={18.32} {...line} />
      <circle cx={11} cy={34} r={0.4} fill="rgba(255,255,255,0.45)" />
      <circle cx={94} cy={34} r={0.4} fill="rgba(255,255,255,0.45)" />
      <path d="M 17 26.7 A 9.15 9.15 0 0 1 17 41.3" {...line} />
      <path d="M 88 26.7 A 9.15 9.15 0 0 0 88 41.3" {...line} />
    </>
  );
  return (
    <>
      <svg className="absolute inset-0 hidden h-full w-full sm:block" viewBox="0 0 105 68" preserveAspectRatio="none" aria-hidden>
        {shapes}
      </svg>
      {/* Portrait on phones: rotate the landscape drawing so the home goal is at the top */}
      <svg className="absolute inset-0 h-full w-full sm:hidden" viewBox="0 0 68 105" preserveAspectRatio="none" aria-hidden>
        <g transform="translate(68,0) rotate(90)">{shapes}</g>
      </svg>
    </>
  );
}

// ── Player marker ──

function CardIcon({ color }: { color: string }) {
  return <span className="inline-block h-2.5 w-[7px] rounded-[1px]" style={{ backgroundColor: color }} />;
}

function PlayerMarker({
  player,
  color,
  photo,
  isPotm,
  selected,
  onSelect,
}: {
  player: LineupPlayer;
  color: string;
  photo?: string;
  isPotm: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const goals = player.stats?.goals ?? 0;
  const assists = player.stats?.assists ?? 0;
  const yellow = player.stats?.yellow_cards ?? 0;
  const red = player.stats?.red_cards ?? 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="group flex w-[72px] flex-col items-center gap-0.5 sm:w-[88px]"
    >
      <span className="relative">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold text-white shadow-md transition-transform group-hover:scale-110 sm:h-9 sm:w-9 sm:text-sm ${
            selected ? 'border-white ring-2 ring-white/70' : isPotm ? 'border-accent-gold' : 'border-white/80'
          }`}
          style={{ backgroundColor: color }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="h-full w-full rounded-full object-cover object-top" />
          ) : (
            player.number || ''
          )}
        </span>
        {player.rating != null && (
          <RatingBadge rating={player.rating} size="sm" className="absolute -right-5 -top-2 shadow" />
        )}
        {isPotm && (
          <span className="absolute -left-3 -top-2 text-sm text-accent-gold drop-shadow" aria-hidden>★</span>
        )}
        {player.substituted_out != null && (
          <span className="absolute -bottom-1 -left-5 flex items-center rounded bg-black/55 px-0.5 text-[9px] font-semibold text-white">
            <span className="text-red-400">↓</span>{player.substituted_out}&apos;
          </span>
        )}
        {(goals > 0 || assists > 0 || yellow > 0 || red > 0) && (
          <span className="absolute -bottom-1 -right-5 flex items-center gap-0.5 rounded bg-black/55 px-0.5 text-[9px] font-semibold text-white">
            {goals > 0 && <span>⚽{goals > 1 ? goals : ''}</span>}
            {assists > 0 && <span className="text-sky-300">A{assists > 1 ? assists : ''}</span>}
            {red > 0 ? <CardIcon color="#dc0c00" /> : yellow > 0 && <CardIcon color="#f5c400" />}
          </span>
        )}
      </span>
      <span className="mt-1 max-w-full truncate rounded px-1 text-[11px] font-medium leading-tight text-white drop-shadow sm:text-xs">
        {player.short_name}
      </span>
    </button>
  );
}

// ── Player detail panel ──

const DETAIL_GROUPS: { key: string; stats: string[] }[] = [
  { key: 'general', stats: ['touches', 'possession_lost', 'fouls', 'was_fouled', 'offsides', 'yellow_cards', 'red_cards'] },
  { key: 'attacking', stats: ['goals', 'assists', 'expected_goals', 'expected_assists', 'total_shots', 'shots_on_target', 'shots_off_target', 'blocked_shots', 'big_chances_created'] },
  { key: 'passing', stats: ['accurate_passes', 'key_passes', 'accurate_crosses', 'accurate_long_balls'] },
  { key: 'duels', stats: ['duel_won', 'duel_lost', 'aerial_won', 'won_contest', 'dispossessed', 'challenge_lost'] },
  { key: 'defending', stats: ['tackles', 'interceptions', 'clearances', 'ball_recoveries'] },
  { key: 'goalkeeping', stats: ['saves'] },
];

/** "accurate_x" stats are shown against their total, e.g. 9/15 (60%). */
const TOTAL_FOR: Record<string, string> = {
  accurate_passes: 'total_passes',
  accurate_crosses: 'total_crosses',
  accurate_long_balls: 'total_long_balls',
};

function formatPlayerStat(key: string, stats: Record<string, number>): string | null {
  const value = stats[key];
  if (value == null) return null;
  const totalKey = TOTAL_FOR[key];
  if (totalKey && stats[totalKey] != null) {
    const total = stats[totalKey];
    return total > 0 ? `${value}/${total} (${Math.round((value / total) * 100)}%)` : `${value}/${total}`;
  }
  return key.startsWith('expected_') ? value.toFixed(2) : String(value);
}

function PlayerDetail({
  player,
  teamName,
  color,
  photo,
  isPotm,
  onClose,
}: {
  player: LineupPlayer;
  teamName: string;
  color: string;
  photo?: string;
  isPotm: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('matches');
  const stats = player.stats;
  const groups = DETAIL_GROUPS
    .filter((g) => g.key !== 'goalkeeping' || player.position === 'goalkeeper')
    .map((g) => ({
      key: g.key,
      rows: g.stats.flatMap((key) => {
        const value = stats ? formatPlayerStat(key, stats) : null;
        return value == null ? [] : [{ key, value }];
      }),
    }))
    .filter((g) => g.rows.length > 0);

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface-secondary p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-base font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="h-full w-full object-cover object-top" />
          ) : (
            player.number || ''
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold text-fg">{player.name}</p>
          <p className="text-sm text-fg-muted">
            {teamName}
            {player.minutes != null && player.minutes > 0 && (
              <> · {t('minutes_played')}: {player.minutes}&apos;</>
            )}
          </p>
          {isPotm && (
            <p className="mt-1 text-xs font-semibold text-accent-gold">★ {t('player_of_the_match')}</p>
          )}
        </div>
        <RatingBadge rating={player.rating} size="lg" />
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close')}
          className="-me-1 -mt-1 rounded-lg p-1.5 text-fg-muted transition-colors hover:bg-surface hover:text-fg"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {groups.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {groups.map((g) => (
            <section key={g.key}>
              <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">{t(g.key)}</h5>
              <dl className="divide-y divide-border">
                {g.rows.map((row) => (
                  <div key={row.key} className="flex items-center justify-between gap-3 py-1.5 text-sm">
                    <dt className="text-fg-secondary">{t(`player_stat.${row.key}`)}</dt>
                    <dd className="font-semibold tabular-nums text-fg">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-fg-muted">
          {player.minutes === 0 ? t('unused_sub') : t('detailed_stats_unavailable')}
        </p>
      )}
    </div>
  );
}

// ── Bench ──

function BenchList({
  team,
  side,
  selectedId,
  onSelect,
}: {
  team: TeamInfo;
  side: Side;
  selectedId: string | null;
  onSelect: (id: string, side: Side) => void;
}) {
  const t = useTranslations('matches');
  const subs = team.lineup.players.filter((p) => !p.is_starter);
  if (subs.length === 0) return null;

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: team.color }} />
        {team.name}
      </p>
      <ul className="space-y-0.5">
        {subs.map((p) => {
          const unused = p.minutes === 0;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p.id, side)}
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-start transition-colors hover:bg-surface-secondary ${
                  selectedId === p.id ? 'bg-surface-secondary' : ''
                } ${unused ? 'opacity-55' : ''}`}
              >
                <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-fg-muted">
                  {p.number || '–'}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-fg">{p.name}</span>
                {p.substituted_in != null && (
                  <span className="shrink-0 text-xs font-medium text-accent-green">↑ {p.substituted_in}&apos;</span>
                )}
                {unused ? (
                  <span className="sr-only">{t('unused_sub')}</span>
                ) : (
                  p.minutes != null && <RatingBadge rating={p.rating} size="sm" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Main ──

export function MatchPitch({ home, away, playerOfTheMatchId, photos }: MatchPitchProps) {
  const t = useTranslations('matches');
  const [selected, setSelected] = useState<{ id: string; side: Side } | null>(null);

  const teams = { home, away };
  const placed = [
    ...placePlayers(home.lineup, 'home').map((p) => ({ ...p, side: 'home' as const })),
    ...placePlayers(away.lineup, 'away').map((p) => ({ ...p, side: 'away' as const })),
  ];
  const selectedPlayer = selected
    ? teams[selected.side].lineup.players.find((p) => p.id === selected.id)
    : undefined;

  const hasPlayerStats = [home, away].some((team) => team.lineup.players.some((p) => p.stats));

  const toggle = (id: string, side: Side) =>
    setSelected((cur) => (cur?.id === id ? null : { id, side }));

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-fg">{t('lineup')}</h3>
        {hasPlayerStats && <p className="text-xs text-fg-muted">{t('tap_player')}</p>}
      </div>

      {/* Team + formation bar */}
      <div className="mb-3 flex items-center justify-between gap-2 text-sm" dir="ltr">
        {(['home', 'away'] as const).map((side) => (
          <div key={side} className={`flex min-w-0 items-center gap-2 ${side === 'away' ? 'flex-row-reverse' : ''}`}>
            <TeamCrest
              team={teams[side].team}
              size={24}
              fallbackClassName="rounded-full text-white"
              className="drop-shadow-sm"
            />
            <span className="truncate font-semibold text-fg">{teams[side].name}</span>
            {teams[side].lineup.formation && (
              <span className="shrink-0 rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-bold text-fg-secondary">
                {teams[side].lineup.formation}
              </span>
            )}
            {teams[side].rating != null && (
              <RatingBadge rating={teams[side].rating ?? undefined} size="sm" className="shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Pitch: portrait on phones (home at top), landscape from sm (home on the left) */}
      <div
        dir="ltr"
        className="relative aspect-[68/105] w-full overflow-hidden rounded-xl bg-[#2f7d3b] sm:aspect-[105/68]"
      >
        <Markings />
        {placed.map(({ player, along, across, side }) => (
          <div
            key={player.id}
            className="absolute left-[var(--across)] top-[var(--along)] -translate-x-1/2 -translate-y-1/2 sm:left-[var(--along)] sm:top-[var(--across)]"
            style={{ '--along': `${along}%`, '--across': `${across}%` } as CSSProperties}
          >
            <PlayerMarker
              player={player}
              color={teams[side].color}
              photo={photos?.[player.id]}
              isPotm={player.id === playerOfTheMatchId}
              selected={selected?.id === player.id}
              onSelect={() => toggle(player.id, side)}
            />
          </div>
        ))}
      </div>

      {selected && selectedPlayer && (
        <PlayerDetail
          player={selectedPlayer}
          teamName={teams[selected.side].name}
          color={teams[selected.side].color}
          photo={photos?.[selectedPlayer.id]}
          isPotm={selectedPlayer.id === playerOfTheMatchId}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Benches */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">{t('substitutes')}</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <BenchList team={home} side="home" selectedId={selected?.id ?? null} onSelect={toggle} />
          <BenchList team={away} side="away" selectedId={selected?.id ?? null} onSelect={toggle} />
        </div>
      </div>

      {(home.coach || away.coach) && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-muted">{t('coaches')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[home, away].map((team) =>
              team.coach ? (
                <div key={team.name} className="flex items-center gap-3 rounded-lg bg-surface-secondary px-3 py-2.5">
                  <TeamCrest team={team.team} size={24} fallbackClassName="rounded-full bg-surface text-fg-muted" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-fg">{team.coach}</span>
                    <span className="block text-xs text-fg-muted">{t('coach')}</span>
                  </span>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
