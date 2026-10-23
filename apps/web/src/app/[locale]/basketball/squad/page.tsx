import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BASKETBALL_POSITIONS, BASKETBALL_SQUAD } from '@/lib/basketball';
import { PendingNotice, SectionPage } from '@/components/basketball/SectionPage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'basketball' });
  return { title: `${t('squad')} · ${t('title')}` };
}

export default async function BasketballSquadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'basketball' });
  const players = [...BASKETBALL_SQUAD].sort(
    (a, b) => BASKETBALL_POSITIONS.indexOf(a.position) - BASKETBALL_POSITIONS.indexOf(b.position) || (a.number ?? 999) - (b.number ?? 999),
  );

  return (
    <SectionPage active="squad" title={t('squad')} season={t('season')}>
      {players.length === 0 ? (
        <PendingNotice text={t('squad_pending')} />
      ) : (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {players.map((p) => (
            <li key={p.id}>
              <div className="relative aspect-[5/6] overflow-hidden">
                <div className="absolute inset-x-[6%] bottom-0 h-[78%] -skew-x-[8deg] bg-surface-secondary rtl:skew-x-[8deg]" aria-hidden />
                {p.photo ? (
                  <Image src={p.photo} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-contain object-bottom" />
                ) : (
                  <div className="absolute inset-x-0 bottom-[22%] flex justify-center" aria-hidden>
                    <Image src="/images/wydad-crest.svg" alt="" width={96} height={122} className="h-auto w-[38%] opacity-25 grayscale" />
                  </div>
                )}
                {p.number != null && (
                  <span className="absolute start-[12%] top-[26%] font-condensed text-6xl font-extrabold leading-none text-wydad-red/90" aria-hidden>
                    {p.number}
                  </span>
                )}
              </div>
              <p className="mt-3 font-condensed text-xs font-bold uppercase tracking-[0.12em] text-wydad-red">{t(`pos_${p.position}`)}</p>
              <p className="font-condensed text-2xl font-extrabold uppercase leading-tight text-fg">{p.name}</p>
            </li>
          ))}
        </ul>
      )}
    </SectionPage>
  );
}
