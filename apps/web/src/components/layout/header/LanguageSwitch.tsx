'use client';

import { useTranslations } from 'next-intl';
import { localeNames } from '@/i18n/config';
import { LOCALE_ORDER, useSwitchLocale } from './LanguageSelector';

/** Full-width segmented language choice for the mobile drawer. */
export function LanguageSwitch({ onSwitch }: { onSwitch?: () => void }) {
  const t = useTranslations('header');
  const { locale, switchTo } = useSwitchLocale();

  return (
    <div role="group" aria-label={t('language')} className="grid grid-cols-3 gap-1 rounded-xl bg-black/[0.05] p-1">
      {LOCALE_ORDER.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={locale === l}
          onClick={() => {
            switchTo(l);
            onSwitch?.();
          }}
          className={`min-h-11 rounded-lg text-sm font-semibold transition-colors ${
            locale === l ? 'bg-white text-wydad-logo shadow-sm' : 'text-wydad-charcoal/70 hover:text-wydad-charcoal'
          }`}
        >
          {localeNames[l]}
        </button>
      ))}
    </div>
  );
}
