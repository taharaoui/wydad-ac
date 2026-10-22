import { useTranslations } from 'next-intl';
import type { Trophy } from '@/lib/club-info';

/** Trophy rows: count, competition, the seasons it was won. */
export function HonoursList({ title, trophies, lang }: { title: string; trophies: Trophy[]; lang: 'ar' | 'fr' | 'en' }) {
  const t = useTranslations('club');
  return (
    <div>
      <h3 className="font-condensed text-xl font-bold uppercase tracking-wide text-fg-secondary">{title}</h3>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {trophies.map((trophy) => (
          <li key={trophy.name.fr} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 py-5">
            <span className="font-condensed text-5xl font-extrabold leading-none text-wydad-red">{trophy.years.length}</span>
            <div className="min-w-0">
              <p className="font-semibold text-fg">{trophy.name[lang]}</p>
              <p className="sr-only">{t('titles', { count: trophy.years.length })}</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {trophy.years.map((year) => (
                  <li key={year} dir="ltr" className="rounded bg-surface-secondary px-1.5 py-0.5 text-xs tabular-nums text-fg-secondary">
                    {year}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
