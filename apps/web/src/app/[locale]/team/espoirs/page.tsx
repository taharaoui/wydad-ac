import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getEspoirSquad } from '@/services/players';
import { getPlayerPhotos } from '@/lib/player-photos';
import { FootballNav } from '@/components/team/FootballNav';
import { SquadGrid } from '@/components/team/SquadGrid';
import { PendingNotice } from '@/components/basketball/SectionPage';

const POSITION_ORDER = ['goalkeeper', 'defender', 'midfielder', 'forward'] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'football' });
  return { title: `${t('squad')} · ${t('espoirs')}` };
}

/** Wydad AC Espoir (U23) squad, from TheStatsAPI */
export default async function EspoirsSquadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'football' });

  const squad = await getEspoirSquad();
  const photos = getPlayerPhotos(squad.map((p) => p.id));
  const players = [...squad]
    .sort((a, b) => POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position) || (a.number ?? 999) - (b.number ?? 999))
    .map((p) => ({ id: p.id, name: p.name, number: p.number, position: p.position, photo: photos[p.id] ?? p.photo_url }));

  return (
    <div>
      <FootballNav sport="espoirs" active="squad" />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <h1 className="font-condensed text-6xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-7xl">{t('squad')}</h1>
        <p className="mt-3 font-condensed text-2xl font-bold text-fg">
          {t('espoirs')} · {t('season')}
        </p>
        <div className="mt-12">{players.length ? <SquadGrid players={players} /> : <PendingNotice text={t('espoirs_squad_pending')} />}</div>
      </div>
    </div>
  );
}
