'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { BrandProduct } from '@/lib/brand-store';

/** Homepage strip for WAC Official Brand (psg.fr "Nike Energy" style): title, Discover, product row. */
export function BrandRail({ products, title }: { products: BrandProduct[]; title?: string }) {
  const t = useTranslations('brand');
  const scroller = useRef<HTMLUListElement>(null);
  const [thumb, setThumb] = useState({ size: 1, offset: 0 });

  const update = () => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setThumb({ size: el.scrollWidth ? el.clientWidth / el.scrollWidth : 1, offset: max > 0 ? Math.abs(el.scrollLeft) / max : 0 });
  };

  if (products.length === 0) return null;

  return (
    <section aria-labelledby="brand-rail">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <Image src="/images/brand/wac-brand-logo.png" alt="" width={400} height={294} className="mb-3 h-10 w-auto" />
          <h2 id="brand-rail" className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-5xl" dir="ltr">
            {title ?? 'A new way to wear Wydad'}
          </h2>
          <p className="mt-3 text-lg text-fg-secondary">{t('rail_subtitle')}</p>
        </div>
        <Link
          href="/brand"
          className="group inline-flex min-h-12 items-center gap-2 bg-wydad-logo px-6 font-condensed text-lg font-extrabold uppercase italic text-white transition-colors hover:bg-wydad-red-hover rtl:not-italic"
        >
          {t('discover')}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      <ul ref={scroller} onScroll={update} className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {products.map((p) => (
          <li key={p.id} className="relative w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-[23%]">
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-surface-secondary">
                {p.image && (
                  <Image src={p.image.src} alt={p.title} fill sizes="(min-width: 1024px) 23vw, (min-width: 640px) 42vw, 72vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
              </div>
              {p.type && <p className="mt-4 font-condensed text-sm font-bold uppercase tracking-wide text-fg-muted">{p.type}</p>}
              <p className="mt-1 text-lg font-bold leading-snug text-fg group-hover:text-wydad-red">{p.title}</p>
              <span className="sr-only"> {t('new_tab')}</span>
            </a>
          </li>
        ))}
      </ul>

      {thumb.size < 1 && (
        <div className="mx-auto mt-8 h-[3px] w-36 overflow-hidden rounded-full bg-fg/10" aria-hidden>
          <div className="h-full rounded-full bg-fg" style={{ width: `${thumb.size * 100}%`, marginInlineStart: `${thumb.offset * (1 - thumb.size) * 100}%` }} />
        </div>
      )}
    </section>
  );
}
