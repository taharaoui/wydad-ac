import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BRAND_STORE_URL, getBrandProducts } from '@/lib/brand-store';
import { BrandCatalogue } from '@/components/shop/BrandCatalogue';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'brand' });
  return { title: 'WAC Official Brand', description: t('intro') };
}

/** WAC Official Brand: the brand store's catalogue, shown on the club site. */
export default async function BrandPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'brand' });
  const products = await getBrandProducts();

  return (
    <div>
      {/* Brand campaign visual (headline is part of the artwork), from wacofficialbrand.com */}
      <section className="relative overflow-hidden bg-[#d9d9d9]">
        <h1 className="sr-only">WAC Official Brand</h1>
        <picture>
          <source media="(min-width: 768px)" srcSet="/images/brand/hero-desktop.jpg" />
          <img
            src="/images/brand/hero-mobile.jpg"
            alt={t('hero_alt')}
            width={941}
            height={1672}
            className="block h-auto w-full md:aspect-[1672/941]"
          />
        </picture>
        <Image
          src="/images/brand/wac-brand-logo.png"
          alt="WAC Official Brand"
          width={400}
          height={294}
          priority
          className="absolute start-4 top-4 h-14 w-auto sm:start-8 sm:top-8 sm:h-20"
        />
        <a
          href={`${BRAND_STORE_URL}/collections/the-wydadi-way-collection`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-6 start-4 inline-flex min-h-12 items-center rounded-full bg-wydad-logo px-6 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-lg transition-colors hover:bg-wydad-red-hover sm:bottom-10 sm:start-[6%]"
        >
          {t('shop_collection')}
          <span className="sr-only"> {t('new_tab')}</span>
        </a>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {products.length > 0 ? (
          <BrandCatalogue products={products} locale={locale} />
        ) : (
          <p className="rounded-xl bg-surface-secondary p-6 text-fg-secondary">
            {t('unavailable')}{' '}
            <a href={BRAND_STORE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-wydad-red underline">
              wacofficialbrand.com
            </a>
          </p>
        )}
        <p className="mt-12 text-sm text-fg-muted">{t('checkout_note')}</p>
      </div>
    </div>
  );
}
