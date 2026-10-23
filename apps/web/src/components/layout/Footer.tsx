import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { TICKETS_URL } from '@/lib/links';
import { ACADEMY_URL, BRAND_URL, MEMBER_AREA_URL, STORE_URL, type NavLink } from '@/lib/navigation-config';
import { SmartLink } from './header/SmartLink';
import Image from 'next/image';

const SOCIAL_LINKS = [
  {
    name: 'YouTube',
    href: 'https://youtube.com/@WydadAC',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/wydad.official',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    name: 'X',
    href: 'https://x.com/WACofficiel',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/WydadAC',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

const SPONSORS = [
  { name: 'Ingelec', src: '/images/sponsors/ingelec.png', w: 140, h: 36, cls: 'h-10' },
  { name: 'Kappa', src: '/images/sponsors/kappa.svg', w: 100, h: 100, cls: 'h-10' },
  { name: 'Coca-Cola', src: '/images/sponsors/coca-cola.webp', w: 120, h: 40, cls: 'h-8' },
  { name: 'Fiat', src: '/images/sponsors/fiat.svg', w: 60, h: 40, cls: 'h-8' },
];

const colTitle = 'font-condensed text-xl font-bold uppercase tracking-wide text-white/70';
const colLink = 'text-[17px] font-medium text-white transition-opacity hover:opacity-70';

/** psg.fr-style footer in Wydad red: link columns, crest, partners, then a full-width DIMA WYDAD wordmark. */
export function Footer() {
  const t = useTranslations('footer');
  const tH = useTranslations('header');

  const club: NavLink[] = [
    { key: 'news', href: '/news' },
    { key: 'football', href: '/team' },
    { key: 'basketball', href: '/basketball' },
    { key: 'wydad_tv', href: '/wydad-tv' },
    { key: 'club', href: '/club' },
    { key: 'fans', href: '/fans' },
    { key: 'academy', href: ACADEMY_URL },
  ];
  const services: NavLink[] = [
    { key: 'member_area', href: MEMBER_AREA_URL },
    { key: 'tickets', href: TICKETS_URL },
    { key: 'store', href: STORE_URL },
    { key: 'brand', href: BRAND_URL },
    { key: 'gold_membership', href: '/gold-membership' },
  ];

  const column = (title: string, links: NavLink[]) => (
    <nav aria-label={title}>
      <h2 className={colTitle}>{title}</h2>
      <ul className="mt-6 space-y-3">
        {links.map((l) => (
          <li key={l.key}>
            <SmartLink href={l.href} className={colLink}>
              {tH(l.key)}
            </SmartLink>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <footer className="overflow-hidden bg-wydad-logo text-white">
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
          {column(t('club_name'), club)}
          {column(t('services'), services)}

          <div>
            <h2 className={colTitle}>{t('follow_us')}</h2>
            <p className="mt-6 max-w-xs text-[17px] leading-snug">{t('description')}</p>
            <div className="mt-6 flex gap-2.5">
              {SOCIAL_LINKS.map(({ name, href, icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white hover:text-wydad-logo"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <Link href="/" aria-label={tH('home_label')} className="hidden lg:block">
            <Image src="/images/wydad-crest-white.svg" alt="" width={150} height={190} className="h-44 w-auto" />
          </Link>
        </div>

        {/* Partners */}
        <div className="mt-16 border-t border-white/20 pt-8">
          <h2 className="text-center font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white/70">{t('sponsors')}</h2>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {SPONSORS.map((sp) => (
              <li key={sp.name}>
                <Image src={sp.src} alt={sp.name} width={sp.w} height={sp.h} className={`${sp.cls} w-auto brightness-0 invert opacity-80 transition-opacity hover:opacity-100`} />
              </li>
            ))}
          </ul>
        </div>

        {/* Wordmark, sized to the container width */}
        <p
          aria-hidden
          className="mt-16 select-none whitespace-nowrap text-center font-condensed font-extrabold uppercase leading-[0.8] tracking-tight"
          style={{ fontSize: 'min(18.5vw, 15.5rem)' }}
          dir="ltr"
        >
          <span className="font-semibold">Dima</span> Wydad
        </p>

        <p className="border-t border-white/20 py-6 text-center text-xs text-white/70">
          © {new Date().getFullYear()} {t('club_name')}. {t('rights')}
        </p>
      </div>
    </footer>
  );
}
