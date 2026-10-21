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

  const categoryColors: Record<string, string> = {
    match_report: 'bg-wydad-red/10 text-wydad-red',
    transfer: 'bg-accent-blue/10 text-accent-blue',
    club: 'bg-accent-gold/10 text-accent-gold',
    interview: 'bg-accent-green/10 text-accent-green',
    youth: 'bg-surface-secondary text-fg-secondary',
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-fg sm:text-2xl">{t('latest')}</h2>
        <Link
          href="/news"
          className="group/link inline-flex items-center gap-1 text-sm font-medium text-wydad-red transition-colors hover:text-wydad-red-hover"
        >
          {t('view_all')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/link:translate-x-0.5 rtl:rotate-180 rtl:group-hover/link:-translate-x-0.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all hover:shadow-card-hover hover:border-border-hover"
          >
            {/* Image placeholder with gradient */}
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-surface-secondary to-surface-dark/10">
              <div className="flex h-full items-center justify-center">
                <svg className="h-10 w-10 text-fg-muted/15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
                </svg>
              </div>
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <div className="p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColors[article.category] || 'bg-surface-secondary text-fg-secondary'}`}>
                  {t(article.category)}
                </span>
                <span className="text-xs text-fg-muted">
                  {article.read_time_minutes} {t('min_read')}
                </span>
              </div>
              <h3 className="font-display text-base font-bold text-fg line-clamp-2 transition-colors group-hover:text-wydad-red sm:text-lg">
                {article.title[lang]}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted line-clamp-2">
                {article.excerpt[lang]}
              </p>

              {/* Read more hint */}
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-wydad-red opacity-0 transition-opacity group-hover:opacity-100">
                <span>{locale === 'ar' ? 'اقرأ المزيد' : locale === 'fr' ? 'Lire la suite' : 'Read more'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
