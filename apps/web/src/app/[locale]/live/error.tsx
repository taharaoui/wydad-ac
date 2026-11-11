'use client';

import { useTranslations } from 'next-intl';

/** Live hub failed to render (feeds unreachable…): explain and offer a retry */
export default function LiveError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('live');
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center" role="alert">
      <h1 className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">{t('error_title')}</h1>
      <p className="mt-4 text-fg-secondary">{t('error_text')}</p>
      <button type="button" onClick={reset} className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-wydad-logo px-6 font-condensed text-lg font-bold uppercase text-white hover:bg-wydad-red-hover">
        {t('retry')}
      </button>
    </div>
  );
}
