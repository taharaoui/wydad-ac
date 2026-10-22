import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FootballNav } from '@/components/team/FootballNav';
import { StaffDirectory } from '@/components/team/StaffDirectory';
import { STAFF } from '@/lib/staff';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'football' });
  return { title: t('staff') };
}

// Slanted left edge, as on psg.fr (mirrored in Arabic)
const CLIP_LTR = 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)';
const CLIP_RTL = 'polygon(0 0, 90% 0, 100% 100%, 0 100%)';

export default async function StaffPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'football' });
  const lang = (locale === 'ar' || locale === 'fr' ? locale : 'en') as 'ar' | 'fr' | 'en';

  const head = STAFF.find((m) => m.head);
  const others = STAFF.filter((m) => !m.head);
  const name = (m: (typeof STAFF)[number]) => (lang === 'ar' && m.name_ar ? m.name_ar : m.name);

  return (
    <div>
      <FootballNav active="staff" />

      {head && (
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="order-2 lg:order-1">
            <p className="font-condensed text-sm font-bold uppercase tracking-[0.16em] text-wydad-red">{head.role[lang]}</p>
            <h1 className="mt-2 font-condensed text-5xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic sm:text-7xl">{name(head)}</h1>
            <p className="mt-6 max-w-xl text-xl leading-relaxed text-fg-secondary">{t('head_coach_text', { name: name(head) })}</p>
            {head.nationality && (
              <dl className="mt-6 flex gap-8 text-sm">
                <div>
                  <dt className="text-fg-muted">{t('nationality')}</dt>
                  <dd className="mt-0.5 font-semibold text-fg">{head.nationality[lang]}</dd>
                </div>
                <div>
                  <dt className="text-fg-muted">{t('season_label')}</dt>
                  <dd className="mt-0.5 font-semibold text-fg">{t('season')}</dd>
                </div>
              </dl>
            )}
          </div>

          <div className="order-1 lg:order-2">
            <div
              className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-wydad-burgundy via-[#7a1218] to-wydad-logo"
              style={{ clipPath: lang === 'ar' ? CLIP_RTL : CLIP_LTR }}
            >
              {head.photo ? (
                <Image src={head.photo} alt={name(head)} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-top" />
              ) : (
                // Portrait to come: crest card, never a stand-in photo
                <Image src="/images/wydad-crest-white.svg" alt="" width={200} height={254} className="absolute start-1/2 top-1/2 h-[62%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-90 rtl:translate-x-1/2" />
              )}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {others.length > 0 ? (
          <StaffDirectory members={others} lang={lang} />
        ) : (
          <p className="mx-auto max-w-2xl rounded-xl bg-surface-secondary/70 px-6 py-5 text-center text-fg-secondary">{t('staff_rest_pending')}</p>
        )}
      </section>
    </div>
  );
}
