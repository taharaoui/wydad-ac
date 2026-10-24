import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n/config';
import { adminMiddleware } from './lib/supabase/middleware';

const intl = createMiddleware({
  locales,
  defaultLocale,
  // Arabic is default — wydadac.ma/ shows Arabic, wydadac.ma/fr/ shows French
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  // The admin lives outside the localized site: session check instead of locale routing
  if (request.nextUrl.pathname === '/admin' || request.nextUrl.pathname.startsWith('/admin/')) return adminMiddleware(request);
  return intl(request);
}

export const config = {
  // Match all pathnames except Next.js internals and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
