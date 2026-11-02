import { notFound } from 'next/navigation';
import { requireStaffPage } from '@/lib/admin/auth';
import { editorCategories, rowToDraft } from '@/lib/editorial/data';
import { ArticleEditor } from '@/components/admin/editorial/ArticleEditor';

export const metadata = { title: 'Modifier l’article' };

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const { supabase, member } = await requireStaffPage();
  if (!/^[0-9a-f-]{36}$/.test(params.id)) notFound();
  const { data: row } = await supabase.from('news_articles').select('*').eq('id', params.id).maybeSingle();
  if (!row) notFound();
  const categories = await editorCategories(supabase, row.category_id);
  const own = row.created_by === member.userId;
  // Same rule as the database: editors change their own articles, and only drafts unless allowed to publish
  const readOnly = member.role !== 'admin' && (!own || (row.status === 'published' && !member.canPublish));
  return (
    <ArticleEditor
      key={row.id}
      initial={rowToDraft(row)}
      status={row.status}
      updatedAt={row.updated_at}
      categories={categories}
      canPublish={member.canPublish && !readOnly}
      readOnly={readOnly}
    />
  );
}
