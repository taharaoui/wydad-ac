import { getTranslations, setRequestLocale } from 'next-intl/server';

function CheckIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-wydad-red" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}

export default async function WydadPlusPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'wydad_plus' });

  const tiers = [
    {
      name: t('free_tier'),
      price: t('free_price'),
      currency: '',
      period: '',
      desc: t('free_desc'),
      features: [t('free_f1'), t('free_f2'), t('free_f3'), t('free_f4')],
      highlighted: false,
      cta: t('join_family'),
    },
    {
      name: t('mid_tier'),
      price: t('mid_price'),
      currency: t('mid_currency'),
      period: t('mid_period'),
      desc: t('mid_desc'),
      features: [t('mid_f1'), t('mid_f2'), t('mid_f3'), t('mid_f4'), t('mid_f5'), t('mid_f6')],
      highlighted: true,
      cta: t('subscribe'),
    },
    {
      name: t('vip_tier'),
      price: t('vip_price'),
      currency: t('vip_currency'),
      period: t('vip_period'),
      desc: t('vip_desc'),
      features: [t('vip_f1'), t('vip_f2'), t('vip_f3'), t('vip_f4'), t('vip_f5'), t('vip_f6')],
      highlighted: false,
      cta: t('subscribe'),
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-dark to-surface-dark-secondary">
        {/* Subtle red glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 start-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-wydad-red/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {t('title')}
          </div>
          <h1 className="mt-6 font-display text-display-xl font-bold text-white sm:text-6xl">
            {t('subtitle')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg leading-relaxed text-white/60">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 ${
                tier.highlighted
                  ? 'border-wydad-logo bg-surface shadow-xl shadow-wydad-red/5'
                  : 'border-border bg-surface'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-wydad-logo px-4 py-1 text-xs font-bold text-white">
                  {t('most_popular')}
                </div>
              )}

              <div>
                <h3 className="font-display text-lg font-bold text-fg">
                  {tier.name}
                </h3>
                <p className="mt-1 text-sm text-fg-muted">{tier.desc}</p>
              </div>

              <div className="mt-6">
                {tier.currency ? (
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-display-lg font-bold text-fg">
                      {tier.price}
                    </span>
                    <span className="text-sm text-fg-muted">
                      {tier.currency}{tier.period}
                    </span>
                  </div>
                ) : (
                  <span className="font-display text-display-lg font-bold text-fg">
                    {tier.price}
                  </span>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-fg-secondary">
                    <CheckIcon />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 w-full rounded-xl px-6 py-3 text-sm font-bold transition-all ${
                  tier.highlighted
                    ? 'bg-wydad-logo text-white hover:bg-wydad-red-dark active:scale-[0.98]'
                    : 'border border-border bg-surface-secondary text-fg hover:border-wydad-red/30 hover:text-wydad-red'
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
