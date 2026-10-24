'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteMedia, replaceMedia, uploadMedia } from '@/app/admin/actions';
import { imageSize } from './ImageInput';

const BUCKETS = [
  { value: 'news', label: 'Actualités' },
  { value: 'people', label: 'Joueurs et staff' },
  { value: 'galleries', label: 'Galeries' },
  { value: 'site-assets', label: 'Site (logos, visuels)' },
];
const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/svg+xml';

export function UploadPanel() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [bucket, setBucket] = useState('news');
  const [pending, start] = useTransition();
  const [log, setLog] = useState<{ name: string; ok: boolean; text: string }[]>([]);

  const upload = (files: FileList) =>
    start(async () => {
      const results: typeof log = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.set('file', file);
        form.set('bucket', bucket);
        const size = await imageSize(file);
        if (size) {
          form.set('width', String(size.width));
          form.set('height', String(size.height));
        }
        const res = await uploadMedia(form);
        results.push({ name: file.name, ok: !res.error, text: res.error ?? 'Importé' });
      }
      setLog(results);
      router.refresh();
    });

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="bucket" className="mb-1.5 block text-sm font-semibold">
            Dossier
          </label>
          <select id="bucket" value={bucket} onChange={(e) => setBucket(e.target.value)} className="min-h-11 rounded-lg border border-border bg-white px-3">
            {BUCKETS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
        <button type="button" disabled={pending} onClick={() => input.current?.click()} className="min-h-11 rounded-lg bg-wydad-logo px-5 font-semibold text-white hover:bg-wydad-red-hover disabled:opacity-60">
          {pending ? 'Envoi en cours…' : 'Importer des images'}
        </button>
        <p className="text-sm text-fg-muted">JPEG, PNG, WebP, AVIF (SVG pour les logos). 8 Mo maximum par fichier.</p>
        <input
          ref={input}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) upload(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {log.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm" aria-live="polite">
          {log.map((l, i) => (
            <li key={i} className={l.ok ? 'text-emerald-700' : 'text-wydad-red'}>
              {l.name} : {l.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MediaCard({ media }: { media: { id: string; url: string; bucket: string; mime: string; size: number; width: number | null; height: number | null; created: string } }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string }>();
  const [copied, setCopied] = useState(false);

  const replace = (file: File) =>
    start(async () => {
      const form = new FormData();
      form.set('id', media.id);
      form.set('file', file);
      const size = await imageSize(file);
      if (size) {
        form.set('width', String(size.width));
        form.set('height', String(size.height));
      }
      const res = await replaceMedia(form);
      setMessage(res.error ? { ok: false, text: res.error } : { ok: true, text: 'Remplacé.' });
      router.refresh();
    });

  const remove = () => {
    if (!window.confirm('Supprimer définitivement ce fichier ?')) return;
    start(async () => {
      const res = await deleteMedia(media.id);
      setMessage({ ok: !!res.ok, text: res.message ?? '' });
      if (res.ok) router.refresh();
    });
  };

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="aspect-square bg-[repeating-conic-gradient(#f3f3f3_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media.url} alt="" loading="lazy" className="h-full w-full object-contain" />
      </div>
      <div className="space-y-2 p-3 text-xs">
        <p className="text-fg-muted">
          {BUCKETS.find((b) => b.value === media.bucket)?.label ?? media.bucket} · {media.width && media.height ? `${media.width}×${media.height} · ` : ''}
          {(media.size / 1024).toFixed(0)} Ko
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(media.url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="rounded-md border border-border px-2 py-1 font-semibold hover:border-wydad-logo"
          >
            {copied ? 'Copié' : 'Copier le lien'}
          </button>
          <button type="button" disabled={pending} onClick={() => input.current?.click()} className="rounded-md border border-border px-2 py-1 font-semibold hover:border-wydad-logo disabled:opacity-50">
            Remplacer
          </button>
          <button type="button" disabled={pending} onClick={remove} className="rounded-md px-2 py-1 font-semibold text-wydad-red hover:bg-wydad-red/10 disabled:opacity-50">
            Supprimer
          </button>
        </div>
        {message && (
          <p role={message.ok ? 'status' : 'alert'} className={message.ok ? 'text-emerald-700' : 'text-wydad-red'}>
            {message.text}
          </p>
        )}
        <input
          ref={input}
          type="file"
          accept={media.mime}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) replace(f);
            e.target.value = '';
          }}
        />
      </div>
    </li>
  );
}
