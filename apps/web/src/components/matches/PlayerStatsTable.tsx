'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Lineup } from '@/types';
import { RatingBadge } from './RatingBadge';
import { TeamCrest } from '@/components/ui/TeamCrest';

interface PlayerStatsTableProps {
  home: { name: string; lineup: Lineup; color: string; team: { id: string; name: string; short_name: string; logo_url?: string } };
  away: { name: string; lineup: Lineup; color: string; team: { id: string; name: string; short_name: string; logo_url?: string } };
}

const COLUMNS = ['goals', 'assists', 'total_shots', 'key_passes', 'accurate_passes', 'duel_won', 'tackles', 'interceptions'];

export function PlayerStatsTable({ home, away }: PlayerStatsTableProps) {
  const t = useTranslations('matches');
  const [side, setSide] = useState<'home' | 'away'>('home');
  const team = side === 'home' ? home : away;

  const players = team.lineup.players
    .filter((p) => (p.minutes ?? 0) > 0)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-fg">{t('player_stats')}</h3>
        <div className="flex rounded-lg bg-surface-secondary p-1" role="tablist">
          {(['home', 'away'] as const).map((s) => {
            const info = s === 'home' ? home : away;
            return (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={side === s}
                onClick={() => setSide(s)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  side === s ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
                }`}
              >
                <TeamCrest team={info.team} size={18} fallbackClassName="rounded-full bg-surface-secondary text-fg-muted" />
                <span className="max-w-[9rem] truncate">{info.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-fg-muted">
              <th className="py-2 pe-3 text-start font-medium">{t('player')}</th>
              <th className="px-2 py-2 text-center font-medium">{t('rating')}</th>
              <th className="px-2 py-2 text-center font-medium">{t('minutes_short')}</th>
              {COLUMNS.map((c) => (
                <th key={c} className="px-2 py-2 text-center font-medium">{t(`player_stat.${c}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {players.map((p) => {
              const s = p.stats ?? {};
              return (
                <tr key={p.id} className="hover:bg-surface-secondary">
                  <td className="py-2 pe-3">
                    <span className="flex items-center gap-2">
                      <span className="w-5 shrink-0 text-center text-xs font-bold tabular-nums text-fg-muted">{p.number || ''}</span>
                      <span className="truncate font-medium text-fg">{p.name}</span>
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center"><RatingBadge rating={p.rating} size="sm" /></td>
                  <td className="px-2 py-2 text-center tabular-nums text-fg-secondary">{p.minutes}&apos;</td>
                  {COLUMNS.map((c) => (
                    <td key={c} className="px-2 py-2 text-center tabular-nums text-fg">
                      {c === 'accurate_passes' && s.total_passes != null
                        ? `${s.accurate_passes ?? 0}/${s.total_passes}`
                        : s[c] ?? '–'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
