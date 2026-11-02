'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { deleteArticle, duplicateArticle } from '@/lib/editorial/actions';
import { useToast } from '../Toast';

/** Edit, view, duplicate and delete buttons of a row of the article table */
export function ArticleRowActions({ id, title, publicUrl, canEdit, canDelete }: { id: string; title: string; publicUrl?: string; canEdit: boolean; canDelete: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const btn = 'inline-flex min-h-9 items-center rounded-md px-2.5 text-sm font-semibold disabled:opacity-50';

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Link href={`/admin/articles/${id}`} className={`${btn} border border-border text-fg hover:border-wydad-logo`}>
        {canEdit ? 'Modifier' : 'Ouvrir'}
      </Link>
      {publicUrl && (
        <a href={publicUrl} target="_blank" rel="noopener" className={`${btn} text-fg-secondary hover:text-wydad-logo`}>
          Voir
        </a>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await duplicateArticle(id);
            toast(res.message, res.ok ? 'success' : 'error');
            if (res.id) router.push(`/admin/articles/${res.id}`);
          })
        }
        className={`${btn} text-fg-secondary hover:text-wydad-logo`}
      >
        Dupliquer
      </button>
      {canDelete && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`Supprimer définitivement « ${title} » ? Cette action est irréversible.`)) return;
            start(async () => {
              const res = await deleteArticle(id);
              toast(res.message, res.ok ? 'success' : 'error');
              router.refresh();
            });
          }}
          className={`${btn} text-wydad-red hover:bg-wydad-red/10`}
        >
          Supprimer
        </button>
      )}
    </div>
  );
}
