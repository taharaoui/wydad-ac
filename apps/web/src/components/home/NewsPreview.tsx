import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { NewsArticle } from '@/types';

interface NewsPreviewProps {
  articles: NewsArticle[];
  locale: string;
}

export function NewsPreview({ articles, locale }: NewsPreviewProps) {
  const t = useTranslations('news');
  const lang = locale as 'ar' | 'fr' | 'en';

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-fg sm:text-2xl">{t('latest')}</h2>
        <Link
          href="/news"
          className="text-sm font-medium text-wydad-red hover:text-wydad-red-hover transition-colors"
        >
          {t('view_all')}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-md"
          >
            {/* Placeholder image area */}
            <div className="aspect-video bg-gradient-to-br from-surface-secondary to-border" />

            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-wydad-red-soft px-2 py-0.5 text-xs font-medium text-wydad-red">
                  {t(article.category)}
                </span>
                <span className="text-xs text-fg-muted">
                  {article.read_time_minutes} {t('min_read')}
                </span>
              </div>
              <h3 className="font-display text-base font-semibold text-fg line-clamp-2 group-hover:text-wydad-red transition-colors">
                {article.title[lang]}
              </h3>
              <p className="mt-1.5 text-sm text-fg-muted line-clamp-2">
                {article.excerpt[lang]}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
