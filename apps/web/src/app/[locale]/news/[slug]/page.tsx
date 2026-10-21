import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getNewsBySlug, getLatestNews } from '@/services/news';
import { Link } from '@/i18n/navigation';

export async function generateStaticParams() {
  const articles = await getLatestNews(50);
  const locales = ['ar', 'fr', 'en'];
  return locales.flatMap(locale =>
    articles.map(article => ({
      locale,
      slug: article.slug,
    }))
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'news' });

  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const lang = (locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr' : 'en') as keyof typeof article.title;
  const dateLocale = locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-GB';

  const categoryColors: Record<string, string> = {
    match_report: 'bg-wydad-red-soft text-wydad-red',
    transfer: 'bg-accent-blue-bg text-accent-blue',
    club: 'bg-accent-gold-bg text-accent-gold',
    interview: 'bg-accent-green-bg text-accent-green',
    youth: 'bg-surface-secondary text-fg-secondary',
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/news"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <svg className="h-4 w-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {t('view_all')}
      </Link>

      {/* Category + date */}
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[article.category] || ''}`}>
          {t(article.category)}
        </span>
        <span className="text-sm text-fg-muted">
          {new Date(article.published_at).toLocaleDateString(dateLocale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>

      {/* Title */}
      <h1 className="mt-4 font-display text-display-lg font-bold leading-tight text-fg sm:text-display-xl">
        {article.title[lang]}
      </h1>

      {/* Meta */}
      <div className="mt-4 flex items-center gap-4 text-sm text-fg-muted">
        <span>{article.author}</span>
        <span>·</span>
        <span>{article.read_time_minutes} {t('min_read')}</span>
      </div>

      {/* Hero image placeholder */}
      <div className="mt-6 aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-surface-secondary to-surface-dark/10">
        <div className="flex h-full items-center justify-center">
          <svg className="h-16 w-16 text-fg-muted/20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
          </svg>
        </div>
      </div>

      {/* Body */}
      <div className="prose-wydad mt-8">
        <p className="text-body-lg leading-relaxed text-fg-secondary">
          {article.excerpt[lang]}
        </p>
        <div className="mt-6 space-y-4 text-body-md leading-relaxed text-fg-secondary">
          <p>{article.body[lang]}</p>
        </div>
      </div>
    </article>
  );
}
