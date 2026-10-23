import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { bannerTrophies } from '@/lib/club-info';

/** Row of the club's trophy pennants (count + competition icon), each captioned with its competition. */
export function HonoursBanners({ lang, tone = 'light' }: { lang: 'ar' | 'fr' | 'en'; tone?: 'light' | 'dark' }) {
  const t = useTranslations('club');
  return (
    <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-6 sm:gap-x-6">
      {bannerTrophies().map((trophy) => (
        <li key={trophy.banner} className="flex flex-col items-center text-center">
          <Image
            src={trophy.banner!}
            alt={`${trophy.name[lang]} : ${t('titles', { count: trophy.years.length })}`}
            width={264}
            height={470}
            sizes="(min-width: 640px) 180px, 30vw"
            className="h-auto w-full max-w-[150px] drop-shadow-[0_10px_18px_rgb(0_0_0/0.18)] transition-transform duration-300 hover:-translate-y-1"
          />
          <p className={`mt-3 text-sm font-semibold leading-snug ${tone === 'dark' ? 'text-white/85' : 'text-fg'}`}>{trophy.name[lang]}</p>
        </li>
      ))}
    </ul>
  );
}
