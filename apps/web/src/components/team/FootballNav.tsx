import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export type FootballTab = 'squad' | 'staff' | 'fixtures' | 'standings' | 'honours';

const TABS: { key: FootballTab; href: string }[] = [
  { key: 'squad', href: '/team' },
  { key: 'staff', href: '/team/staff' },
  { key: 'fixtures', href: '/matches' },
  { key: 'standings', href: '/standings' },
  { key: 'honours', href: '/team/honours' },
];

/** Men's football sub-navigation (psg.fr style), shared by squad, staff, fixtures, standings and honours. */
export function FootballNav({ active }: { active: FootballTab }) {
  const t = useTranslations('football');
  return (
    <div className="border-b border-border bg-surface-secondary/60">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <p className="font-condensed text-sm font-bold uppercase italic tracking-wide text-fg-muted rtl:not-italic">{t('section')}</p>
        <nav aria-label={t('section')} className="no-scrollbar -mx-4 mt-1 overflow-x-auto px-4">
          <ul className="flex gap-6 sm:gap-10">
            {TABS.map((tab) => {
              const on = tab.key === active;
              return (
                <li key={tab.key}>
                  <Link
                    href={tab.href}
                    aria-current={on ? 'page' : undefined}
                    className={`relative block whitespace-nowrap py-3 font-condensed text-xl font-extrabold uppercase tracking-wide transition-colors sm:text-2xl ${
                      on ? 'text-fg' : 'text-fg-muted hover:text-fg'
                    }`}
                  >
                    {t(tab.key)}
                    {on && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-wydad-logo" aria-hidden />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
