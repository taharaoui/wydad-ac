'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { isExternal } from '@/lib/navigation-config';
import { searchSite, type SearchEntry } from '@/lib/search';
import { CloseIcon, SearchIcon } from './icons';
import { useFocusTrap } from './useFocusTrap';

const GROUP_KEY = { page: 'pages', player: 'players', news: 'news_group' } as const;

/** Modal search: combobox input with grouped results; arrows to move, Enter to open, Escape to close. */
export function SearchDialog({ index, onClose }: { index: SearchEntry[]; onClose: () => void }) {
  const t = useTranslations('header');
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  useFocusTrap(ref, true, onClose);

  const results = useMemo(() => searchSite(index, query), [index, query]);

  const open = (entry: SearchEntry) => {
    onClose();
    if (isExternal(entry.href)) window.open(entry.href, '_blank', 'noopener');
    else router.push(entry.href);
  };

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={`${listId}-title`} className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[8vh] sm:px-4 sm:pt-[12vh]">
      <button type="button" aria-label={t('close')} tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-wydad-charcoal/60" />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white text-wydad-charcoal shadow-[0_30px_80px_rgb(0_0_0/0.35)]">
        <h2 id={`${listId}-title`} className="sr-only">
          {t('search')}
        </h2>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (results[active]) open(results[active]);
          }}
          className="flex items-center gap-3 border-b border-black/[0.08] ps-4 pe-2"
        >
          <SearchIcon size={20} className="shrink-0 text-wydad-logo" />
          <input
            data-autofocus
            type="search"
            role="combobox"
            aria-label={t('search')}
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            placeholder={t('search_placeholder')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((i) => Math.min(results.length - 1, i + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((i) => Math.max(0, i - 1));
              }
            }}
            className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-wydad-charcoal/40 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
          />
          <button type="button" onClick={onClose} aria-label={t('close')} className="flex h-11 w-11 items-center justify-center rounded-lg text-wydad-charcoal/60 hover:bg-black/[0.05] hover:text-wydad-charcoal">
            <CloseIcon size={18} />
          </button>
        </form>

        <ul id={listId} role="listbox" aria-label={t('search')} className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-wydad-charcoal/60">{t('search_empty', { q: query })}</li>}
          {results.map((entry, i) => (
            <li key={`${entry.kind}-${entry.href}`} role="presentation">
              {(i === 0 || results[i - 1].kind !== entry.kind) && (
                <p role="presentation" className="px-3 pb-1 pt-3 font-condensed text-xs font-bold uppercase tracking-[0.16em] text-wydad-charcoal/45">
                  {t(GROUP_KEY[entry.kind])}
                </p>
              )}
              <div
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => open(entry)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 ${
                  i === active ? 'bg-wydad-logo text-white' : 'text-wydad-charcoal'
                }`}
              >
                <span className="truncate font-medium">{entry.label}</span>
                {entry.meta && <span className={`shrink-0 text-xs ${i === active ? 'text-white/85' : 'text-wydad-charcoal/50'}`}>{entry.meta}</span>}
              </div>
            </li>
          ))}
        </ul>

        <p className="hidden border-t border-black/[0.06] px-4 py-2.5 text-xs text-wydad-charcoal/50 sm:block">{t('search_hint')}</p>
      </div>
    </div>
  );
}
