'use client';

import { useRef, useState, useTransition } from 'react';
import { listMedia, uploadMedia } from '@/app/admin/actions';
import type { Bucket } from '@/lib/admin/types';

/** Natural size of an image file, measured in the browser before upload */
export function imageSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/svg+xml';

/** Image field: preview, upload to Supabase Storage, pick from the library, or paste a path */
export function ImageInput({ id, name, bucket, value, onChange }: { id: string; name?: string; bucket: Bucket; value: string; onChange: (v: string | null) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const [library, setLibrary] = useState<{ id: string; url: string }[] | null>(null);

  const upload = (f: File) =>
    start(async () => {
      setError(undefined);
      if (f.size > 8 * 1024 * 1024) return setError('Fichier trop lourd (8 Mo maximum).');
      const form = new FormData();
      form.set('file', f);
      form.set('bucket', bucket);
      const size = await imageSize(f);
      if (size) {
        form.set('width', String(size.width));
        form.set('height', String(size.height));
      }
      const res = await uploadMedia(form);
      if (res.error) setError(res.error);
      else if (res.url) onChange(res.url);
    });

  const openLibrary = () =>
    start(async () => {
      setLibrary(await listMedia());
    });

  return (
    <div className="space-y-2">
      {name && <input type="hidden" name={name} value={value} />}
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-secondary">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-fg-muted">Aucune image</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => file.current?.click()} disabled={pending} className="rounded-lg bg-wydad-logo px-3 py-2 text-sm font-semibold text-white hover:bg-wydad-red-hover disabled:opacity-50">
              {pending ? 'Envoi…' : 'Importer'}
            </button>
            <button type="button" onClick={openLibrary} disabled={pending} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-fg hover:border-wydad-logo disabled:opacity-50">
              Médiathèque
            </button>
            {value && (
              <button type="button" onClick={() => onChange(null)} className="rounded-lg px-3 py-2 text-sm font-semibold text-fg-muted hover:text-wydad-red">
                Retirer
              </button>
            )}
          </div>
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value || null)}
            placeholder="ou une adresse : /images/… ou https://…"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 font-mono text-xs text-fg outline-none focus:border-wydad-logo"
            spellCheck={false}
          />
          <input
            ref={file}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-wydad-red">
          {error}
        </p>
      )}
      {library && (
        <div className="rounded-lg border border-border bg-surface-secondary/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-fg">Choisir dans la médiathèque</p>
            <button type="button" onClick={() => setLibrary(null)} className="text-sm text-fg-muted hover:text-fg">
              Fermer
            </button>
          </div>
          {library.length === 0 ? (
            <p className="text-sm text-fg-muted">La médiathèque est vide : importez une image.</p>
          ) : (
            <ul className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
              {library.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(m.url);
                      setLibrary(null);
                    }}
                    className="block aspect-square w-full overflow-hidden rounded-md border-2 border-transparent hover:border-wydad-logo"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
