import { getMatches } from '@/services/matches';

/** iCalendar feed of this season's Botola matches, for "Sync calendar". */

const toICSDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const escape = (s: string) => s.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

export async function GET() {
  const matches = await getMatches();
  const stamp = toICSDate(new Date());

  const events = matches.map((m) => {
    const start = new Date(m.kickoff);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const score = m.status === 'finished' ? ` (${m.score_home}-${m.score_away})` : '';
    const detail = [m.competition.name, m.matchday ? `Matchday ${m.matchday}` : null].filter(Boolean).join(', ');
    return [
      'BEGIN:VEVENT',
      `UID:${m.id}@wydad-ac`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${escape(`${m.home_team.name} vs ${m.away_team.name}${score}`)}`,
      `DESCRIPTION:${escape(detail)}`,
      ...(m.venue ? [`LOCATION:${escape(m.venue)}`] : []),
      'END:VEVENT',
    ].join('\r\n');
  });

  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wydad AC//Fixtures//EN',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Wydad AC',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="wydad-ac.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
