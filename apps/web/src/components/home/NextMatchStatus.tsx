'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Match } from '@/types';
import { clubShortName } from '@/lib/clubs';
import { NextMatchCountdown } from './NextMatchCountdown';

/** A game counts as under way from kick-off until it is marked finished (at most 3 h later) */
const inProgress = (match: Match, now: number) =>
  match.status === 'live' || (match.status !== 'finished' && now >= new Date(match.kickoff).getTime() && now < new Date(match.kickoff).getTime() + 3 * 3_600_000);

/**
 * Next match header: a countdown until kick-off, then the live status (teams, score, minute when the
 * data source has them) — it switches by itself at kick-off.
 */
export function NextMatchStatus({ match, tone = 'dark', label }: { match: Match; tone?: 'dark' | 'light'; label?: string }) {
  const t = useTranslations('matches');
  // Server and first client render agree on the source status; the clock is read after mounting
  const [live, setLive] = useState(match.status === 'live');
  useEffect(() => {
    const tick = () => setLive(inProgress(match, Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [match]);

  if (!live) {
    return (
      <div className="flex items-center gap-4">
        {label && <span className={`font-condensed text-sm font-extrabold uppercase italic rtl:not-italic ${tone === 'light' ? 'text-white/80' : 'text-fg-secondary'}`}>{label}</span>}
        <NextMatchCountdown kickoff={match.kickoff} tone={tone} />
      </div>
    );
  }

  const light = tone === 'light';
  const score = match.score_home != null && match.score_away != null;
  return (
    <div className={`flex items-center gap-3 ${light ? 'text-white' : 'text-fg'}`} role="status">
      <span className="inline-flex items-center gap-1.5 rounded bg-white px-2 py-1 font-condensed text-sm font-extrabold uppercase text-wydad-logo">
        <span className="h-2 w-2 animate-pulse rounded-full bg-wydad-logo" aria-hidden />
        {t('live')}
        {match.minute != null && <span className="tabular-nums">{match.minute}&apos;</span>}
      </span>
      <span className="font-condensed text-2xl font-extrabold uppercase leading-none sm:text-3xl" dir="ltr">
        {clubShortName(match.home_team)}{' '}
        <span className="tabular-nums">{score ? `${match.score_home} - ${match.score_away}` : '-'}</span>{' '}
        {clubShortName(match.away_team)}
      </span>
    </div>
  );
}
