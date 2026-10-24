import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  CLUB_SOURCE_URL,
  ERAS,
  crestsForYear,
  FACILITIES,
  FIGURES,
  NICKNAMES,
  STADIUM_HISTORY,
  TIMELINE,
  TROPHIES_INTERNATIONAL,
  TROPHIES_NATIONAL,
} from '@/lib/club-info';
import { HonoursList } from '@/components/club/HonoursList';
import { HonoursBanners } from '@/components/club/HonoursBanners';

const sectionTitle = 'font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-5xl';
const kicker = 'font-condensed text-sm font-bold uppercase tracking-[0.16em] text-wydad-red';

export default async function ClubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'club' });
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';

  const facts = [
    { label: t('founded'), value: t('founded_value') },
    { label: t('president'), value: t('president_value') },
    { label: t('stadium'), value: t('stadium_name') },
    { label: t('colors'), value: t('colors_value') },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-dark text-white">
        <div className="pointer-events-none absolute -end-24 -top-24 h-[520px] w-[520px] rounded-full bg-white/10 blur-[120px]" aria-hidden />
        <Image
          src="/images/wydad-crest-white.svg"
          alt=""
          width={420}
          height={530}
          className="pointer-events-none absolute -bottom-16 end-0 hidden h-[115%] w-auto opacity-[0.06] md:block"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className={`${kicker} !text-white/75`}>{t('since')}</p>
          <h1 className="mt-3 font-condensed text-6xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-8xl">{t('title')}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">{t('about_text')}</p>

          <dl className="mt-12 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="bg-surface-dark p-5">
                <dt className="font-condensed text-xs font-bold uppercase tracking-[0.14em] text-white/50">{f.label}</dt>
                <dd className="mt-1.5 font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* History: five eras, then key dates */}
      <section id="history" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className={sectionTitle}>{t('history')}</h2>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-fg-secondary">{t('history_text')}</p>

        <ol className="mt-14 space-y-14">
          {ERAS.map((era, i) => (
            <li key={era.period} className="grid gap-4 border-t border-border pt-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
              <div>
                <p className="font-condensed text-sm font-bold uppercase tracking-[0.16em] text-fg-muted">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="mt-1 font-condensed text-4xl font-extrabold leading-none text-wydad-red sm:text-5xl">
                  <bdi dir="ltr">{era.period}</bdi>
                </p>
                <h3 className="mt-3 font-condensed text-2xl font-bold uppercase leading-tight text-fg">{era.title[lang]}</h3>
              </div>
              <div className="space-y-4 text-lg leading-relaxed text-fg-secondary">
                {era.paragraphs.map((p) => (
                  <p key={p.fr}>{p[lang]}</p>
                ))}
              </div>
            </li>
          ))}
        </ol>

        <h3 className={`${kicker} mt-16`}>{t('key_dates')}</h3>
        <ol className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {TIMELINE.map((entry) => (
            <li key={entry.year} className="border-s-2 border-wydad-logo ps-5">
              <div className="flex items-center gap-3">
                <p className="font-condensed text-3xl font-extrabold leading-none text-wydad-red">{entry.year}</p>
                {/* Crest the club wore at the time */}
                <span className="flex gap-1.5">
                  {crestsForYear(Number(entry.year)).map((c) => (
                    <span key={c.src} className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full ${c.dark ? 'bg-black' : 'bg-surface ring-1 ring-border'}`}>
                      <Image src={c.src} alt="" width={44} height={44} className={c.dark ? 'h-full w-full object-cover' : 'h-9 w-auto'} />
                    </span>
                  ))}
                </span>
              </div>
              <h4 className="mt-2 font-condensed text-xl font-bold uppercase text-fg">{entry.title[lang]}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-secondary">{entry.text[lang]}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Honours */}
      <section id="honours" className="border-y border-border bg-surface-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className={sectionTitle}>{t('honours')}</h2>
          <div className="mt-10">
            <HonoursBanners lang={lang} />
          </div>
          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            <HonoursList title={t('honours_national')} trophies={TROPHIES_NATIONAL} lang={lang} />
            <HonoursList title={t('honours_international')} trophies={TROPHIES_INTERNATIONAL} lang={lang} />
          </div>
        </div>
      </section>

      {/* Identity */}
      <section id="identity" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className={sectionTitle}>{t('identity')}</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <dl className="divide-y divide-border">
              {[
                { label: t('founded'), value: t('founded_value') },
                { label: t('founder'), value: t('founder_value') },
                { label: t('president'), value: t('president_value') },
                { label: t('headquarters'), value: t('headquarters_value') },
              ].map((row) => (
                <div key={row.label} className="py-3.5 first:pt-0">
                  <dt className="text-sm text-fg-muted">{row.label}</dt>
                  <dd className="mt-0.5 font-semibold text-fg">{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <p className="text-sm text-fg-muted">{t('colors')}</p>
              <div className="mt-2 flex gap-2">
                <div className="h-8 flex-1 rounded-lg bg-wydad-logo" />
                <div className="h-8 flex-1 rounded-lg border border-border bg-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <h3 className="font-condensed text-xl font-bold uppercase tracking-wide text-fg">{t('nicknames')}</h3>
            <ul className="mt-5 flex flex-wrap gap-2">
              {[{ fr: t('nickname_value'), en: t('nickname_value'), ar: t('nickname_value') }, ...NICKNAMES].map((n) => (
                <li key={n.fr} className="rounded-full bg-wydad-red/10 px-3.5 py-1.5 text-sm font-semibold text-wydad-red">
                  {n[lang]}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-wydad-logo p-6 text-white sm:p-8">
            <h3 className="font-condensed text-xl font-bold uppercase tracking-wide">{t('supporters')}</h3>
            <p className="mt-2 font-condensed text-5xl font-extrabold uppercase italic leading-none rtl:not-italic">Winners 2005</p>
            <p className="mt-4 leading-relaxed text-white/85">{t('supporters_text')}</p>
          </div>
        </div>
      </section>

      {/* Stadium + facilities */}
      <section id="stadium" className="bg-surface-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="font-condensed text-4xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-5xl">{t('facilities')}</h2>

          <div className="mt-10 grid items-start gap-10 lg:grid-cols-2">
            <figure className="relative aspect-[1200/1179] overflow-hidden rounded-2xl ring-1 ring-white/10">
              <Image
                src="/images/club/stade-mohammed-v.webp"
                alt={t('stadium_photo_alt')}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </figure>
            <div>
              <p className={`${kicker} !text-white/75`}>{t('stadium')}</p>
              <h3 className="mt-2 font-condensed text-3xl font-bold uppercase">{t('stadium_name')}</h3>
              <p className="mt-4 max-w-2xl leading-relaxed text-white/70">{t('stadium_text')}</p>
              <dl className="mt-6 grid max-w-md grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.06] p-4">
                  <dt className="text-xs text-white/50">{t('capacity')}</dt>
                  <dd className="mt-1 font-condensed text-3xl font-extrabold">{t('capacity_value')}</dd>
                </div>
                <div className="rounded-xl bg-white/[0.06] p-4">
                  <dt className="text-xs text-white/50">{t('location')}</dt>
                  <dd className="mt-1 font-semibold">{t('location_value')}</dd>
                </div>
              </dl>
              <h4 className="mt-10 font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white/50">{t('milestones')}</h4>
              <ol className="mt-4 space-y-4">
                {STADIUM_HISTORY.map((m) => (
                  <li key={m.year} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3">
                    <span className="font-condensed text-xl font-extrabold text-white">{m.year}</span>
                    <span className="text-white/80">{m.text[lang]}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-14 grid items-start gap-6 md:grid-cols-2">
            {FACILITIES.map((f) => (
              <div key={f.id} className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                {f.photo && (
                  <div className="relative aspect-[16/9]">
                    <Image src={f.photo.src} alt={f.photo.alt[lang]} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                  </div>
                )}
                <div className="p-6 sm:p-8">
                  <h3 className="font-condensed text-2xl font-bold uppercase">{f.name[lang]}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {f.facts.map((fact) => (
                      <li key={fact.fr} className="flex gap-3 text-white/75">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white" aria-hidden />
                        {fact[lang]}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Historical figures */}
      <section id="figures" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className={sectionTitle}>{t('figures')}</h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FIGURES.map((f) => (
            <li key={f.name.fr} className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-wydad-red/40">
              <p className="font-condensed text-xs font-bold uppercase tracking-[0.14em] text-wydad-red">{f.role[lang]}</p>
              <h3 className="mt-2 font-condensed text-2xl font-bold uppercase leading-tight text-fg">{f.name[lang]}</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-secondary">{f.text[lang]}</p>
            </li>
          ))}
        </ul>

        <p className="mt-14 border-t border-border pt-5 text-xs text-fg-muted">
          <a href={CLUB_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-fg-muted/40 underline-offset-2 hover:text-fg">
            {t('source')}
          </a>
        </p>
      </section>
    </div>
  );
}
