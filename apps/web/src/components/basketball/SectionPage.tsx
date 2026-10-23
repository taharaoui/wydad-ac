import Image from 'next/image';
import type { ReactNode } from 'react';
import { FootballNav, type FootballTab } from '@/components/team/FootballNav';

/** Shared frame for the basketball section pages: tabs, big title, season line, content. */
export function SectionPage({ active, title, season, children }: { active: FootballTab; title: string; season: string; children: ReactNode }) {
  return (
    <div>
      <FootballNav sport="basketball" active={active} />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <h1 className="font-condensed text-6xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-7xl">{title}</h1>
        <p className="mt-3 font-condensed text-2xl font-bold text-fg">{season}</p>
        <div className="mt-12">{children}</div>
      </div>
    </div>
  );
}

/** Shown while a list hasn't been published yet: says so rather than showing invented data. */
export function PendingNotice({ text }: { text: string }) {
  return (
    <div className="flex max-w-3xl items-start gap-5 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <Image src="/images/wydad-crest.svg" alt="" width={48} height={61} className="h-14 w-auto shrink-0" />
      <p className="text-lg leading-relaxed text-fg-secondary">{text}</p>
    </div>
  );
}
