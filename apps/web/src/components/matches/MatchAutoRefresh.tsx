'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Minutes after kick-off when the score is worth fetching again: start, half-time, full time, then late finishes */
const MOMENTS = [2, 50, 110, 125, 140];

/**
 * Refreshes the page's data at the key moments of a game (kick-off, half-time, full time) while it is
 * open, instead of polling. Each moment refreshes twice, 20 s apart: the first request lets the cached
 * page regenerate in the background, the second brings the new score.
 */
export function MatchAutoRefresh({ kickoff, finished }: { kickoff: string; finished: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (finished) return;
    const start = new Date(kickoff).getTime();
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const minutes of MOMENTS) {
      const delay = start + minutes * 60_000 - Date.now();
      if (delay < 0 || delay > 6 * 3_600_000) continue;
      timers.push(setTimeout(() => router.refresh(), delay));
      timers.push(setTimeout(() => router.refresh(), delay + 20_000));
    }
    return () => timers.forEach(clearTimeout);
  }, [kickoff, finished, router]);
  return null;
}
