import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'profile' });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-display-md font-bold text-fg">
        {t('title')}
      </h1>

      {/* Login prompt — shown when not authenticated */}
      <div className="mt-8 rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
        {/* User icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface-secondary">
          <svg className="h-10 w-10 text-fg-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>

        <p className="mt-6 text-body-md text-fg-muted">
          {t('login_required')}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button className="rounded-xl bg-wydad-logo px-8 py-3 text-sm font-bold text-white transition-all hover:bg-wydad-red-dark active:scale-[0.98]">
            {t('login')}
          </button>
          <button className="rounded-xl border border-border bg-surface px-8 py-3 text-sm font-bold text-fg transition-colors hover:border-wydad-red/30 hover:text-wydad-red">
            {t('register')}
          </button>
        </div>
      </div>

      {/* Preview of what's behind auth — greyed out cards */}
      <div className="mt-6 space-y-4 opacity-50">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-base font-bold text-fg">{t('account_info')}</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">{t('email')}</span>
              <span className="h-4 w-40 rounded bg-surface-secondary" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">{t('member_since')}</span>
              <span className="h-4 w-24 rounded bg-surface-secondary" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-base font-bold text-fg">{t('subscription')}</h2>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-sm text-fg-muted">{t('current_plan')}</span>
              <p className="mt-0.5 font-semibold text-fg">{t('free_plan')}</p>
            </div>
            <Link
              href="/wydad-plus"
              className="rounded-lg bg-wydad-red/10 px-4 py-2 text-xs font-bold text-wydad-red"
            >
              {t('upgrade')}
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-base font-bold text-fg">{t('notifications')}</h2>
          <div className="mt-4 space-y-4">
            {(['match_alerts', 'news_alerts', 'transfer_alerts'] as const).map(key => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-fg-secondary">{t(key)}</span>
                <div className="h-6 w-10 rounded-full bg-surface-secondary" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
