/**
 * WAC Official Brand catalogue, read from the store's public Shopify feed. The store can't be
 * framed (it sends X-Frame-Options: DENY), so products are shown natively and link to the store
 * for checkout.
 */
export const BRAND_STORE_URL = 'https://wacofficialbrand.com';

export interface BrandProduct {
  id: number;
  handle: string;
  title: string;
  type: string;
  price: number;
  compareAt?: number;
  available: boolean;
  image?: { src: string; width: number; height: number };
  url: string;
}

interface ShopifyProduct {
  id: number;
  handle: string;
  title: string;
  product_type: string;
  images: { src: string; width: number; height: number }[];
  variants: { price: string; compare_at_price: string | null; available: boolean }[];
}

/** Collection featured on the homepage ("A new way to wear Wydad") */
export const FEATURED_COLLECTION = 'the-wydadi-way-collection';

/** Whole catalogue, or one collection when `collection` is given */
export async function getBrandProducts(collection?: string): Promise<BrandProduct[]> {
  try {
    const path = collection ? `/collections/${collection}/products.json` : '/products.json';
    const res = await fetch(`${BRAND_STORE_URL}${path}?limit=250`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { products } = (await res.json()) as { products: ShopifyProduct[] };
    return products
      .filter((p) => p.images.length > 0)
      .map((p) => {
        const prices = p.variants.map((v) => Number(v.price));
        const compare = p.variants.map((v) => Number(v.compare_at_price ?? 0)).find((c) => c > Math.min(...prices));
        return {
          id: p.id,
          handle: p.handle,
          title: p.title,
          type: p.product_type.trim(),
          price: Math.min(...prices),
          compareAt: compare,
          available: p.variants.some((v) => v.available),
          image: p.images[0],
          url: `${BRAND_STORE_URL}/products/${p.handle}`,
        };
      })
      // In stock first, keeping the store's own order
      .sort((a, b) => Number(b.available) - Number(a.available));
  } catch (err) {
    console.warn('[brand-store] catalogue unavailable:', err instanceof Error ? err.message : err);
    return [];
  }
}
