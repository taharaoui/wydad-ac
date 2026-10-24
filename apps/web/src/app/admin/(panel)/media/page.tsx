import Link from 'next/link';
import { requireAdminPage } from '@/lib/admin/auth';
import { MediaCard, UploadPanel } from '@/components/admin/MediaLibrary';

export const metadata = { title: 'Médiathèque' };
const PER_PAGE = 48;

export default async function MediaPage({ searchParams }: { searchParams: { bucket?: string; page?: string } }) {
  const { supabase } = await requireAdminPage();
  const page = Math.max(1, Number(searchParams.page) || 1);
  let query = supabase.from('media').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (searchParams.bucket) query = query.eq('bucket', searchParams.bucket);
  const { data, count, error } = await query.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  const pages = Math.max(1, Math.ceil((count ?? 0) / PER_PAGE));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-condensed text-4xl font-extrabold uppercase italic">Médiathèque</h1>
        <p className="mt-1 max-w-2xl text-fg-secondary">
          Images stockées dans Supabase Storage. Un fichier encore utilisé par un contenu ne peut pas être supprimé ; « Remplacer » met à jour l’image partout où elle apparaît.
        </p>
      </header>
      <UploadPanel />
      {error && <p className="text-sm text-wydad-red">Chargement impossible : {error.message}</p>}
      {(data ?? []).length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center text-fg-secondary">Aucun média pour l’instant.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(data ?? []).map((m) => (
            <MediaCard key={m.id} media={{ id: m.id, url: m.public_url, bucket: m.bucket, mime: m.mime_type, size: m.size_bytes, width: m.width, height: m.height, created: m.created_at }} />
          ))}
        </ul>
      )}
      {pages > 1 && (
        <nav aria-label="Pagination" className="flex gap-2 text-sm">
          {page > 1 && <Link href={`/admin/media?page=${page - 1}`} className="rounded-lg border border-border bg-white px-3 py-2 font-semibold">Précédente</Link>}
          {page < pages && <Link href={`/admin/media?page=${page + 1}`} className="rounded-lg border border-border bg-white px-3 py-2 font-semibold">Suivante</Link>}
        </nav>
      )}
    </div>
  );
}
