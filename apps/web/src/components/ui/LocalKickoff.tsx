'use client';

import { useEffect, useState } from 'react';
import { CLUB_TIME_ZONE, formatKickoff, formatKickoffLong, formatShortDate, zoneOffset } from '@/lib/datetime';

type Kind = 'time' | 'day' | 'long' | 'date';

function format(iso: string, locale: string, kind: Kind, timeZone: string) {
  switch (kind) {
    case 'time':
      return formatKickoff(iso, locale, timeZone).time;
    case 'day':
      return formatKickoff(iso, locale, timeZone).day;
    case 'date':
      return formatShortDate(iso, locale, timeZone);
    case 'long': {
      const text = formatKickoffLong(iso, locale, timeZone);
      // Visitors outside Morocco's offset see which zone the time is in
      const offset = zoneOffset(iso, timeZone);
      return offset !== zoneOffset(iso, CLUB_TIME_ZONE) ? `${text} (${offset})` : text;
    }
  }
}

/**
 * A kick-off date or time in the visitor's time zone. The server renders it in Moroccan time
 * (same HTML for everyone, no hydration mismatch); the browser then switches to its own zone.
 */
export function LocalKickoff({ iso, locale, kind }: { iso: string; locale: string; kind: Kind }) {
  const [text, setText] = useState(() => format(iso, locale, kind, CLUB_TIME_ZONE));
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Visitors in Morocco keep the server's text: Morocco changed its rules (back to UTC+0 from
    // 20 Sep 2026) and browsers with older time-zone data would show the wrong hour
    if (zone && zone !== CLUB_TIME_ZONE) setText(format(iso, locale, kind, zone));
  }, [iso, locale, kind]);
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  );
}
