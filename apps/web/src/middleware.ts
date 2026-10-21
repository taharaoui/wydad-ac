import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  // Arabic is default — wydadac.ma/ shows Arabic, wydadac.ma/fr/ shows French
  localePrefix: 'as-needed',
});

export const config = {
  // Match all pathnames except Next.js internals and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
