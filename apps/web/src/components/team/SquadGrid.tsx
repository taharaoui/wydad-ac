'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Position } from '@/types';

export interface SquadPlayer {
  id: string;
  name: string;
  number: number | null;
  position: Position;
  photo?: string;
}

const POSITIONS: Position[] = ['goalkeeper', 'defender', 'midfielder', 'forward'];
type Filter = 'all' | Position;

/** Name particles that belong to the family name: "Abderrazak El Wadi" → "El Wadi" */
const PARTICLES = new Set(['el', 'al', 'ben', 'bel', 'ait', 'aït', 'ould', 'abou', 'bou', 'ibn', 'van', 'de', 'da', 'dos', 'du']);

/** First name(s) and family name: "El Mehdi Benabid" → ["El Mehdi", "Benabid"], "Ayman El Wafi" → ["Ayman", "El Wafi"] */
function splitName(name: string): [string, string] {
  const words = name.trim().split(/\s+/);
  let start = words.length - 1;
  while (start > 1 && PARTICLES.has(words[start - 1].toLowerCase())) start--;
  return [words.slice(0, start).join(' '), words.slice(start).join(' ')];
}

/** Position filter + player cards on a slanted backdrop, after psg.fr/mens-football/squad. */
export function SquadGrid({ players }: { players: SquadPlayer[] }) {
  const t = useTranslations('football');
  const tTeam = useTranslations('team');
  const tHeader = useTranslations('header');
  const [filter, setFilter] = useState<Filter>('all');

  // Deep links from the menus: /team#goalkeeper etc.
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1) as Position;
      if (POSITIONS.includes(hash)) setFilter(hash);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const shown = filter === 'all' ? players : players.filter((p) => p.position === filter);
  const filters: { key: Filter; label: string }[] = [{ key: 'all', label: t('all') }, ...POSITIONS.map((p) => ({ key: p, label: tTeam(p) }))];

  return (
    <div>
      <div role="group" aria-label={t('filter_label')} className="no-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 sm:gap-8">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => {
              setFilter(f.key);
              history.replaceState(null, '', f.key === 'all' ? window.location.pathname : `#${f.key}`);
            }}
            className={`relative whitespace-nowrap py-2 font-condensed text-lg font-bold uppercase tracking-wide transition-colors ${
              filter === f.key ? 'text-fg' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {f.label}
            {filter === f.key && <span className="absolute inset-x-0 -bottom-0.5 h-[3px] bg-fg" aria-hidden />}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {/* `n` as a plain string: Node and browsers format Arabic digits differently */}
        {t('count', { count: shown.length, n: String(shown.length) })}
      </p>

      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {shown.map((p) => {
          const [first, last] = splitName(p.name);
          return (
            <li key={p.id}>
              <Link href={`/team/${p.id}`} className="group block">
                <div className="relative aspect-[5/6] overflow-hidden">
                  {/* Slanted backdrop */}
                  <div className="absolute inset-x-[6%] bottom-0 h-[78%] -skew-x-[8deg] bg-surface-secondary transition-colors group-hover:bg-wydad-logo/15 rtl:skew-x-[8deg]" aria-hidden />
                  {p.photo ? (
                    <Image
                      src={p.photo}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    // No portrait yet: the crest stands in, never an invented photo
                    <div className="absolute inset-x-0 bottom-[22%] flex justify-center" aria-hidden>
                      <Image src="/images/wydad-crest.svg" alt="" width={96} height={122} className="h-auto w-[38%] opacity-25 grayscale transition-all duration-500 group-hover:opacity-60 group-hover:grayscale-0" />
                    </div>
                  )}
                  {p.number != null && (
                    <span className="absolute start-[12%] top-[26%] font-condensed text-6xl font-extrabold leading-none text-wydad-red/90" aria-hidden>
                      {p.number}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="font-condensed text-xs font-bold uppercase tracking-[0.12em] text-wydad-red">{tHeader(`pos_${p.position}`)}</p>
                  {first && <p className="mt-1 text-sm text-fg-secondary">{first}</p>}
                  <p className="font-condensed text-2xl font-extrabold uppercase leading-tight text-fg transition-colors group-hover:text-wydad-red">
                    {p.number != null && <span className="sr-only">{p.number} </span>}
                    {last}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
