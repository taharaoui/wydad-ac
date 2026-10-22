'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

function remaining(kickoff: string) {
  const diff = Math.max(0, new Date(kickoff).getTime() - Date.now());
  return [
    Math.floor(diff / 86_400_000),
    Math.floor((diff / 3_600_000) % 24),
    Math.floor((diff / 60_000) % 60),
    Math.floor((diff / 1000) % 60),
  ];
}

/** DD : HH : MM : SS. Renders dashes until mounted so server and client HTML match. */
export function NextMatchCountdown({ kickoff }: { kickoff: string }) {
  const t = useTranslations('matches');
  const [parts, setParts] = useState<number[] | null>(null);

  useEffect(() => {
    setParts(remaining(kickoff));
    const id = setInterval(() => setParts(remaining(kickoff)), 1000);
    return () => clearInterval(id);
  }, [kickoff]);

  const labels = [t('cd_days'), t('cd_hours'), t('cd_mins'), t('cd_secs')];

  return (
    <div className="flex items-start gap-1.5 sm:gap-2" dir="ltr" role="timer" aria-live="off">
      {labels.map((label, i) => (
        <div key={label} className="flex items-start gap-1.5 sm:gap-2">
          {i > 0 && <span className="font-condensed text-3xl font-bold leading-none text-fg sm:text-4xl">:</span>}
          <div className="flex flex-col items-center">
            <span className="min-w-[2ch] text-center font-condensed text-3xl font-extrabold leading-none tabular-nums text-fg sm:text-[42px]">
              {parts ? String(parts[i]).padStart(2, '0') : '--'}
            </span>
            <span className="mt-1 font-condensed text-[11px] font-bold uppercase tracking-wide text-fg-secondary">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
