import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export type FootballTab = 'squad' | 'staff' | 'fixtures' | 'standings' | 'honours';

export type Sport = 'football' | 'espoirs' | 'basketball';

const TABS: Record<Sport, { key: FootballTab; href: string }[]> = {
  football: [
    { key: 'squad', href: '/team' },
    { key: 'staff', href: '/team/staff' },
    { key: 'fixtures', href: '/matches' },
    { key: 'standings', href: '/standings' },
    { key: 'honours', href: '/team/honours' },
  ],
  espoirs: [
    { key: 'squad', href: '/team/espoirs' },
    { key: 'fixtures', href: '/team/espoirs/fixtures' },
  ],
  basketball: [
    { key: 'squad', href: '/basketball/squad' },
    { key: 'staff', href: '/basketball/staff' },
    { key: 'fixtures', href: '/basketball' },
    { key: 'standings', href: '/basketball/standings' },
    { key: 'honours', href: '/basketball/honours' },
  ],
};

/** Section sub-navigation (psg.fr style): squad, staff, fixtures, standings, honours, per sport. */
export function FootballNav({ active, sport = 'football' }: { active: FootballTab; sport?: Sport }) {
  const t = useTranslations('football');
  // Espoirs share the football labels
  const tSport = useTranslations(sport === 'basketball' ? 'basketball' : 'football');
  return (
    <div className="border-b border-border bg-surface-secondary/60">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        {sport === 'basketball' ? (
          <p className="font-condensed text-sm font-bold uppercase italic tracking-wide text-fg-muted rtl:not-italic">{tSport('section')}</p>
        ) : (
          // Men's football: first team or Espoirs (U23)
          <div role="group" aria-label={t('team_choice')} className="flex gap-2">
            {(['football', 'espoirs'] as const).map((team) => (
              <Link
                key={team}
                href={team === 'football' ? '/team' : '/team/espoirs'}
                aria-current={team === sport ? 'true' : undefined}
                className={`rounded-full px-3 py-1 font-condensed text-sm font-bold uppercase tracking-wide transition-colors ${
                  team === sport ? 'bg-wydad-logo text-white' : 'bg-surface text-fg-secondary ring-1 ring-border hover:text-fg'
                }`}
              >
                {t(team === 'football' ? 'first_team' : 'espoirs')}
              </Link>
            ))}
          </div>
        )}
        <nav aria-label={tSport('section')} className="no-scrollbar -mx-4 mt-1 overflow-x-auto px-4">
          <ul className="flex gap-6 sm:gap-10">
            {TABS[sport].map((tab) => {
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
