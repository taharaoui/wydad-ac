import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-border bg-surface-dark text-fg-inverse">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-wydad-red">
                <span className="font-display text-lg font-bold text-white">W</span>
              </div>
              <span className="font-display text-lg font-bold">{t('club_name')}</span>
            </div>
            <p className="mt-3 text-sm text-fg-inverse/60">{t('description')}</p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-fg-inverse/40">
              {t('quick_links')}
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link href="/matches" className="text-sm text-fg-inverse/70 hover:text-white transition-colors">
                  {t('matches')}
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-sm text-fg-inverse/70 hover:text-white transition-colors">
                  {t('team')}
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-sm text-fg-inverse/70 hover:text-white transition-colors">
                  {t('news')}
                </Link>
              </li>
              <li>
                <Link href="/club" className="text-sm text-fg-inverse/70 hover:text-white transition-colors">
                  {t('club')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Wydad+ */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-fg-inverse/40">
              Wydad+
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <Link href="/wydad-plus" className="text-sm text-fg-inverse/70 hover:text-white transition-colors">
                  {t('subscribe')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-fg-inverse/40">
              {t('follow_us')}
            </h3>
            <div className="mt-3 flex gap-3">
              {['youtube', 'instagram', 'x', 'facebook'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-fg-inverse/10 text-fg-inverse/60 transition-colors hover:bg-wydad-red hover:text-white"
                  aria-label={social}
                >
                  <span className="text-xs font-bold uppercase">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-fg-inverse/10 pt-6 text-center text-xs text-fg-inverse/40">
          <p>© {new Date().getFullYear()} {t('club_name')}. {t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}
