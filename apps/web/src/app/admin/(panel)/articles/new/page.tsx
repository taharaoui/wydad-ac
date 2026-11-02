import { requireStaffPage } from '@/lib/admin/auth';
import { editorCategories } from '@/lib/editorial/data';
import { ArticleEditor } from '@/components/admin/editorial/ArticleEditor';
import type { ArticleDraft } from '@/lib/editorial/checks';

export const metadata = { title: 'Nouvel article' };

export default async function NewArticlePage() {
  const { supabase, member } = await requireStaffPage();
  const categories = await editorCategories(supabase);
  const initial: ArticleDraft = {
    language: '',
    categoryId: '',
    title: '',
    slug: '',
    excerpt: '',
    bodyHtml: '',
    coverUrl: '',
    coverAlt: '',
    coverWidth: null,
    coverHeight: null,
    coverMobileUrl: '',
    author: member.displayName.includes('@') ? '' : member.displayName,
    publishedAt: '',
    featured: false,
    seoTitle: '',
    seoDescription: '',
    matchId: '',
  };
  return <ArticleEditor initial={initial} status={null} updatedAt={null} categories={categories} canPublish={member.canPublish} />;
}
