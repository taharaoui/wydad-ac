import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function ClubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'club' });

  const trophies = [
    {
      key: 'botola_titles',
      count: t('botola_count'),
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0019.875 10.875h-.375m-13.5 8.25v-4.5A3.375 3.375 0 004.125 10.875h.375m0 0V6.375A3.375 3.375 0 017.875 3h8.25a3.375 3.375 0 013.375 3.375v4.5" />
        </svg>
      ),
    },
    {
      key: 'cup_titles',
      count: t('cup_count'),
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
    },
    {
      key: 'caf_cl_titles',
      count: t('caf_cl_count'),
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.777.514-3.434 1.4-4.832" />
        </svg>
      ),
    },
    {
      key: 'caf_sc_titles',
      count: t('caf_sc_count'),
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
    },
  ];

  const identityItems = [
    { key: 'founded', value: t('founded_value') },
    { key: 'nickname', value: t('nickname_value') },
    { key: 'colors', value: t('colors_value') },
    { key: 'president', value: t('president_value') },
  ];

  return (
    <div>
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface-dark via-surface-dark-secondary to-wydad-red/20">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)',
            backgroundSize: '24px 24px',
          }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-wydad-red">
            {t('founded_value')}
          </p>
          <h1 className="mt-3 font-display text-display-xl font-bold text-white sm:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-2xl text-body-lg leading-relaxed text-white/70">
            {t('about_text')}
          </p>
        </div>
      </section>

      {/* Honours */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <h2 className="font-display text-display-md font-bold text-fg">
          {t('honours')}
        </h2>

        {/* Domestic */}
        <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-fg-muted">
          {t('honours_domestic')}
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {trophies.slice(0, 2).map(({ key, count, icon }) => (
            <div
              key={key}
              className="flex items-center gap-5 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-wydad-red/30"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-wydad-red/10 text-wydad-red">
                {icon}
              </div>
              <div>
                <p className="font-display text-display-md font-bold text-fg">{count}</p>
                <p className="mt-0.5 text-sm text-fg-muted">{t(key)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Continental */}
        <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-fg-muted">
          {t('honours_continental')}
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {trophies.slice(2).map(({ key, count, icon }) => (
            <div
              key={key}
              className="flex items-center gap-5 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-wydad-red/30"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-accent-gold/10 text-accent-gold">
                {icon}
              </div>
              <div>
                <p className="font-display text-display-md font-bold text-fg">{count}</p>
                <p className="mt-0.5 text-sm text-fg-muted">{t(key)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* History */}
      <section className="border-t border-border bg-surface-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="font-display text-display-md font-bold text-fg">
                {t('history')}
              </h2>
              <p className="mt-4 text-body-md leading-relaxed text-fg-secondary">
                {t('history_text')}
              </p>
            </div>

            {/* Identity card */}
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <h3 className="font-display text-lg font-bold text-fg">
                {t('identity')}
              </h3>
              <div className="mt-5 divide-y divide-border">
                {identityItems.map(({ key, value }) => (
                  <div key={key} className="flex items-center justify-between py-3.5">
                    <span className="text-sm text-fg-muted">{t(key)}</span>
                    <span className="font-semibold text-fg">{value}</span>
                  </div>
                ))}
              </div>
              {/* Colours swatch */}
              <div className="mt-4 flex gap-2">
                <div className="h-8 flex-1 rounded-lg bg-wydad-red" />
                <div className="h-8 flex-1 rounded-lg border border-border bg-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stadium */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <h2 className="font-display text-display-md font-bold text-fg">
          {t('stadium')}
        </h2>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          {/* Stadium image placeholder */}
          <div className="aspect-[21/9] bg-gradient-to-br from-surface-secondary to-surface-dark/10">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <svg className="mx-auto h-16 w-16 text-fg-muted/20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
                </svg>
                <p className="mt-2 text-sm text-fg-muted/40">{t('stadium_name')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-fg">
              {t('stadium_name')}
            </h3>
            <p className="mt-3 max-w-2xl text-body-md leading-relaxed text-fg-secondary">
              {t('stadium_text')}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-secondary p-4">
                <p className="text-xs text-fg-muted">{t('capacity')}</p>
                <p className="mt-1 font-display text-xl font-bold text-fg">{t('capacity_value')}</p>
              </div>
              <div className="rounded-xl bg-surface-secondary p-4">
                <p className="text-xs text-fg-muted">{t('location')}</p>
                <p className="mt-1 font-display text-xl font-bold text-fg">{t('location_value')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
