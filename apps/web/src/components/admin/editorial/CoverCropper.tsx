'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { listMedia, uploadMedia } from '@/app/admin/actions';
import { MAX_IMAGE_BYTES } from '@/lib/editorial/spec';

export interface CropTarget {
  width: number;
  height: number;
  label: string;
}

export interface CropResult {
  url: string;
  /** Source pixels inside the frame: below the target size, the image had to be enlarged */
  sourceWidth: number;
  sourceHeight: number;
}

interface Source {
  url: string;
  img: HTMLImageElement;
  name: string;
  type: string;
  bytes: number | null;
}

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(n < 1024 * 1024 ? 2 : 1)} Mo`;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image illisible'));
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Picks a photo and frames it to the newsroom format: the frame shows exactly what will be
 * published, the journalist drags the photo to place the subject and zooms if needed. The export is
 * a WebP (JPEG on browsers that can't write WebP) under 2 MB. A photo smaller than the target is
 * never stretched: it is exported at its real size and flagged.
 */
export function CoverCropper({ target, onDone, onCancel, initialFile }: { target: CropTarget; onDone: (r: CropResult) => void; onCancel: () => void; initialFile?: File }) {
  const [src, setSrc] = useState<Source | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [frameW, setFrameW] = useState(0);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [library, setLibrary] = useState<Awaited<ReturnType<typeof listMedia>> | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const ratio = target.width / target.height;
  const frameH = frameW / ratio;

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFrameW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [src]);

  const open = useCallback(async (url: string, meta: { name: string; type: string; bytes: number | null }) => {
    setError(undefined);
    try {
      const img = await loadImage(url);
      setSrc({ url, img, ...meta });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    } catch {
      setError('Impossible de lire cette image. Essayez un fichier JPEG, PNG ou WebP.');
    }
  }, []);

  const openFile = useCallback(
    (f: File) => {
      if (!/^image\/(jpeg|png|webp|avif)$/.test(f.type)) return setError('Format non pris en charge : JPEG, PNG, WebP ou AVIF.');
      if (f.size > 25 * 1024 * 1024) return setError('Fichier trop lourd pour être traité (25 Mo maximum avant recadrage).');
      open(URL.createObjectURL(f), { name: f.name, type: f.type, bytes: f.size });
    },
    [open],
  );

  useEffect(() => {
    if (initialFile) openFile(initialFile);
  }, [initialFile, openFile]);

  // Scale at which the photo just covers the frame; zoom multiplies it
  const nat = src ? { w: src.img.naturalWidth, h: src.img.naturalHeight } : { w: 1, h: 1 };
  const base = frameW ? Math.max(frameW / nat.w, frameH / nat.h) : 1;
  const scale = base * zoom;
  const dispW = nat.w * scale;
  const dispH = nat.h * scale;
  const clamp = (o: { x: number; y: number }) => ({
    x: Math.min(0, Math.max(frameW - dispW, o.x)),
    y: Math.min(0, Math.max(frameH - dispH, o.y)),
  });
  // Centre the photo when it's opened or the frame resizes
  useEffect(() => {
    if (src && frameW) setOffset(clamp({ x: (frameW - dispW) / 2, y: (frameH - dispH) / 2 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, frameW]);
  const pos = clamp(offset);

  // Source pixels inside the frame
  const crop = { x: -pos.x / scale, y: -pos.y / scale, w: frameW / scale, h: frameH / scale };
  const tooSmall = src && (crop.w < target.width - 1 || crop.h < target.height - 1);
  const sourceTooSmall = src && (nat.w < target.width || nat.h < target.height);

  const setZoomAround = (z: number) => {
    const next = Math.min(4, Math.max(1, z));
    // Keep the centre of the frame in place
    const cx = (frameW / 2 - pos.x) / scale;
    const cy = (frameH / 2 - pos.y) / scale;
    const s = base * next;
    setZoom(next);
    setOffset({ x: frameW / 2 - cx * s, y: frameH / 2 - cy * s });
  };

  const exportAndUpload = async () => {
    if (!src) return;
    setBusy(true);
    setError(undefined);
    try {
      // Never enlarge: export at the target size, or at the real size of the framed area if smaller
      const outW = Math.round(Math.min(target.width, crop.w));
      const outH = Math.round(outW / ratio);
      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(src.img, crop.x, crop.y, crop.w, crop.h, 0, 0, outW, outH);
      let blob: Blob | null = null;
      for (const q of [0.88, 0.8, 0.7, 0.6]) {
        blob = await toBlob(canvas, 'image/webp', q);
        if (blob && blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', q);
        if (blob && blob.size <= MAX_IMAGE_BYTES) break;
      }
      if (!blob || blob.size > MAX_IMAGE_BYTES) throw new Error('Image trop lourde même compressée : choisissez une autre photo.');
      const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
      const form = new FormData();
      form.set('file', new File([blob], `${src.name.replace(/\.[^.]+$/, '') || 'image'}-${outW}x${outH}.${ext}`, { type: blob.type }));
      form.set('bucket', 'news');
      form.set('purpose', 'cover');
      form.set('width', String(outW));
      form.set('height', String(outH));
      const res = await uploadMedia(form);
      if (res.error || !res.url) throw new Error(res.error ?? 'Envoi impossible.');
      onDone({ url: res.url, sourceWidth: Math.round(crop.w), sourceHeight: Math.round(crop.h) });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Envoi impossible.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-white p-4">
      {!src ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) openFile(f);
          }}
          className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border px-4 py-10 text-center"
        >
          <p className="font-semibold text-fg">Glissez une photo ici</p>
          <p className="text-sm text-fg-muted">ou</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => fileInput.current?.click()} className="min-h-11 rounded-lg bg-wydad-logo px-4 font-semibold text-white hover:bg-wydad-red-hover">
              Choisir sur l’ordinateur
            </button>
            <button type="button" onClick={async () => setLibrary(await listMedia('news'))} className="min-h-11 rounded-lg border border-border px-4 font-semibold text-fg hover:border-wydad-logo">
              Médiathèque
            </button>
            <button type="button" onClick={onCancel} className="min-h-11 rounded-lg px-4 font-semibold text-fg-muted hover:text-fg">
              Annuler
            </button>
          </div>
          <p className="max-w-md text-xs text-fg-muted">
            Format final : {target.label}. Prenez une photo d’au moins {target.width} × {target.height} px : vous la recadrerez à l’étape suivante.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) openFile(f);
              e.target.value = '';
            }}
          />
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-fg-muted">Photo d’origine</dt>
              <dd className={`font-semibold ${sourceTooSmall ? 'text-wydad-red' : 'text-fg'}`}>
                {nat.w} × {nat.h} px
              </dd>
            </div>
            <div>
              <dt className="text-fg-muted">Format</dt>
              <dd className="font-semibold text-fg">{src.type.replace('image/', '').toUpperCase() || '—'}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Poids</dt>
              <dd className="font-semibold text-fg">{src.bytes ? mb(src.bytes) : '—'}</dd>
            </div>
            <div>
              <dt className="text-fg-muted">Zone gardée</dt>
              <dd className={`font-semibold ${tooSmall ? 'text-wydad-red' : 'text-emerald-700'}`}>
                {Math.round(crop.w)} × {Math.round(crop.h)} px
              </dd>
            </div>
          </dl>

          <div
            ref={frame}
            className="relative w-full cursor-grab touch-none select-none overflow-hidden rounded-lg bg-black active:cursor-grabbing"
            style={{ aspectRatio: `${target.width} / ${target.height}` }}
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY, ox: pos.x, oy: pos.y };
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              setOffset({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y });
            }}
            onPointerUp={() => (drag.current = null)}
            onWheel={(e) => setZoomAround(zoom - e.deltaY / 600)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src.url} alt="" draggable={false} className="pointer-events-none absolute max-w-none" style={{ left: pos.x, top: pos.y, width: dispW, height: dispH }} />
            {/* Rule of thirds, to place the subject */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3" aria-hidden>
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className="border border-white/25" />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="crop-zoom" className="text-sm font-semibold text-fg">
              Zoom
            </label>
            <input id="crop-zoom" type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoomAround(Number(e.target.value))} className="min-w-40 flex-1 accent-wydad-logo" />
            <span className="w-12 text-sm tabular-nums text-fg-muted">{Math.round(zoom * 100)} %</span>
          </div>
          <p className="text-sm text-fg-secondary">Glissez la photo pour placer le sujet (visage, action) au centre du cadre : le site recadre au centre sur les petites vignettes.</p>

          {tooSmall && (
            <p role="alert" className="rounded-lg bg-wydad-red/10 px-3 py-2 text-sm font-medium text-wydad-red">
              {sourceTooSmall
                ? `Photo trop petite : ${nat.w} × ${nat.h} px pour ${target.width} × ${target.height} px demandés. Elle ne sera pas agrandie (elle deviendrait floue) et l’article ne pourra pas être publié avec. Choisissez une photo plus grande.`
                : `Zoom trop fort : la zone gardée (${Math.round(crop.w)} px de large) est plus petite que ${target.width} px. Dézoomez pour garder une image nette.`}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportAndUpload} disabled={busy} className="min-h-11 rounded-lg bg-wydad-logo px-4 font-semibold text-white hover:bg-wydad-red-hover disabled:opacity-60">
              {busy ? 'Envoi…' : 'Valider ce cadrage'}
            </button>
            <button type="button" onClick={() => setSrc(null)} disabled={busy} className="min-h-11 rounded-lg border border-border px-4 font-semibold text-fg hover:border-wydad-logo">
              Autre photo
            </button>
            <button type="button" onClick={onCancel} disabled={busy} className="min-h-11 rounded-lg px-4 font-semibold text-fg-muted hover:text-fg">
              Annuler
            </button>
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-wydad-red">
          {error}
        </p>
      )}

      {library && !src && (
        <div className="rounded-lg border border-border bg-surface-secondary/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-fg">Images des articles</p>
            <button type="button" onClick={() => setLibrary(null)} className="text-sm text-fg-muted hover:text-fg">
              Fermer
            </button>
          </div>
          {library.length === 0 ? (
            <p className="text-sm text-fg-muted">Aucune image pour l’instant.</p>
          ) : (
            <ul className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5">
              {library.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => open(m.url, { name: m.url.split('/').pop() ?? 'image', type: m.url.endsWith('.webp') ? 'image/webp' : 'image/jpeg', bytes: null })}
                    className="block w-full overflow-hidden rounded-md border-2 border-transparent text-start hover:border-wydad-logo"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt="" className="aspect-video w-full object-cover" />
                    {m.width && m.height && <span className="block px-1 py-0.5 text-[11px] text-fg-muted">{m.width} × {m.height}</span>}
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
