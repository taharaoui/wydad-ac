import type { InstagramPost } from '@/lib/instagram';

/** Post type badge (video / carousel) shown on Instagram thumbnails */
export function KindIcon({ kind }: { kind: InstagramPost['kind'] }) {
  if (kind === 'image') return null;
  return (
    <span className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-md bg-white text-black shadow" aria-hidden>
      {kind === 'video' ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 4.5v15l12-7.5z" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
          <rect x="3" y="7" width="13" height="13" rx="2" />
          <path d="M8 3h11a2 2 0 0 1 2 2v11" />
        </svg>
      )}
    </span>
  );
}

/** Instagram glyph (rounded square camera) */
export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function VerifiedBadge() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <path fill="#0095F6" d="M12 1.5l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3 1 3-2.6 1.9-1 3-3.2-.1L12 22.5l-2.6-1.9-3.2.1-1-3-2.6-1.9 1-3-1-3 2.6-1.9 1-3 3.2.1z" />
      <path fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M8 12.3l2.6 2.5L16 9.4" />
    </svg>
  );
}
