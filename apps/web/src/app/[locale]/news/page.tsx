import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getLatestNews } from '@/services/news';
import { Link } from '@/i18n/navigation';
import type { NewsArticle } from '@/types';

function ArticleCard({ article, locale }: { article: NewsArticle; locale: string }) {
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
    <Link
      href={`/news/${article.slug}`}
      className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-wydad-red/30 hover:shadow-md"
    >
      {/* Image placeholder */}
      <div className="aspect-video bg-gradient-to-br from-surface-secondary to-surface-dark/10">
        <div className="flex h-full items-center justify-center">
          <svg className="h-10 w-10 text-fg-muted/20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
          </svg>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColors[article.category] || ''}`}>
            {article.category.replace('_', ' ')}
          </span>
          <span className="text-xs text-fg-muted">
            {article.read_time_minutes} {locale === 'ar' ? 'د' : 'min'}
          </span>
        </div>

        <h3 className="mt-3 font-display text-base font-bold text-fg transition-colors group-hover:text-wydad-red sm:text-lg">
          {article.title[lang]}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-fg-muted">
          {article.excerpt[lang]}
        </p>

        <p className="mt-3 text-xs text-fg-muted">
          {new Date(article.published_at).toLocaleDateString(dateLocale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
    </Link>
  );
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'news' });

  const articles = await getLatestNews(20);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-display-lg font-bold text-fg">
        {t('latest')}
      </h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} locale={locale} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="mt-8 text-fg-muted">No articles yet.</p>
      )}
    </div>
  );
}
