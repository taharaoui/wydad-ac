/**
 * Kick-off times. Pages render them in Moroccan time on the server (stable HTML for every visitor),
 * then <LocalKickoff> reformats them in the browser in the visitor's own time zone.
 */
export const CLUB_TIME_ZONE = 'Africa/Casablanca';

const dateLocaleOf = (locale: string) => (locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB');

/** Kick-off as { day: "Sat 24 Oct", time: "18:00" } in the given time zone (Moroccan by default) */
export function formatKickoff(iso: string, locale: string, timeZone: string = CLUB_TIME_ZONE) {
  const dateLocale = dateLocaleOf(locale);
  const date = new Date(iso);
  const part = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(dateLocale, { timeZone, ...opts }).format(date);
  const clock = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const hh = clock.find((p) => p.type === 'hour')?.value ?? '00';
  const mm = clock.find((p) => p.type === 'minute')?.value ?? '00';
  return {
    day: `${part({ weekday: 'short' })} ${part({ day: 'numeric' })} ${part({ month: 'short' })}`,
    time: `${hh}:${mm}`,
  };
}

/** Long form, e.g. "Saturday 24 October, 18:00" */
export function formatKickoffLong(iso: string, locale: string, timeZone: string = CLUB_TIME_ZONE): string {
  const dateLocale = dateLocaleOf(locale);
  const date = new Date(iso);
  const part = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(dateLocale, { timeZone, ...opts }).format(date);
  const weekday = part({ weekday: 'long' });
  const capitalised = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalised} ${part({ day: 'numeric' })} ${part({ month: 'long' })}, ${formatKickoff(iso, locale, timeZone).time}`;
}

/** Short date, e.g. "24 oct." */
export function formatShortDate(iso: string, locale: string, timeZone: string = CLUB_TIME_ZONE): string {
  return new Date(iso).toLocaleDateString(dateLocaleOf(locale), { day: 'numeric', month: 'short', timeZone });
}

/** UTC offset of a time zone at a given instant, e.g. "GMT+1" */
export function zoneOffset(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone, timeZoneName: 'shortOffset' }).formatToParts(new Date(iso)).find((p) => p.type === 'timeZoneName')?.value ?? '';
}
