import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

/** Discord invite, once the club opens its server */
const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'fans' });
  return { title: t('title') };
}

type Block = { id: string; key: 'podcasts' | 'ultras' | 'historic_members' | 'community'; live: boolean; href?: string };

/** Fans hub: podcasts, ultras, historic season-ticket holders and the community server. */
export default async function FansPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'fans' });

  const blocks: Block[] = [
    { id: 'podcasts', key: 'podcasts', live: false },
    { id: 'ultras', key: 'ultras', live: true },
    { id: 'historic-members', key: 'historic_members', live: false },
    { id: 'community', key: 'community', live: !!DISCORD_URL, href: DISCORD_URL },
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-[#141016] text-white">
        <div className="pointer-events-none absolute -end-24 -top-24 h-[480px] w-[480px] rounded-full bg-wydad-logo/25 blur-[120px]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="font-condensed text-sm font-bold uppercase tracking-[0.16em] text-wydad-red">{t('kicker')}</p>
          <h1 className="mt-3 font-condensed text-6xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-8xl">{t('title')}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">{t('intro')}</p>
        </div>
      </section>

      {/* Gold Membership feature */}
      <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <Link
          href="/gold-membership"
          className="group grid overflow-hidden rounded-2xl bg-[#0d0c0f] text-white ring-1 ring-[#E8C468]/30 transition-shadow hover:shadow-[0_24px_60px_rgb(232_196_104/0.15)] sm:grid-cols-[minmax(0,1fr)_14rem]"
        >
          <div className="p-7 sm:p-9">
            <h2 className="font-condensed text-3xl font-extrabold uppercase italic leading-none text-[#E8C468] rtl:not-italic sm:text-4xl">{t('gold_title')}</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-white/75">{t('gold_text')}</p>
            <span className="mt-6 inline-flex items-center gap-1.5 font-condensed text-lg font-bold uppercase text-[#E8C468]">
              {t('gold_cta')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </div>
          <div className="relative hidden sm:block">
            <Image src="/images/membership/gold-membership.jpg" alt="" fill sizes="224px" className="object-cover object-[50%_45%] transition-transform duration-500 group-hover:scale-105" />
          </div>
        </Link>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8">
        {blocks.map((b) => (
          <section
            key={b.id}
            id={b.id}
            aria-labelledby={`${b.id}-title`}
            className={`relative flex scroll-mt-28 flex-col overflow-hidden rounded-2xl p-7 sm:p-9 ${
              b.key === 'ultras' ? 'bg-wydad-logo text-white md:row-span-1' : 'border border-border bg-surface text-fg'
            }`}
          >
            {b.key === 'ultras' && (
              <Image src="/images/wydad-crest-white.svg" alt="" width={220} height={280} className="pointer-events-none absolute -bottom-10 -end-10 h-64 w-auto opacity-10" aria-hidden />
            )}
            <div className="flex items-center justify-between gap-4">
              <h2 id={`${b.id}-title`} className="font-condensed text-3xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-4xl">
                {t(`${b.key}_title`)}
              </h2>
              {!b.live && (
                <span className="shrink-0 rounded-full bg-wydad-red/10 px-3 py-1 font-condensed text-xs font-bold uppercase tracking-[0.12em] text-wydad-red">{t('soon')}</span>
              )}
            </div>
            <p className={`relative mt-4 max-w-xl leading-relaxed ${b.key === 'ultras' ? 'text-white/85' : 'text-fg-secondary'}`}>{t(`${b.key}_text`)}</p>
            {b.href && (
              <a
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-11 w-fit items-center rounded bg-wydad-logo px-5 font-condensed text-lg font-bold uppercase text-white hover:bg-wydad-red-hover"
              >
                {t('community_cta')}
              </a>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
