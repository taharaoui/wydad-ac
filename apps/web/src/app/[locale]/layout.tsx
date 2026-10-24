import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, rtlLocales, type Locale } from '@/i18n/config';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { getSiteSettings } from '@/lib/cms/site';
import { Analytics } from '@vercel/analytics/next';
import '@/app/globals.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, settings] = await Promise.all([getTranslations({ locale, namespace: 'common' }), getSiteSettings(locale)]);

  return {
    title: {
      template: `%s | ${t('club_name')}`,
      default: settings.seoTitle ?? t('club_name'),
    },
    description: settings.seoDescription ?? t('club_name'),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const isRtl = rtlLocales.includes(locale as Locale);

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,600;1,700;1,800&family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-surface text-fg antialiased transition-colors duration-200">
          <NextIntlClientProvider messages={messages}>
            <div className="flex min-h-screen flex-col">
              <AnnouncementBar />
              <Header />
              <main id="main" tabIndex={-1} className="flex-1 outline-none">{children}</main>
              <Footer />
            </div>
          </NextIntlClientProvider>
          <Analytics />
      </body>
    </html>
  );
}
