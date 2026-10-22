import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  // Enable image optimization for external sources (club photos, etc.)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
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
