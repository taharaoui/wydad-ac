import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getSquad } from '@/services/players';
import { getPlayerPhotos } from '@/lib/player-photos';
import { getCmsPlayerPhotos } from '@/lib/cms/club';
import { FootballNav } from '@/components/team/FootballNav';
import { SquadGrid } from '@/components/team/SquadGrid';

const POSITION_ORDER = ['goalkeeper', 'defender', 'midfielder', 'forward'] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'football' });
  return { title: t('squad') };
}

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'football' });

  const squad = await getSquad();
  const ids = squad.map((p) => p.id);
  // Photos set in the CMS win over the files in public/assets/players
  const photos = { ...getPlayerPhotos(ids), ...(await getCmsPlayerPhotos(ids)) };
  // By line, then shirt number
  const players = [...squad]
    .sort((a, b) => POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position) || (a.number ?? 999) - (b.number ?? 999))
    .map((p) => ({ id: p.id, name: p.name, number: p.number, position: p.position, photo: photos[p.id] }));

  return (
    <div>
      <FootballNav active="squad" />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <h1 className="font-condensed text-6xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-7xl">{t('squad')}</h1>
        <p className="mt-3 font-condensed text-2xl font-bold text-fg">{t('season')}</p>
        <div className="mt-12">
          <SquadGrid players={players} />
        </div>
      </div>
    </div>
  );
}
