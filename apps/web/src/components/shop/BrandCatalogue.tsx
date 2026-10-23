'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { BrandProduct } from '@/lib/brand-store';

/** Category filter + product grid; each card opens the product on the brand store. */
export function BrandCatalogue({ products, locale }: { products: BrandProduct[]; locale: string }) {
  const t = useTranslations('brand');
  const [type, setType] = useState<string>('all');
  const types = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) if (p.type) counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  }, [products]);
  const shown = type === 'all' ? products : products.filter((p) => p.type === type);
  const price = (n: number) =>
    `${new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 2 }).format(n)} ${t('currency')}`;

  return (
    <div>
      <div role="group" aria-label={t('filter_label')} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {['all', ...types].map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={type === k}
            onClick={() => setType(k)}
            className={`whitespace-nowrap rounded-full px-4 py-2 font-condensed text-[15px] font-bold uppercase tracking-wide transition-colors ${
              type === k ? 'bg-wydad-logo text-white' : 'bg-surface-secondary text-fg hover:bg-wydad-logo/10'
            }`}
          >
            {k === 'all' ? t('all') : k}
          </button>
        ))}
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {shown.map((p) => (
          <li key={p.id}>
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-secondary">
                {p.image && (
                  <Image
                    src={p.image.src}
                    alt={p.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${p.available ? '' : 'opacity-60 grayscale'}`}
                  />
                )}
                {!p.available && (
                  <span className="absolute start-3 top-3 rounded-full bg-fg px-2.5 py-1 font-condensed text-xs font-bold uppercase tracking-wide text-white">{t('sold_out')}</span>
                )}
                {p.available && p.compareAt && (
                  <span className="absolute start-3 top-3 rounded-full bg-wydad-logo px-2.5 py-1 font-condensed text-xs font-bold uppercase tracking-wide text-white">{t('sale')}</span>
                )}
              </div>
              {p.type && <p className="mt-3 font-condensed text-xs font-bold uppercase tracking-[0.12em] text-wydad-red">{p.type}</p>}
              <p className="mt-1 line-clamp-2 font-semibold leading-snug text-fg group-hover:text-wydad-red">{p.title}</p>
              <p className="mt-1 text-sm text-fg-secondary">
                {/* Latin digits in every locale, so server and browser render the same text */}
                <bdi className="font-semibold text-fg">{price(p.price)}</bdi>
                {p.compareAt && <bdi className="ms-2 line-through">{price(p.compareAt)}</bdi>}
              </p>
              <span className="sr-only"> {t('new_tab')}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
