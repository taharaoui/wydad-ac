import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  // One build worker: pages share TheStatsAPI responses through the data cache instead of
  // fetching in parallel past the 12 requests/minute limit
  experimental: { cpus: 1 },
  // Enable image optimization for external sources (club photos, etc.)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        // Instagram post images (@wacofficiel); proxied because Instagram blocks cross-site loading
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      {
        // WAC Official Brand product photos (Shopify CDN)
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        // YouTube thumbnails (Wydad TV)
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
