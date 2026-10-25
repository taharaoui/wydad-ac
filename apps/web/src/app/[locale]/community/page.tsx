import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { NewsletterForm } from '@/components/newsletter/NewsletterForm';

/** Discord invite of the supporters' server; the page explains and offers notifications until it is set */
const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL?.trim() || undefined;
const isInvite = (url?: string) => !!url && /^https:\/\/(discord\.gg|discord\.com\/invite)\/[\w-]+$/.test(url);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'community' });
  return { title: t('title'), description: t('intro') };
}

function DiscordLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.32 4.37A19.8 19.8 0 0 0 15.4 2.85a13.7 13.7 0 0 0-.63 1.29 18.3 18.3 0 0 0-5.5 0 12.6 12.6 0 0 0-.64-1.29 19.7 19.7 0 0 0-4.93 1.52C.6 9.05-.24 13.6.18 18.1a19.9 19.9 0 0 0 6.04 3.05c.49-.66.92-1.37 1.3-2.1a12.9 12.9 0 0 1-2.04-.98l.5-.39a14.2 14.2 0 0 0 12.06 0l.5.39c-.65.39-1.33.71-2.04.98.37.74.81 1.44 1.3 2.1a19.8 19.8 0 0 0 6.03-3.05c.5-5.22-.84-9.73-3.51-13.73ZM8.02 15.33c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.17 1.09 2.15 2.42 0 1.34-.95 2.42-2.15 2.42Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.17 1.09 2.15 2.42 0 1.34-.94 2.42-2.15 2.42Z" />
    </svg>
  );
}

const VALUES = ['matchday', 'debates', 'news', 'quiz', 'events', 'exclusive'] as const;
const ICONS: Record<(typeof VALUES)[number], string> = { matchday: '⚽', debates: '💬', news: '📣', quiz: '🧠', events: '🎉', exclusive: '⭐' };
/** Illustrative channel names (a preview of the layout, not live data) */
const CHANNELS = ['annonces', 'matchday', 'transferts', 'tactique', 'quiz-wydadi', 'wydad-live'];

export default async function CommunityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'community' });
  const invite = isInvite(DISCORD_URL) ? DISCORD_URL : undefined;

  const cta = invite ? (
    <a href={invite} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-3 rounded-lg bg-white px-6 font-condensed text-xl font-extrabold uppercase text-wydad-logo shadow-lg transition-transform hover:-translate-y-0.5">
      <DiscordLogo className="h-6 w-6" />
      {t('join')}
    </a>
  ) : (
    <div className="max-w-lg rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur" id="notify">
      <p className="font-condensed text-2xl font-extrabold uppercase">{t('soon_title')}</p>
      <p className="mt-1 text-sm text-white/80">{t('soon_text')}</p>
      <div className="mt-4">
        <NewsletterForm variant="compact" source="community" defaultTopics={['community']} tone="dark" />
      </div>
    </div>
  );

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-wydad-logo text-white">
        <Image src="/images/wydad-crest-white.svg" alt="" width={600} height={760} className="pointer-events-none absolute -end-32 -top-20 -z-10 h-[140%] w-auto opacity-[0.07]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:px-8">
          <div>
            <p className="flex items-center gap-2 font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white/80">
              <DiscordLogo className="h-5 w-5" />
              {t('kicker')}
            </p>
            <h1 className="mt-3 font-condensed text-6xl font-extrabold uppercase italic leading-[0.9] rtl:not-italic sm:text-8xl">{t('title')}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">{t('intro')}</p>
            <div className="mt-8">{cta}</div>
          </div>
          {/* Server layout preview: illustrates the channels, no fake members or messages */}
          <div className="hidden overflow-hidden rounded-2xl bg-wydad-charcoal shadow-2xl ring-1 ring-black/20 sm:block" aria-hidden>
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-wydad-logo">
                <Image src="/images/wydad-crest-white.svg" alt="" width={24} height={30} className="h-7 w-auto" />
              </span>
              <span className="font-condensed text-xl font-extrabold uppercase">Wydadi Community</span>
            </div>
            <ul className="space-y-1 p-4">
              {CHANNELS.map((c, i) => (
                <li key={c} className={`flex items-center gap-2 rounded-md px-3 py-2 text-[15px] ${i === 1 ? 'bg-white/10 text-white' : 'text-white/60'}`}>
                  <span className="text-white/40">#</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 id="why" className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-5xl">{t('why')}</h2>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <li key={v} className="bg-surface p-7">
              <span className="text-3xl" aria-hidden>{ICONS[v]}</span>
              <h3 className="mt-4 font-condensed text-2xl font-extrabold uppercase leading-tight text-fg">{t(`v_${v}`)}</h3>
              <p className="mt-2 text-fg-secondary">{t(`v_${v}_text`)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-sm text-fg-muted">{t('rules')}</p>
      </section>

      <section className="bg-surface-secondary/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-12 sm:px-6 lg:px-8">
          <p className="max-w-xl font-condensed text-3xl font-extrabold uppercase italic leading-tight text-fg rtl:not-italic">{t('cta_title')}</p>
          <div className="flex flex-wrap gap-3">
            {invite ? (
              <a href={invite} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-wydad-logo px-6 font-condensed text-lg font-bold uppercase text-white hover:bg-wydad-red-hover">
                <DiscordLogo className="h-5 w-5" />
                {t('join')}
              </a>
            ) : (
              <a href="#notify" className="inline-flex min-h-12 items-center rounded-lg bg-wydad-logo px-6 font-condensed text-lg font-bold uppercase text-white hover:bg-wydad-red-hover">
                {t('notify')}
              </a>
            )}
            <Link href="/live" className="inline-flex min-h-12 items-center rounded-lg border border-border bg-white px-6 font-condensed text-lg font-bold uppercase text-fg hover:border-wydad-logo">Wydad Live</Link>
            <Link href="/quiz" className="inline-flex min-h-12 items-center rounded-lg border border-border bg-white px-6 font-condensed text-lg font-bold uppercase text-fg hover:border-wydad-logo">Quiz Wydadi</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
