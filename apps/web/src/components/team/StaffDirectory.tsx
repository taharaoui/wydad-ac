'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { STAFF_CATEGORIES, type StaffCategory, type StaffMember } from '@/lib/staff';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Category tabs (only those with members) and member cards, after psg.fr/mens-football/staff. */
export function StaffDirectory({ members, lang }: { members: StaffMember[]; lang: 'ar' | 'fr' | 'en' }) {
  const t = useTranslations('football');
  const categories = STAFF_CATEGORIES.filter((c) => members.some((m) => m.category === c));
  const [active, setActive] = useState<StaffCategory | undefined>(categories[0]);
  if (!active) return null;
  const shown = members.filter((m) => m.category === active);

  return (
    <div>
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
        <div role="tablist" aria-label={t('staff')} className="mx-auto flex w-max gap-1 rounded-xl bg-surface-secondary p-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              id={`staff-tab-${c}`}
              aria-selected={c === active}
              aria-controls="staff-panel"
              onClick={() => setActive(c)}
              className={`whitespace-nowrap rounded-lg px-5 py-2.5 font-condensed text-lg font-extrabold uppercase italic tracking-wide transition-colors rtl:not-italic ${
                c === active ? 'bg-wydad-logo text-white' : 'text-fg hover:bg-fg/5'
              }`}
            >
              {t(`staff_${c}`)}
            </button>
          ))}
        </div>
      </div>

      <ul id="staff-panel" role="tabpanel" aria-labelledby={`staff-tab-${active}`} className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2">
        {shown.map((m) => (
          <li key={m.name} className="flex items-center gap-5 rounded-xl bg-surface-secondary/70 p-5">
            <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface ring-2 ring-wydad-logo/40">
              {m.photo ? (
                <Image src={m.photo} alt="" fill sizes="64px" className="object-cover object-top" />
              ) : (
                <span className="font-condensed text-xl font-extrabold text-wydad-red">{initials(m.name)}</span>
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-semibold text-fg">{lang === 'ar' && m.name_ar ? m.name_ar : m.name}</span>
              <span className="block text-fg-secondary">{m.role[lang]}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
