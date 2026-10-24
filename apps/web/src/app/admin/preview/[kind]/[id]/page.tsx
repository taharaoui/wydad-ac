import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { requireAdminPage } from '@/lib/admin/auth';
import { categoryMap, toArticle } from '@/lib/cms/news';
import { toCmsPage } from '@/lib/cms/club';
import { ArticleView } from '@/components/news/ArticleView';
import { PageView } from '@/components/cms/PageView';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Aperçu', robots: { index: false, follow: false } };

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
] as const;

/** Draft preview for administrators: the article or page as the site will show it, in any language */
export default async function Preview({ params, searchParams }: { params: { kind: string; id: string }; searchParams: { lang?: string } }) {
  const { supabase } = await requireAdminPage();
  const lang = LANGS.some((l) => l.code === searchParams.lang) ? (searchParams.lang as 'fr' | 'ar' | 'en') : 'fr';
  setRequestLocale(lang);

  let content: React.ReactNode;
  let status = '';
  let editHref = '';
  if (params.kind === 'news') {
    const { data: row } = await supabase.from('news_articles').select('*').eq('id', params.id).maybeSingle();
    if (!row) notFound();
    // The session client reads drafts too (admin RLS)
    const article = toArticle(row, await categoryMap(supabase as never, lang), lang);
    content = <ArticleView article={article} locale={lang} />;
    status = row.status;
    editHref = `/admin/news/${row.id}`;
  } else if (params.kind === 'page') {
    const { data: row } = await supabase.from('pages').select('*').eq('id', params.id).maybeSingle();
    if (!row) notFound();
    content = <PageView page={toCmsPage(row, lang)} />;
    status = row.status;
    editHref = `/admin/pages/${row.id}`;
  } else notFound();

  return (
    <div>
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 bg-wydad-charcoal px-4 py-2.5 text-sm text-white">
        <span className="font-semibold">
          Aperçu · {status === 'published' ? 'publié' : status === 'draft' ? 'brouillon (invisible pour le public)' : 'archivé'}
        </span>
        <span className="flex flex-wrap items-center gap-3">
          {LANGS.map((l) => (
            <Link key={l.code} href={`?lang=${l.code}`} aria-current={l.code === lang ? 'true' : undefined} className={l.code === lang ? 'font-bold underline' : 'text-white/75 hover:text-white'}>
              {l.label}
            </Link>
          ))}
          <Link href={editHref} className="rounded-md bg-white px-3 py-1 font-semibold text-wydad-charcoal">
            Modifier
          </Link>
        </span>
      </div>
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className="bg-surface">
        {content}
      </div>
    </div>
  );
}
