import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getEspoirSquad, getPlayerById, getSquad } from '@/services/players';
import { Link } from '@/i18n/navigation';

export async function generateStaticParams() {
  const squad = [...(await getSquad()), ...(await getEspoirSquad())];
  const locales = ['ar', 'fr', 'en'];
  return locales.flatMap(locale =>
    squad.map(player => ({
      locale,
      id: player.id,
    }))
  );
}

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'team' });

  const player = await getPlayerById(id);
  if (!player) notFound();

  const dateLocale = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB';

  const positionColors: Record<string, string> = {
    goalkeeper: 'bg-accent-gold-bg text-accent-gold',
    defender: 'bg-accent-blue-bg text-accent-blue',
    midfielder: 'bg-accent-green-bg text-accent-green',
    forward: 'bg-wydad-red-soft text-wydad-red',
  };

  const statItems = player.stats ? [
    { key: 'appearances', value: player.stats.appearances },
    { key: 'goals', value: player.stats.goals },
    { key: 'assists', value: player.stats.assists },
    ...(player.stats.clean_sheets !== undefined ? [{ key: 'clean_sheets' as const, value: player.stats.clean_sheets }] : []),
    { key: 'yellow_cards', value: player.stats.yellow_cards },
    { key: 'red_cards', value: player.stats.red_cards },
    { key: 'minutes_played', value: player.stats.minutes_played },
  ] : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/team"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <svg className="h-4 w-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {t('back_to_squad')}
      </Link>

      {/* Player header */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-surface-dark to-surface-dark-secondary">
        <div className="grid sm:grid-cols-3">
          {/* Photo placeholder */}
          <div className="flex aspect-square items-center justify-center bg-white/5 sm:aspect-auto sm:min-h-[320px]">
            <span className="font-display text-8xl font-bold text-white/10">
              {player.number}
            </span>
          </div>

          {/* Info */}
          <div className="p-6 sm:col-span-2 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-2xl font-bold text-wydad-logo">
                {player.number}
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-display-md font-bold text-white sm:text-display-lg">
                  {player.name}
                </h1>
                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${positionColors[player.position] || ''}`}>
                  {t(player.position)}
                </span>
              </div>
            </div>

            {/* Bio details */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-white/50">{t('nationality')}</p>
                <p className="mt-0.5 text-sm font-semibold text-white">{player.nationality}</p>
              </div>
              {player.date_of_birth && (
                <div>
                  <p className="text-xs text-white/50">{t('date_of_birth')}</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {new Date(player.date_of_birth).toLocaleDateString(dateLocale, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'UTC', // date-only value: don't shift it by the server's zone
                    })}
                  </p>
                </div>
              )}
              {player.height_cm && (
                <div>
                  <p className="text-xs text-white/50">{t('height')}</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{player.height_cm} cm</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      {statItems.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-4 font-display text-lg font-bold text-fg">
            {t('stats')}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statItems.map(({ key, value }) => (
              <div
                key={key}
                className="rounded-xl border border-border bg-surface p-4 text-center"
              >
                <p className="font-display text-2xl font-bold text-fg">
                  {value.toLocaleString(dateLocale)}
                </p>
                <p className="mt-1 text-xs text-fg-muted">{t(key)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
