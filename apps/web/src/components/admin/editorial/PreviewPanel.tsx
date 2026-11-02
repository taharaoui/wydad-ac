'use client';

import { useEffect, useRef, useState } from 'react';
import { DEVICES, type DeviceId, type Lang } from '@/lib/editorial/spec';
import { deviceOk, measureLayout, type DeviceResult } from '@/lib/editorial/responsive';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Waits for the page in the frame: images (made eager), web fonts, then a short settle */
async function settle(win: Window) {
  const doc = win.document;
  const imgs = Array.from(doc.querySelectorAll<HTMLImageElement>('[data-article] img'));
  imgs.forEach((img) => {
    if (img.loading === 'lazy') img.loading = 'eager';
  });
  const until = Date.now() + 10_000;
  while (Date.now() < until && imgs.some((img) => !img.complete)) await sleep(150);
  await (doc.fonts?.ready ?? Promise.resolve());
  await sleep(300);
}

/**
 * The article as the public will see it, on a computer, a tablet and a phone (real page in frames
 * at each width, Arabic right-to-left). Each frame is checked for horizontal scrolling, overflowing
 * text or images, distorted or broken images, small touch targets and reading direction.
 */
export function PreviewPanel({ previewId, hash, language, onResults }: { previewId: string; hash: string; language: Lang; onResults: (r: DeviceResult[]) => void }) {
  const [device, setDevice] = useState<DeviceId>('mobile');
  const [results, setResults] = useState<Partial<Record<DeviceId, DeviceResult>>>({});
  const [box, setBox] = useState(0);
  const holder = useRef<HTMLDivElement>(null);
  const frames = useRef<Partial<Record<DeviceId, HTMLIFrameElement | null>>>({});
  const src = `${language === 'ar' ? '' : `/${language}`}/news/preview/${previewId}`;

  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // New version: forget earlier results
  useEffect(() => setResults({}), [previewId]);

  const check = async (id: DeviceId) => {
    const frame = frames.current[id];
    const win = frame?.contentWindow;
    const dev = DEVICES.find((d) => d.id === id)!;
    let result: DeviceResult;
    try {
      if (!win) throw new Error('frame');
      await settle(win);
      const marker = win.document.querySelector<HTMLElement>('[data-preview-hash]')?.dataset.previewHash;
      const issues =
        marker === hash
          ? measureLayout({ rtl: language === 'ar', touch: id !== 'desktop' }, win)
          : [{ level: 'error' as const, code: 'version', message: 'L’aperçu ne correspond pas à la version en cours : relancez la vérification.' }];
      result = { device: id, width: dev.width, ok: deviceOk(issues), issues };
    } catch {
      result = { device: id, width: dev.width, ok: false, issues: [{ level: 'error', code: 'load', message: 'La page n’a pas pu être chargée (connexion ou session expirée).' }] };
    }
    setResults((prev) => {
      const next = { ...prev, [id]: result };
      if (DEVICES.every((d) => next[d.id])) onResults(DEVICES.map((d) => next[d.id]!));
      return next;
    });
  };

  const current = DEVICES.find((d) => d.id === device)!;

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Appareil" className="grid grid-cols-3 gap-2">
        {DEVICES.map((d) => {
          const r = results[d.id];
          return (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={device === d.id}
              onClick={() => setDevice(d.id)}
              className={`rounded-xl border-2 px-3 py-2 text-start transition-colors ${device === d.id ? 'border-wydad-logo bg-wydad-logo/5' : 'border-border bg-white hover:border-fg-muted'}`}
            >
              <span className="block font-semibold text-fg">
                {d.label} <span className="text-xs font-normal text-fg-muted">{d.width} px</span>
              </span>
              <span className={`mt-0.5 block text-sm font-semibold ${!r ? 'text-fg-muted' : r.ok ? 'text-emerald-700' : 'text-wydad-red'}`}>
                {!r ? 'Vérification…' : r.ok ? (r.issues.length ? `Validé · ${r.issues.length} conseil(s)` : 'Validé') : `À corriger (${r.issues.filter((i) => i.level === 'error').length})`}
              </span>
            </button>
          );
        })}
      </div>

      {results[device] && results[device]!.issues.length > 0 && (
        <ul className="space-y-1.5 rounded-xl border border-border bg-white p-3 text-sm">
          {results[device]!.issues.map((i, n) => (
            <li key={n} className={`flex gap-2 ${i.level === 'error' ? 'text-wydad-red' : 'text-amber-700'}`}>
              <span aria-hidden>{i.level === 'error' ? '✕' : '!'}</span>
              <span>{i.message}</span>
            </li>
          ))}
        </ul>
      )}

      <div ref={holder} className="relative overflow-hidden rounded-xl border border-border bg-surface-secondary">
        {DEVICES.map((d) => {
          const scale = box ? Math.min(1, box / d.width) : 0.3;
          const visible = d.id === device;
          return (
            <div
              key={d.id}
              className={visible ? 'relative mx-auto' : 'pointer-events-none invisible absolute start-0 top-0'}
              style={{ width: d.width * scale, height: Math.min(d.height, 900) * scale }}
              aria-hidden={!visible}
            >
              <iframe
                ref={(el) => {
                  frames.current[d.id] = el;
                }}
                key={`${d.id}-${previewId}`}
                src={src}
                title={`Aperçu ${d.label}`}
                onLoad={() => check(d.id)}
                className="origin-top-left border-0 bg-white"
                style={{ width: d.width, height: Math.min(d.height, 900), transform: `scale(${scale})` }}
              />
            </div>
          );
        })}
      </div>
      <p className="text-xs text-fg-muted">
        Aperçu réel de la page publique ({current.label.toLowerCase()}, {current.width} px de large). Faites défiler dans le cadre pour relire tout l’article.{' '}
        <a href={src} target="_blank" rel="noopener" className="font-semibold text-wydad-logo underline">
          Ouvrir dans un nouvel onglet
        </a>
      </p>
    </div>
  );
}
