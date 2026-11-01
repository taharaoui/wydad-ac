import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Match } from '@/types';
import { isWydad, clubShortName } from '@/lib/clubs';
import { SEASON_SCHEDULE } from '@/lib/season-schedule';
import { TeamCrest } from '@/components/ui/TeamCrest';
import { LocalKickoff } from '@/components/ui/LocalKickoff';

/** Grid of the season's matchdays, after the club's fixtures poster: matchday, crest, home/away, result or date. */
export function SeasonSchedule({ matches }: { matches: Match[] }) {
  const locale = useLocale();
  const t = useTranslations('matches');

  return (
    <section aria-labelledby="season-schedule">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="season-schedule" className="font-condensed text-3xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">
          {t('season_schedule')}
        </h2>
        <p className="font-condensed text-sm font-bold uppercase tracking-[0.14em] text-fg-muted">Botola Pro Inwi 2026-27 · {t('first_half')}</p>
      </div>

      <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SEASON_SCHEDULE.map((entry) => {
          // The data source's match for this matchday, if it has one
          const match = matches.find((m) => m.matchday === entry.matchday && (isWydad(m.home_team.id) || isWydad(m.away_team.id)));
          const played = match && (match.status === 'finished' || match.status === 'live');
          const wydadScore = match && (isWydad(match.home_team.id) ? match.score_home : match.score_away);
          const oppScore = match && (isWydad(match.home_team.id) ? match.score_away : match.score_home);
          const outcome = played && wydadScore != null && oppScore != null ? (wydadScore > oppScore ? 'W' : wydadScore < oppScore ? 'L' : 'D') : null;
          const outcomeCls = outcome === 'W' ? 'bg-accent-green text-white' : outcome === 'L' ? 'bg-wydad-logo text-white' : 'bg-fg-muted/30 text-fg';

          const body = (
            <>
              <div className="flex items-center justify-between">
                <span className="font-condensed text-sm font-extrabold text-fg">{t('matchday_short', { n: entry.matchday })}</span>
                <span className={`font-condensed text-xs font-bold uppercase tracking-wide ${entry.home ? 'text-wydad-red' : 'text-fg-muted'}`}>
                  {entry.home ? t('home') : t('away')}
                </span>
              </div>
              <div className="my-4 flex justify-center">
                <TeamCrest team={entry.opponent} size={56} fallbackClassName="rounded-full bg-surface-secondary text-fg" />
              </div>
              <p className="truncate text-center font-condensed text-lg font-bold uppercase text-fg">{clubShortName(entry.opponent)}</p>
              <p className="mt-1 flex min-h-6 items-center justify-center gap-1.5 text-center text-xs text-fg-muted">
                {played ? (
                  <>
                    <span className={`rounded px-1.5 font-bold ${outcomeCls}`}>{outcome}</span>
                    <span className="font-condensed text-base font-bold tabular-nums text-fg" dir="ltr">
                      {wydadScore}-{oppScore}
                    </span>
                  </>
                ) : match ? (
                  <LocalKickoff iso={match.kickoff} locale={locale} kind="long" />
                ) : (
                  t('date_tbc')
                )}
              </p>
            </>
          );
          const cls = 'block h-full rounded-xl border border-border bg-surface p-4 transition-colors';
          return (
            <li key={entry.matchday}>
              {match ? (
                <Link href={`/matches/${match.id}`} className={`${cls} hover:border-wydad-red/40`}>
                  {body}
                </Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
