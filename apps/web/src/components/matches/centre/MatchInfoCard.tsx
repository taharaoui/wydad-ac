import { useTranslations } from 'next-intl';
import type { Match } from '@/types';
import { isWydad } from '@/lib/clubs';
import type { Official } from '@/lib/match-notes';

export function MatchInfoCard({ match, dateLabel, officials = [], locale }: { match: Match; dateLabel: string; officials?: Official[]; locale: string }) {
  const t = useTranslations('matches');
  const competition = /botola/i.test(match.competition.name) ? 'Botola Pro' : match.competition.name;
  const venue = match.venue ?? (isWydad(match.home_team.id) ? t('home_game') : t('away_game'));

  const rows: [string, React.ReactNode][] = [
    [t('competition'), `${competition}${match.matchday ? ` · ${t('matchday')} ${match.matchday}` : ''}`],
    [t('kickoff'), dateLabel],
    [t('venue'), venue],
  ];
  for (const o of officials) {
    rows.push([o.role === 'referee' ? t('referee') : t('var_official'), locale === 'ar' ? o.name_ar : o.name]);
  }
  if (match.home_coach || match.away_coach) {
    rows.push([
      t('coaches'),
      <span key="c" className="grid gap-0.5">
        {match.home_coach && <span>{match.home_coach}</span>}
        {match.away_coach && <span>{match.away_coach}</span>}
      </span>,
    ]);
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-3 font-display text-base font-bold text-fg">{t('match_info')}</h3>
      <dl className="divide-y divide-border text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-2.5">
            <dt className="shrink-0 text-fg-muted">{label}</dt>
            <dd className="text-end font-medium text-fg">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
