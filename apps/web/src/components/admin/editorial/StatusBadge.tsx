export type DisplayStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

/** Published with a future date reads as "scheduled" */
export function statusOf(status: string, publishedAt: string | null): DisplayStatus {
  if (status === 'published') return publishedAt && new Date(publishedAt) > new Date() ? 'scheduled' : 'published';
  return status === 'review' || status === 'archived' ? status : 'draft';
}

const STYLES: Record<DisplayStatus, { label: string; cls: string; dot: string }> = {
  draft: { label: 'Brouillon', cls: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  review: { label: 'À relire', cls: 'bg-amber-100 text-amber-900', dot: 'bg-amber-500' },
  scheduled: { label: 'Programmé', cls: 'bg-sky-100 text-sky-900', dot: 'bg-sky-500' },
  published: { label: 'Publié', cls: 'bg-emerald-100 text-emerald-900', dot: 'bg-emerald-500' },
  archived: { label: 'Archivé', cls: 'bg-slate-100 text-slate-500', dot: 'bg-slate-300' },
};

export function StatusBadge({ status }: { status: DisplayStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 font-body text-xs font-semibold not-italic normal-case ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}
