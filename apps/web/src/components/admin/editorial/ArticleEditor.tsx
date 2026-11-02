'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { checkArticle, stats, type ArticleDraft, type Check, type Field } from '@/lib/editorial/checks';
import { CHECKLIST, COVER, COVER_MOBILE, LANGUAGES, LIMITS, MAX_IMAGE_BYTES, dirOf, slugify, type Lang } from '@/lib/editorial/spec';
import { createPreview, deleteArticle, recordPreviewReport, saveArticle, unpublishArticle, type Intent } from '@/lib/editorial/actions';
import type { DeviceResult } from '@/lib/editorial/responsive';
import { RichTextEditor } from './RichTextEditor';
import { CoverCropper } from './CoverCropper';
import { PreviewPanel } from './PreviewPanel';
import { StatusBadge, statusOf } from './StatusBadge';
import { useToast } from '../Toast';

export interface CategoryOption {
  id: string;
  name: string;
  group: string;
  description: string;
}

interface Props {
  initial: ArticleDraft;
  status: string | null;
  updatedAt: string | null;
  categories: CategoryOption[];
  canPublish: boolean;
  /** An editor opening an article that is online without publishing rights: read only */
  readOnly?: boolean;
}

const inputCls =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-[15px] text-fg outline-none transition-colors placeholder:text-fg-muted/70 focus:border-wydad-logo focus:ring-2 focus:ring-wydad-logo/15';
const AUTOSAVE_MS = 20_000;

function Counter({ value, max, recommended }: { value: string; max: number; recommended?: number }) {
  const n = [...value].length;
  const tone = n > max ? 'text-wydad-red' : recommended && n > recommended ? 'text-amber-700' : 'text-fg-muted';
  return (
    <span className={`text-xs tabular-nums ${tone}`}>
      {n}/{recommended ?? max}
    </span>
  );
}

function Section({ step, title, hint, children }: { step: number; title: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-wydad-logo font-condensed text-lg font-extrabold text-white" aria-hidden>
          {step}
        </span>
        <div>
          <h2 className="font-condensed text-2xl font-extrabold uppercase leading-tight text-fg">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-fg-secondary">{hint}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Label({ htmlFor, children, required, help }: { htmlFor: string; children: React.ReactNode; required?: boolean; help?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-fg">
      {children}
      {required && <span className="text-xs font-semibold text-wydad-red">obligatoire</span>}
      {help && (
        <span className="group relative inline-flex">
          <span tabIndex={0} aria-label={help} className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-fg-muted/20 text-[10px] font-bold text-fg-secondary">
            ?
          </span>
          <span role="tooltip" className="pointer-events-none absolute bottom-full start-0 z-20 mb-2 hidden w-64 rounded-lg bg-wydad-charcoal px-3 py-2 text-xs font-normal leading-snug text-white shadow-lg group-focus-within:block group-hover:block">
            {help}
          </span>
        </span>
      )}
    </label>
  );
}

function Messages({ checks, field }: { checks: Check[]; field: Field | Field[] }) {
  const fields = Array.isArray(field) ? field : [field];
  const list = checks.filter((c) => fields.includes(c.field));
  if (!list.length) return null;
  return (
    <ul className="mt-1.5 space-y-1">
      {list.map((c) => (
        <li key={c.id} className={`text-sm ${c.level === 'error' ? 'text-wydad-red' : 'text-amber-700'}`}>
          {c.message}
        </li>
      ))}
    </ul>
  );
}

const toLocalInput = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function ArticleEditor({ initial, status: initialStatus, updatedAt: initialUpdated, categories, canPublish, readOnly }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [d, setD] = useState<ArticleDraft>(initial);
  const [status, setStatus] = useState(initialStatus);
  const [savedAt, setSavedAt] = useState(initialUpdated);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState<Intent | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!initial.slug && initial.slug !== slugify(initial.title));
  const [cropping, setCropping] = useState<'cover' | 'mobile' | null>(null);
  const [ticks, setTicks] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<{ id: string; hash: string; snapshot: string; results?: DeviceResult[]; ok?: boolean } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [backup, setBackup] = useState<{ d: ArticleDraft; at: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [advanced, setAdvanced] = useState(!!(initial.seoTitle || initial.seoDescription || initial.matchId));
  const lastSaved = useRef(JSON.stringify(initial));

  const lang = (d.language || 'fr') as Lang;
  const dir = dirOf(lang);
  const published = status === 'published';
  const checks = useMemo(() => checkArticle(d), [d]);
  const errors = checks.filter((c) => c.level === 'error');
  const s = useMemo(() => stats(d.bodyHtml), [d.bodyHtml]);
  const category = categories.find((c) => c.id === d.categoryId);
  const snapshot = JSON.stringify(d);
  const previewValid = !!preview?.ok && preview.snapshot === snapshot;
  const allTicked = CHECKLIST.every((c) => ticks.has(c.id));
  const storageKey = `wac-article-${d.id ?? 'new'}`;
  const future = !!d.publishedAt && new Date(d.publishedAt) > new Date();

  const update = useCallback((patch: Partial<ArticleDraft>) => {
    setD((prev) => {
      const next = { ...prev, ...patch };
      if ('title' in patch && !slugTouched) next.slug = slugify(next.title) || prev.slug || '';
      return next;
    });
    setDirty(true);
  }, [slugTouched]);

  // Local backup of every change (survives a closed tab or a lost connection)
  useEffect(() => {
    if (!dirty || readOnly) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ d, at: new Date().toISOString() }));
      } catch {}
    }, 800);
    return () => clearTimeout(t);
  }, [d, dirty, storageKey, readOnly]);

  // Offer a backup newer than the saved version
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const b = JSON.parse(raw) as { d: ArticleDraft; at: string };
      if (JSON.stringify(b.d) !== lastSaved.current && (!initialUpdated || b.at > initialUpdated)) setBackup(b);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Leaving with unsaved changes
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = useCallback(
    async (intent: Intent) => {
      if (readOnly) return;
      setSaving(intent);
      const res = await saveArticle(d, intent, { checklist: [...ticks], previewId: preview?.id });
      setSaving(null);
      if (res.skipped) return;
      if (!res.ok) {
        if (intent !== 'autosave') toast(res.message ?? 'Enregistrement impossible.', 'error');
        return;
      }
      lastSaved.current = JSON.stringify(d);
      setDirty(false);
      setStatus(res.status ?? status);
      setSavedAt(res.updatedAt ?? new Date().toISOString());
      try {
        localStorage.removeItem(storageKey);
        if (!d.id) localStorage.removeItem('wac-article-new');
      } catch {}
      if (intent !== 'autosave') toast(res.message ?? 'Enregistré.', 'success');
      if (!d.id && res.id) {
        setD((prev) => ({ ...prev, id: res.id }));
        window.history.replaceState(null, '', `/admin/articles/${res.id}`);
      }
      if (intent === 'publish' || intent === 'review') router.refresh();
    },
    [d, ticks, preview, readOnly, toast, status, storageKey, router],
  );

  // Autosave of drafts (never of an article that is online: changes go live only on purpose)
  useEffect(() => {
    if (!dirty || published || readOnly || saving) return;
    const t = setTimeout(() => save('autosave'), AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [dirty, published, readOnly, saving, save, d]);

  const startPreview = async () => {
    const res = await createPreview(d);
    if (!res.id || !res.hash) return toast(res.message ?? 'Aperçu impossible.', 'error');
    setPreview({ id: res.id, hash: res.hash, snapshot });
    setPreviewOpen(true);
  };

  const onResults = async (results: DeviceResult[]) => {
    if (!preview) return;
    const res = await recordPreviewReport(preview.id, results);
    setPreview((p) => (p && p.id === preview.id ? { ...p, results, ok: res.ok } : p));
  };

  const remove = async () => {
    if (!d.id) return;
    if (!window.confirm('Supprimer définitivement cet article ? Cette action est irréversible.')) return;
    const res = await deleteArticle(d.id);
    toast(res.message, res.ok ? 'success' : 'error');
    if (res.ok) {
      setDirty(false);
      router.push('/admin/articles');
    }
  };

  const unpublish = async () => {
    if (!d.id || !window.confirm('Retirer cet article du site ? Il redeviendra un brouillon.')) return;
    const res = await unpublishArticle(d.id);
    toast(res.message ?? '', res.ok ? 'success' : 'error');
    if (res.ok) {
      setStatus(res.status ?? 'draft');
      router.refresh();
    }
  };

  const groups = [...new Set(categories.map((c) => c.group))];
  const displayStatus = statusOf(status ?? 'draft', d.publishedAt || null);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/articles" className="text-sm font-semibold text-fg-muted hover:text-wydad-logo">
            ← Tous les articles
          </Link>
          <h1 className="mt-1 flex flex-wrap items-center gap-3 font-condensed text-4xl font-extrabold uppercase italic text-fg">
            {d.id ? 'Modifier l’article' : 'Nouvel article'}
            {status && <StatusBadge status={displayStatus} />}
          </h1>
          <p className="mt-1 text-sm text-fg-muted" aria-live="polite">
            {saving === 'autosave' ? 'Enregistrement automatique…' : dirty ? 'Modifications non enregistrées' : savedAt ? `Enregistré le ${new Date(savedAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}` : 'Pas encore enregistré'}
            {!published && !readOnly && ' · enregistrement automatique toutes les 20 secondes'}
          </p>
        </div>
        <button type="button" onClick={() => setShowGuide((v) => !v)} className="min-h-11 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-fg hover:border-wydad-logo">
          {showGuide ? 'Masquer les consignes' : 'Consignes de rédaction'}
        </button>
      </div>

      {readOnly && (
        <p className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Cet article est en ligne. Seule une personne autorisée à publier peut le modifier : demandez à un administrateur.
        </p>
      )}

      {d.id && !initial.language && (
        <p className="mb-6 rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Article de la première version du site, écrit dans les trois langues. Il s’ouvre en français : en choisissant une langue et en enregistrant, il devient un article dans cette seule langue.
        </p>
      )}

      {backup && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <span>Une version non enregistrée du {new Date(backup.at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })} a été retrouvée sur cet ordinateur.</span>
          <span className="flex gap-2">
            <button type="button" onClick={() => { setD({ ...backup.d, id: d.id }); setDirty(true); setBackup(null); }} className="rounded-lg bg-sky-700 px-3 py-1.5 font-semibold text-white">
              Restaurer
            </button>
            <button type="button" onClick={() => { try { localStorage.removeItem(storageKey); } catch {} setBackup(null); }} className="rounded-lg px-3 py-1.5 font-semibold">
              Ignorer
            </button>
          </span>
        </div>
      )}

      {showGuide && (
        <div className="mb-6 grid gap-4 rounded-2xl border border-border bg-white p-5 text-sm text-fg-secondary sm:grid-cols-2">
          <div>
            <p className="mb-2 font-semibold text-fg">Écriture</p>
            <ul className="list-disc space-y-1 ps-5">
              <li>Ton de journalisme sportif professionnel, titres clairs et informatifs, pas de racolage.</li>
              <li>Paragraphes courts ; intertitres pour les articles longs.</li>
              <li>Vérifiez noms, dates, scores et statistiques ; rien d’invérifié.</li>
              <li>Ne copiez pas d’articles d’autres médias ; donnez toujours le contexte.</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-semibold text-fg">Langue et image</p>
            <ul className="list-disc space-y-1 ps-5">
              <li>Une seule langue par article, sans mélange inutile ; l’arabe s’écrit de droite à gauche.</li>
              <li>Noms des joueurs, équipes et compétitions exacts et constants.</li>
              <li>Image {COVER.label}, WebP ou JPEG, 2 Mo maximum, nette, sans texte ni logo ajouté.</li>
            </ul>
            <Link href="/admin/guidelines" target="_blank" className="mt-2 inline-block font-semibold text-wydad-logo underline">
              Toutes les consignes
            </Link>
          </div>
        </div>
      )}

      <fieldset disabled={readOnly} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {/* 1. Language and category */}
          <Section step={1} title="Langue et catégorie" hint="Un article = une langue. Il apparaîtra uniquement dans la version du site de cette langue.">
            <div>
              <Label htmlFor="lang-fr" required>
                Langue de l’article
              </Label>
              <div role="radiogroup" aria-label="Langue de l’article" className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((l) => (
                  <label key={l.code} className={`flex min-h-12 cursor-pointer flex-col items-center justify-center rounded-xl border-2 px-2 py-2 text-center transition-colors ${d.language === l.code ? 'border-wydad-logo bg-wydad-logo/5' : 'border-border hover:border-fg-muted'}`}>
                    <input id={`lang-${l.code}`} type="radio" name="language" value={l.code} checked={d.language === l.code} onChange={() => update({ language: l.code })} className="sr-only" />
                    <span className="font-semibold text-fg" lang={l.code} dir={l.dir}>
                      {l.native}
                    </span>
                    <span className="text-xs text-fg-muted">{l.code === 'ar' ? 'de droite à gauche' : l.label}</span>
                  </label>
                ))}
              </div>
              <Messages checks={checks} field="language" />
            </div>

            <div>
              <Label htmlFor="category" required help="La catégorie décide de la rubrique où l’article apparaît. Le sport est déduit de la catégorie.">
                Catégorie
              </Label>
              <select id="category" value={d.categoryId} onChange={(e) => update({ categoryId: e.target.value })} className={`${inputCls} ${checks.some((c) => c.field === 'categoryId' && c.level === 'error') ? 'border-wydad-red' : 'border-border'}`}>
                <option value="">— Choisir une catégorie —</option>
                {groups.map((g) => (
                  <optgroup key={g} label={g}>
                    {categories
                      .filter((c) => c.group === g)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              {category ? (
                <p className="mt-2 rounded-lg bg-surface-secondary/70 px-3 py-2 text-sm text-fg-secondary">
                  <span className="font-semibold text-fg">{category.group} › {category.name} : </span>
                  {category.description || 'Pas de description.'}
                </p>
              ) : (
                <Messages checks={checks} field="categoryId" />
              )}
            </div>
          </Section>

          {/* 2. Title and summary */}
          <Section step={2} title="Titre et résumé" hint="Un titre clair et informatif ; un résumé d’une ou deux phrases qui dit l’essentiel.">
            <div>
              <div className="flex items-baseline justify-between">
                <Label htmlFor="title" required>
                  Titre
                </Label>
                <Counter value={d.title} max={LIMITS.title.max} recommended={LIMITS.title.recommended} />
              </div>
              <input id="title" dir={dir} lang={lang} value={d.title} onChange={(e) => update({ title: e.target.value })} placeholder="Ex. Le Wydad s’impose 2-0 face au Raja" className={`${inputCls} text-lg font-semibold ${checks.some((c) => c.field === 'title' && c.level === 'error') ? 'border-wydad-red' : 'border-border'}`} />
              <Messages checks={checks} field="title" />
            </div>
            <div>
              <Label htmlFor="slug" required help="L’adresse de la page, créée à partir du titre. Ne la changez pas après publication : les liens partagés ne marcheraient plus.">
                Adresse de la page
              </Label>
              <div className={`flex items-stretch overflow-hidden rounded-lg border bg-white ${checks.some((c) => c.field === 'slug') ? 'border-wydad-red' : 'border-border'} focus-within:border-wydad-logo`}>
                <span className="hidden items-center bg-surface-secondary px-3 text-sm text-fg-muted sm:flex">…/news/</span>
                <input
                  id="slug"
                  value={d.slug}
                  dir="ltr"
                  onChange={(e) => {
                    setSlugTouched(true);
                    update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-{2,}/g, '-') });
                  }}
                  disabled={published}
                  className="min-w-0 flex-1 px-3 py-2.5 font-mono text-sm text-fg outline-none"
                />
                {!published && (
                  <button type="button" onClick={() => { setSlugTouched(false); update({ slug: slugify(d.title) }); }} className="px-3 text-xs font-semibold text-wydad-logo hover:underline">
                    Depuis le titre
                  </button>
                )}
              </div>
              {lang === 'ar' && !d.slug && <p className="mt-1 text-xs text-fg-muted">Titre en arabe : écrivez l’adresse en lettres latines (ex. wydad-raja-2-0).</p>}
              <Messages checks={checks} field="slug" />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <Label htmlFor="excerpt" required help="Affiché sous le titre, dans les cartes de la page d’accueil et quand l’article est partagé.">
                  Résumé
                </Label>
                <Counter value={d.excerpt} max={LIMITS.excerpt.max} recommended={LIMITS.excerpt.recommended} />
              </div>
              <textarea id="excerpt" dir={dir} lang={lang} rows={3} value={d.excerpt} onChange={(e) => update({ excerpt: e.target.value })} className={`${inputCls} ${checks.some((c) => c.field === 'excerpt' && c.level === 'error') ? 'border-wydad-red' : 'border-border'}`} />
              <Messages checks={checks} field="excerpt" />
            </div>
          </Section>

          {/* 3. Featured image */}
          <Section step={3} title="Image principale" hint="Elle illustre l’article en haut de la page, sur la page d’accueil et dans les partages.">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
              <div className="min-w-0">
                {cropping === 'cover' ? (
                  <CoverCropper
                    target={COVER}
                    onCancel={() => setCropping(null)}
                    onDone={(r) => {
                      update({ coverUrl: r.url, coverWidth: r.sourceWidth, coverHeight: r.sourceHeight });
                      setCropping(null);
                      toast('Image enregistrée.', 'success');
                    }}
                  />
                ) : d.coverUrl ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.coverUrl} alt={d.coverAlt} className="aspect-video w-full rounded-lg border border-border object-cover" />
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setCropping('cover')} className="min-h-10 rounded-lg border border-border px-3 text-sm font-semibold text-fg hover:border-wydad-logo">
                        Changer l’image
                      </button>
                      <button type="button" onClick={() => update({ coverUrl: '', coverWidth: null, coverHeight: null })} className="min-h-10 rounded-lg px-3 text-sm font-semibold text-fg-muted hover:text-wydad-red">
                        Retirer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => setCropping('cover')} className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-fg-secondary hover:border-wydad-logo hover:text-wydad-logo">
                    <span className="text-3xl" aria-hidden>
                      +
                    </span>
                    <span className="font-semibold">Ajouter l’image principale</span>
                  </button>
                )}
                <Messages checks={checks} field="coverUrl" />
              </div>
              <aside className="rounded-xl bg-surface-secondary/70 p-4 text-sm text-fg-secondary">
                <p className="font-semibold text-fg">Format demandé</p>
                <ul className="mt-2 space-y-1">
                  <li>
                    <b className="text-fg">{COVER.width} × {COVER.height} px</b> (16:9)
                  </li>
                  <li>WebP ou JPEG, {MAX_IMAGE_BYTES / 1024 / 1024} Mo max</li>
                  <li>Photo nette, ni floue ni étirée</li>
                  <li>Pas de texte ni de logo ajouté</li>
                  <li>Sujet au centre (recadrage mobile)</li>
                </ul>
                <p className="mt-2 text-xs">L’outil recadre et compresse la photo pour vous.</p>
                {d.coverUrl && d.coverWidth && (
                  <p className={`mt-2 text-xs font-semibold ${d.coverWidth >= COVER.width ? 'text-emerald-700' : 'text-wydad-red'}`}>
                    Source : {d.coverWidth} × {d.coverHeight} px {d.coverWidth >= COVER.width ? '✓' : '(trop petite)'}
                  </p>
                )}
              </aside>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <Label htmlFor="alt" required={!!d.coverUrl} help="Décrivez ce que montre la photo, en une phrase, dans la langue de l’article. Lu par les lecteurs d’écran et par Google.">
                  Texte alternatif de l’image
                </Label>
                <Counter value={d.coverAlt} max={LIMITS.alt.max} />
              </div>
              <input id="alt" dir={dir} lang={lang} value={d.coverAlt} onChange={(e) => update({ coverAlt: e.target.value })} placeholder="Ex. Yahya Jabrane célèbre son but devant la tribune du Complexe Mohammed V" className={`${inputCls} ${checks.some((c) => c.field === 'coverAlt' && c.level === 'error') ? 'border-wydad-red' : 'border-border'}`} />
              <Messages checks={checks} field="coverAlt" />
            </div>

            <details className="rounded-xl border border-border px-4 py-3" open={!!d.coverMobileUrl}>
              <summary className="cursor-pointer text-sm font-semibold text-fg">Version mobile (facultative) · {COVER_MOBILE.label}</summary>
              <p className="mt-2 text-sm text-fg-secondary">Sur téléphone, une image verticale remplit mieux l’écran. Sans elle, l’image 16:9 est utilisée partout.</p>
              <div className="mt-3">
                {cropping === 'mobile' ? (
                  <CoverCropper target={COVER_MOBILE} onCancel={() => setCropping(null)} onDone={(r) => { update({ coverMobileUrl: r.url }); setCropping(null); }} />
                ) : d.coverMobileUrl ? (
                  <div className="flex items-end gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.coverMobileUrl} alt="" className="aspect-[4/5] w-32 rounded-lg border border-border object-cover" />
                    <button type="button" onClick={() => update({ coverMobileUrl: '' })} className="text-sm font-semibold text-fg-muted hover:text-wydad-red">
                      Retirer
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setCropping('mobile')} className="min-h-10 rounded-lg border border-border px-3 text-sm font-semibold text-fg hover:border-wydad-logo">
                    Ajouter une version mobile
                  </button>
                )}
              </div>
            </details>
          </Section>

          {/* 4. Text */}
          <Section step={4} title="Texte de l’article" hint="Paragraphes courts, intertitres pour les articles longs. Collez votre texte puis mettez-le en forme avec la barre d’outils.">
            <RichTextEditor id="body" value={d.bodyHtml} onChange={(html) => update({ bodyHtml: html })} dir={dir} lang={lang} invalid={checks.some((c) => c.field === 'body' && c.level === 'error')} />
            <p className="text-sm text-fg-muted">
              {s.words} mots · environ {s.readMinutes} min de lecture · {s.subheadings} intertitre(s)
            </p>
            <Messages checks={checks} field="body" />
          </Section>

          {/* 5. Publication details */}
          <Section step={5} title="Signature et date">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="author" help="Le nom affiché en bas de l’article (ex. votre nom, ou « Service communication »).">
                  Auteur
                </Label>
                <input id="author" value={d.author} onChange={(e) => update({ author: e.target.value })} className={`${inputCls} border-border`} />
              </div>
              <div>
                <Label htmlFor="date" help="Laissez vide pour publier tout de suite. Une date future programme la publication.">
                  Date de publication
                </Label>
                <input id="date" type="datetime-local" value={toLocalInput(d.publishedAt)} onChange={(e) => update({ publishedAt: e.target.value ? new Date(e.target.value).toISOString() : '' })} className={`${inputCls} border-border`} />
                {future && <p className="mt-1 text-sm text-sky-800">Publication programmée : l’article apparaîtra automatiquement à cette date.</p>}
                <Messages checks={checks} field="publishedAt" />
              </div>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
              <input type="checkbox" checked={d.featured} onChange={(e) => update({ featured: e.target.checked })} className="mt-1 h-5 w-5 accent-wydad-logo" />
              <span>
                <span className="block font-semibold text-fg">À la une</span>
                <span className="text-sm text-fg-secondary">L’article passe en tête du grand bandeau de la page d’accueil. À réserver aux informations majeures.</span>
              </span>
            </label>
          </Section>

          {/* Advanced */}
          <details open={advanced} onToggle={(e) => setAdvanced((e.target as HTMLDetailsElement).open)} className="rounded-2xl border border-border bg-white px-5 py-4 shadow-sm sm:px-6">
            <summary className="cursor-pointer font-semibold text-fg">Options avancées (Google, match lié)</summary>
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="seo-title" help="Titre affiché dans les résultats Google. Par défaut : le titre de l’article.">
                    Titre pour Google
                  </Label>
                  <Counter value={d.seoTitle} max={LIMITS.seoTitle} />
                </div>
                <input id="seo-title" dir={dir} value={d.seoTitle} onChange={(e) => update({ seoTitle: e.target.value })} placeholder={d.title} className={`${inputCls} border-border`} />
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="seo-desc" help="Texte sous le titre dans Google. Par défaut : le résumé.">
                    Description pour Google
                  </Label>
                  <Counter value={d.seoDescription} max={LIMITS.seoDescription} />
                </div>
                <textarea id="seo-desc" dir={dir} rows={2} value={d.seoDescription} onChange={(e) => update({ seoDescription: e.target.value })} placeholder={d.excerpt} className={`${inputCls} border-border`} />
              </div>
              <div>
                <Label htmlFor="match" help="Pour un compte rendu : l’identifiant visible à la fin de l’adresse du centre de match. L’article affichera le score et un lien vers le match.">
                  Match lié
                </Label>
                <input id="match" dir="ltr" value={d.matchId} onChange={(e) => update({ matchId: e.target.value.trim() })} placeholder="ex. cmvgff319ojujnv07n48jhibs" className={`${inputCls} border-border font-mono text-sm`} />
                <Messages checks={checks} field="matchId" />
              </div>
            </div>
          </details>
        </div>

        {/* Side: checks, checklist, actions */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="font-condensed text-xl font-extrabold uppercase text-fg">Avant de publier</h2>

            <p className="mt-3 text-sm font-semibold text-fg">1. Contrôle du contenu</p>
            {errors.length === 0 ? (
              <p className="mt-1 text-sm font-semibold text-emerald-700">✓ Aucun point bloquant{checks.length ? ` · ${checks.length} conseil(s)` : ''}</p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm text-wydad-red">
                {errors.map((c) => (
                  <li key={c.id}>
                    <a href={`#${c.field === 'categoryId' ? 'category' : c.field === 'coverAlt' ? 'alt' : c.field === 'language' ? 'lang-fr' : c.field === 'coverUrl' ? 'alt' : c.field}`} className="hover:underline">
                      ✕ {c.message}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 text-sm font-semibold text-fg">2. Affichage sur chaque écran</p>
            <ul className="mt-1 space-y-1 text-sm">
              {(['desktop', 'tablet', 'mobile'] as const).map((id) => {
                const r = previewValid ? preview?.results?.find((x) => x.device === id) : undefined;
                const label = { desktop: 'Ordinateur', tablet: 'Tablette', mobile: 'Mobile' }[id];
                return (
                  <li key={id} className="flex justify-between gap-2">
                    <span className="text-fg-secondary">{label}</span>
                    <span className={`font-semibold ${!r ? 'text-fg-muted' : r.ok ? 'text-emerald-700' : 'text-wydad-red'}`}>{!r ? (preview && !previewValid ? 'À revérifier' : 'Non vérifié') : r.ok ? 'Validé' : 'À corriger'}</span>
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={startPreview} disabled={!d.language} className="mt-3 min-h-11 w-full rounded-lg border-2 border-wydad-logo px-3 font-semibold text-wydad-logo hover:bg-wydad-logo hover:text-white disabled:opacity-40">
              Prévisualiser et vérifier
            </button>

            <p className="mt-4 text-sm font-semibold text-fg">3. Liste de contrôle</p>
            <ul className="mt-1 space-y-1.5">
              {CHECKLIST.map((c) => (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm text-fg-secondary">
                    <input
                      type="checkbox"
                      checked={ticks.has(c.id)}
                      onChange={(e) =>
                        setTicks((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(c.id);
                          else next.delete(c.id);
                          return next;
                        })
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 accent-wydad-logo"
                    />
                    {c.label}
                  </label>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2">
              {canPublish ? (
                <button
                  type="button"
                  onClick={() => save('publish')}
                  disabled={!!saving || errors.length > 0 || !allTicked || !previewValid}
                  className="min-h-12 w-full rounded-lg bg-wydad-logo px-3 font-semibold text-white hover:bg-wydad-red-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving === 'publish' ? 'Publication…' : published ? 'Mettre à jour l’article en ligne' : future ? 'Programmer la publication' : 'Publier'}
                </button>
              ) : (
                <button type="button" onClick={() => save('review')} disabled={!!saving || errors.length > 0} className="min-h-12 w-full rounded-lg bg-wydad-logo px-3 font-semibold text-white hover:bg-wydad-red-hover disabled:cursor-not-allowed disabled:opacity-40">
                  {saving === 'review' ? 'Envoi…' : status === 'review' ? 'Renvoyer pour relecture' : 'Soumettre pour relecture'}
                </button>
              )}
              {canPublish && (errors.length > 0 || !allTicked || !previewValid) && (
                <p className="text-xs text-fg-muted">La publication se débloque quand les 3 étapes ci-dessus sont validées.</p>
              )}
              {!published && (
                <button type="button" onClick={() => save('draft')} disabled={!!saving} className="min-h-11 w-full rounded-lg border border-border px-3 font-semibold text-fg hover:border-wydad-logo disabled:opacity-50">
                  {saving === 'draft' ? 'Enregistrement…' : 'Enregistrer le brouillon'}
                </button>
              )}
              {published && canPublish && (
                <button type="button" onClick={unpublish} className="min-h-11 w-full rounded-lg border border-border px-3 font-semibold text-fg hover:border-wydad-red hover:text-wydad-red">
                  Retirer du site
                </button>
              )}
              {d.id && !published && (
                <button type="button" onClick={remove} className="min-h-11 w-full rounded-lg px-3 text-sm font-semibold text-fg-muted hover:text-wydad-red">
                  Supprimer l’article
                </button>
              )}
            </div>
          </div>
        </aside>
      </fieldset>

      {/* Preview and responsive check */}
      {previewOpen && preview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-2 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="preview-title">
          <div className="mx-auto max-w-6xl rounded-2xl bg-surface-secondary p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="preview-title" className="font-condensed text-3xl font-extrabold uppercase text-fg">
                  Aperçu et vérification
                </h2>
                <p className="text-sm text-fg-secondary">La vraie page de l’article, telle que le public la verra. Chaque écran est contrôlé automatiquement.</p>
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="min-h-11 rounded-lg bg-white px-4 font-semibold text-fg shadow-sm hover:text-wydad-logo">
                Fermer l’aperçu
              </button>
            </div>
            <PreviewPanel previewId={preview.id} hash={preview.hash} language={lang} onResults={onResults} />
            {preview.results && (
              <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${preview.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-wydad-red/10 text-wydad-red'}`} role="status">
                {preview.ok ? 'Les trois écrans sont validés. Cochez la liste de contrôle pour pouvoir publier.' : 'Certains écrans sont à corriger : modifiez l’article puis relancez « Prévisualiser et vérifier ».'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
