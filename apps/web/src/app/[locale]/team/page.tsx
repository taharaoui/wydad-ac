import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getSquad } from '@/services/players';
import { PlayerCard } from '@/components/team/PlayerCard';
import type { Player } from '@/types';

const POSITION_ORDER = ['goalkeeper', 'defender', 'midfielder', 'forward'] as const;

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'team' });

  const squad = await getSquad();

  const grouped = POSITION_ORDER.reduce<Record<string, Player[]>>((acc, pos) => {
    acc[pos] = squad.filter(p => p.position === pos);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-display-lg font-bold text-fg">
        {t('squad')}
      </h1>

      <div className="mt-8 space-y-10">
        {POSITION_ORDER.map(position => {
          const players = grouped[position];
          if (!players || players.length === 0) return null;

          return (
            <section key={position}>
              <h2 className="mb-4 font-display text-lg font-bold text-fg">
                {t(position)}
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {players.map(player => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
