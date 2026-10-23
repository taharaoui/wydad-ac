import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isWydad } from '@/lib/clubs';
import { BASKETBALL_STANDINGS, DISLOG_LEAGUE } from '@/lib/basketball';
import { TeamCrest } from '@/components/ui/TeamCrest';
import { PendingNotice, SectionPage } from '@/components/basketball/SectionPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'basketball' });
  return { title: `${t('standings')} · ${t('title')}` };
}

export default async function BasketballStandingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'basketball' });
  const rows = [...BASKETBALL_STANDINGS].sort((a, b) => a.position - b.position);
  const num = 'px-2 py-3 text-center tabular-nums';

  return (
    <SectionPage active="standings" title={t('standings')} season={`${DISLOG_LEAGUE.name} · ${t('season')}`}>
      {rows.length === 0 ? (
        <PendingNotice text={t('standings_pending')} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-secondary/60 text-xs font-semibold uppercase tracking-wide text-fg-muted">
                <th className="w-12 px-3 py-3 text-center">#</th>
                <th className="px-3 py-3 text-start">{t('team')}</th>
                <th className={num}>{t('played_short')}</th>
                <th className={num}>{t('won_short')}</th>
                <th className={num}>{t('lost_short')}</th>
                <th className={num}>+/-</th>
                <th className={num}>{t('points_short')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.team.id} className={`border-b border-border last:border-0 ${isWydad(r.team.id) ? 'bg-wydad-red/[0.06] font-semibold' : ''}`}>
                  <td className="px-3 py-3 text-center tabular-nums">{r.position}</td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-2.5">
                      <TeamCrest team={r.team} size={24} fallbackClassName="rounded-full bg-surface-secondary text-fg" />
                      {r.team.name}
                    </span>
                  </td>
                  <td className={num}>{r.played}</td>
                  <td className={num}>{r.won}</td>
                  <td className={num}>{r.lost}</td>
                  <td className={num} dir="ltr">{r.points_for - r.points_against}</td>
                  <td className={`${num} font-bold`}>{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionPage>
  );
}
