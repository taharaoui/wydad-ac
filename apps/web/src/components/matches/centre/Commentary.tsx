'use client';

import { useState } from 'react';

export type CommentaryKind = 'full_time' | 'goal' | 'yellow' | 'red' | 'sub' | 'kick_off';

export interface CommentaryItem {
  id: string;
  kind: CommentaryKind;
  /** Minute when the source gives one */
  minute?: number;
  text: string;
  /** Big outlined label for milestones (FULL TIME, KICK OFF) */
  label?: string;
}

const KEY_KINDS: CommentaryKind[] = ['full_time', 'goal', 'red', 'kick_off'];

function Icon({ kind }: { kind: CommentaryKind }) {
  switch (kind) {
    case 'goal':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 7.5l4 2.9-1.5 4.7h-5L8 10.4z" fill="currentColor" />
        </svg>
      );
    case 'yellow':
      return <span className="block h-5 w-3.5 rounded-[2px] bg-yellow-400" aria-hidden />;
    case 'red':
      return <span className="block h-5 w-3.5 rounded-[2px] bg-red-600" aria-hidden />;
    case 'sub':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M8 20V5M4 9l4-4 4 4" stroke="rgb(var(--color-accent-green))" />
          <path d="M16 4v15M12 15l4 4 4-4" stroke="rgb(var(--color-wydad-red))" />
        </svg>
      );
    default:
      // Whistle
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="9" cy="14" r="6" />
          <path d="M13.5 10 21 6.5V10h-6M9 14h.01" />
        </svg>
      );
  }
}

/** psg.fr-style commentary feed, newest first, with a "key moments" filter. */
export function Commentary({ items, keyMomentsLabel, note }: { items: CommentaryItem[]; keyMomentsLabel: string; note?: string }) {
  const [keyOnly, setKeyOnly] = useState(false);
  const shown = keyOnly ? items.filter((i) => KEY_KINDS.includes(i.kind)) : items;

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <span className="text-sm text-fg">{keyMomentsLabel}</span>
        <button
          type="button"
          role="switch"
          aria-checked={keyOnly}
          aria-label={keyMomentsLabel}
          onClick={() => setKeyOnly((v) => !v)}
          className={`relative h-7 w-12 rounded-full border transition-colors ${keyOnly ? 'border-wydad-logo bg-wydad-logo' : 'border-border bg-surface'}`}
        >
          <span
            className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-all ${
              keyOnly ? 'start-[22px] bg-white' : 'start-[3px] bg-fg-muted/50'
            }`}
          />
        </button>
      </div>

      <ol className="mt-6 grid gap-2">
        {shown.map((item) => {
          const milestone = item.kind === 'full_time' || item.kind === 'kick_off';
          return (
            <li
              key={item.id}
              className={`grid grid-cols-[44px_minmax(0,1fr)] items-center gap-x-4 px-4 py-5 sm:grid-cols-[minmax(0,180px)_44px_56px_minmax(0,1fr)] sm:px-6 ${
                milestone ? 'bg-surface-secondary' : item.kind === 'goal' ? 'bg-wydad-red/[0.07]' : 'border-b border-border'
              }`}
            >
              <span
                className="hidden font-condensed text-3xl font-extrabold uppercase italic leading-none text-transparent rtl:not-italic sm:block"
                style={{ WebkitTextStroke: '1px rgb(var(--color-fg))' }}
              >
                {item.label ?? ''}
              </span>
              <span className="flex justify-center text-wydad-logo">
                <Icon kind={item.kind} />
              </span>
              <span className="hidden font-condensed text-2xl font-extrabold tabular-nums text-fg sm:block">
                {item.minute != null ? `${item.minute}'` : ''}
              </span>
              <p className={`text-base leading-snug text-fg ${item.kind === 'goal' ? 'font-semibold' : ''}`}>
                {item.minute != null && <span className="me-2 font-bold tabular-nums sm:hidden">{item.minute}&apos;</span>}
                {item.text}
              </p>
            </li>
          );
        })}
      </ol>

      {note && <p className="mt-5 text-center text-xs text-fg-muted">{note}</p>}
    </div>
  );
}
