/** Official Wydad ticketing platform. Override with NEXT_PUBLIC_TICKETS_URL if it ever moves. */
export const TICKETS_URL = process.env.NEXT_PUBLIC_TICKETS_URL || 'https://wydad.ticketing.ma/';

/** On-site page that embeds the ticketing platform, so visitors stay on the club site */
export const TICKETS_PAGE = '/billetterie';

/**
 * Public address of the site, for absolute links in social previews (og:image). NEXT_PUBLIC_SITE_URL,
 * else the production domain Vercel provides, else the local dev server.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');
