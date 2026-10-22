'use client';

import { useEffect, useState } from 'react';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

/**
 * "10 hours ago" / "hier" / "منذ 3 ساعات" for the past week, otherwise the server-formatted date.
 * Pages are statically generated, so the relative form is computed in the browser after mount;
 * the server renders `fallback` (an absolute date) and both match during hydration.
 */
export function RelativeTime({ iso, locale, fallback, className }: { iso: string; locale: string; fallback: string; className?: string }) {
  const [label, setLabel] = useState(fallback);

  useEffect(() => {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff > 0 || -diff > 7 * 86_400_000) return;
    const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar-MA' : locale, { numeric: 'auto' });
    const [unit, ms] = UNITS.find(([, ms]) => -diff >= ms) ?? ['minute', 60_000];
    setLabel(rtf.format(Math.round(diff / ms), unit));
  }, [iso, locale]);

  return (
    <time dateTime={iso} className={className}>
      {label}
    </time>
  );
}
