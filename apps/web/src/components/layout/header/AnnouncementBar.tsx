'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRightIcon, ChevronRightIcon } from './icons';
import { SmartLink } from './SmartLink';
import type { Announcement } from './types';

/**
 * Red flash bar with one announcement at a time. Visitors step through with the arrows;
 * nothing rotates on its own, so the message never moves while being read.
 */
export function AnnouncementBar({ items }: { items: Announcement[] }) {
  const t = useTranslations('header');
  const [index, setIndex] = useState(0);
  const [stepped, setStepped] = useState(false);
  if (items.length === 0) return null;

  const item = items[index % items.length];
  const many = items.length > 1;
  const step = (d: number) => {
    setStepped(true);
    setIndex((i) => (i + d + items.length) % items.length);
  };

  const arrow = (d: 1 | -1) => (
    <button
      type="button"
      onClick={() => step(d)}
      aria-label={d === 1 ? t('next_announcement') : t('prev_announcement')}
      className="flex h-10 w-10 shrink-0 items-center justify-center text-white/85 transition-colors hover:bg-black/10 hover:text-white"
    >
      <ChevronRightIcon size={18} className={d === 1 ? 'rtl:rotate-180' : 'rotate-180 rtl:rotate-0'} />
    </button>
  );

  return (
    <section aria-label={t('announcements')} aria-roledescription="carousel" className="bg-wydad-logo text-white">
      <div className="mx-auto flex h-10 max-w-7xl items-center px-1 sm:px-4 lg:px-6">
        {many ? arrow(-1) : <span className="w-10 shrink-0" />}
        {/* Live region only after the visitor steps, so screen readers aren't interrupted on load */}
        <div aria-live={stepped ? 'polite' : 'off'} className="min-w-0 flex-1 text-center">
          {/* The message truncates first so the link always stays visible */}
          <p
            key={item.id}
            className="flex items-center justify-center gap-2 text-[13px] font-medium motion-safe:animate-[announceIn_260ms_ease-out] sm:text-sm"
          >
            <span className="min-w-0 truncate">{item.message}</span>
            {item.cta && (
              <SmartLink
                href={item.cta.href}
                className="group inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center gap-1 font-bold underline sm:min-w-0 decoration-white/50 underline-offset-4 transition-colors hover:decoration-white"
              >
                <span className="sr-only sm:not-sr-only">{item.cta.label}</span>
                <ArrowRightIcon size={14} className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </SmartLink>
            )}
          </p>
        </div>
        {many ? arrow(1) : <span className="w-10 shrink-0" />}
      </div>
    </section>
  );
}
