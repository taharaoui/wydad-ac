'use client';

import { useEffect, useState, type ReactNode } from 'react';

export type MatchTabIcon = 'overview' | 'lineups' | 'stats' | 'h2h';

export interface MatchTab {
  id: string;
  label: string;
  /** Big centred section heading (COMMENTARY, LINEUPS…) */
  title: string;
  icon: MatchTabIcon;
  content: ReactNode;
}

function TabIcon({ icon }: { icon: MatchTabIcon }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (icon) {
    case 'overview': // speech bubble
      return (
        <svg {...common}>
          <path d="M4 4h16v12H9l-5 4z" fill="currentColor" stroke="none" />
          <path d="M8 8.5h8M8 11.5h5" stroke="rgb(var(--color-surface))" />
        </svg>
      );
    case 'lineups': // shirt
      return (
        <svg {...common}>
          <path d="M8 3 3.5 5.5 5 10l2-.8V21h10V9.2l2 .8 1.5-4.5L16 3c-.5 1.5-2 2.5-4 2.5S8.5 4.5 8 3z" />
          <path d="M10 10v8M14 10v8" />
        </svg>
      );
    case 'stats':
      return (
        <svg {...common}>
          <path d="M5 20V12M10 20V5M15 20v-9M20 20v-5" />
        </svg>
      );
    default: // h2h, two arrows
      return (
        <svg {...common}>
          <path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4" />
        </svg>
      );
  }
}

/**
 * psg.fr-style match centre navigation: a bar fixed to the bottom of the screen with icon tabs.
 * The active tab is mirrored in the URL hash (#lineups) so it can be shared.
 */
export function MatchTabs({ tabs }: { tabs: MatchTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  const ids = tabs.map((t) => t.id).join(',');
  useEffect(() => {
    const sync = () => {
      const fromHash = window.location.hash.slice(1);
      if (ids.split(',').includes(fromHash)) setActive(fromHash);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [ids]);

  function select(id: string) {
    setActive(id);
    window.history.replaceState(null, '', `#${id}`);
    document.getElementById('match-panels')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="pb-28">
      <div id="match-panels" className="scroll-mt-20" />
      {tabs.map((tab) => (
        <section
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== tab.id}
          className="pt-14"
        >
          <h2 className="mb-10 text-center font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-5xl">
            {tab.title}
          </h2>
          {tab.content}
        </section>
      ))}

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur-md">
        <div role="tablist" className="mx-auto flex max-w-3xl justify-around">
          {tabs.map((tab) => {
            const on = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                aria-selected={on}
                onClick={() => select(tab.id)}
                className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 whitespace-nowrap px-1 pb-3 pt-3 text-[10px] sm:flex-none sm:px-3 sm:text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                  on ? 'text-wydad-logo' : 'text-wydad-logo/60 hover:text-wydad-logo'
                }`}
              >
                <span className={`absolute inset-x-3 top-0 h-[3px] bg-wydad-logo transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`} />
                <TabIcon icon={tab.icon} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
