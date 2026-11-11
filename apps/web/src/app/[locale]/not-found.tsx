import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/** 404 inside the site frame (header, footer, language) instead of Next's bare page */
export default function NotFound() {
  const t = useTranslations('not_found');
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:py-28">
      <Image src="/images/wydad-crest.svg" alt="" width={64} height={81} className="h-20 w-auto" />
      <p className="mt-8 font-condensed text-7xl font-extrabold leading-none text-wydad-red">404</p>
      <h1 className="mt-4 font-condensed text-4xl font-extrabold uppercase leading-none text-fg sm:text-5xl">{t('title')}</h1>
      <p className="mt-5 max-w-lg text-body-md text-fg-secondary">{t('text')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-lg bg-wydad-logo px-5 font-condensed text-lg font-bold uppercase text-white hover:bg-wydad-red-hover">
          {t('home')}
        </Link>
        <Link href="/news" className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 font-condensed text-lg font-bold uppercase text-fg hover:border-wydad-logo hover:text-wydad-red">
          {t('news')}
        </Link>
      </div>
    </div>
  );
}
