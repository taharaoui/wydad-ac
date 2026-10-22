/**
 * Kick-off in Moroccan time, e.g. { day: "Sat 24 Oct", time: "18:00" }.
 * Call it on the server and pass the strings to client components: Node and browsers ship
 * different time-zone data and date punctuation, so formatting in both breaks hydration.
 */
export function formatKickoff(iso: string, locale: string) {
  const dateLocale = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB';
  const date = new Date(iso);
  const part = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(dateLocale, { timeZone: 'Africa/Casablanca', ...opts }).format(date);
  const clock = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Casablanca', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const hh = clock.find((p) => p.type === 'hour')?.value ?? '00';
  const mm = clock.find((p) => p.type === 'minute')?.value ?? '00';
  return {
    day: `${part({ weekday: 'short' })} ${part({ day: 'numeric' })} ${part({ month: 'short' })}`,
    time: `${hh}:${mm}`,
  };
}

/** Long form for match cards, e.g. "Saturday 24 October, 18:00" (Moroccan time, server-side only). */
export function formatKickoffLong(iso: string, locale: string): string {
  const dateLocale = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB';
  const date = new Date(iso);
  const part = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(dateLocale, { timeZone: 'Africa/Casablanca', ...opts }).format(date);
  const weekday = part({ weekday: 'long' });
  const capitalised = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalised} ${part({ day: 'numeric' })} ${part({ month: 'long' })}, ${formatKickoff(iso, locale).time}`;
}
