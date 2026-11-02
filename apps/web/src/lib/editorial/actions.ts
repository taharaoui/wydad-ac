'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { CMS_TAG } from '@/lib/supabase/config';
import { requireStaffAction } from '@/lib/admin/auth';
import { blocking, checkArticle, stats, type ArticleDraft, type Check } from './checks';
import { CHECKLIST, DEVICES, isLang, SLUG_PATTERN, type Lang } from './spec';
import { contentHash } from './hash';
import { plain, sanitizeArticleHtml } from './sanitize';
import type { DeviceResult, LayoutIssue } from './responsive';

export type Intent = 'autosave' | 'draft' | 'review' | 'publish';

export interface SaveResult {
  ok: boolean;
  id?: string;
  status?: string;
  updatedAt?: string;
  message?: string;
  checks?: Check[];
  /** Nothing was saved, quietly (autosave of an article not ready yet) */
  skipped?: boolean;
}

/** Every public page reads the CMS through the `cms` cache tag: refresh it after any change */
function refreshSite(slug?: string) {
  revalidateTag(CMS_TAG);
  revalidatePath('/', 'layout');
  if (slug) for (const prefix of ['', '/fr', '/en', '/ar']) revalidatePath(`${prefix}/news/${slug}`);
  revalidatePath('/admin', 'layout');
}

function explain(error: { code?: string; message: string }): string {
  if (error.code === '23505') return 'Cette adresse (slug) est déjà utilisée par un autre article : modifiez-la.';
  if (error.code === '42501') return 'Vous n’avez pas le droit de faire cette action.';
  if (/publish_rules/.test(error.message)) return `Publication refusée : ${error.message.replace(/^.*publish_rules:\s*/, '')}.`;
  if (error.code === '23514') return `Une règle n’est pas respectée (${error.message}).`;
  return `Erreur : ${error.message}`;
}

/** The editor's fields, cleaned: rich text sanitised, every other text without markup */
function normalize(input: ArticleDraft): ArticleDraft {
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v) : null);
  const url = (v: string) => {
    const s = String(v ?? '').trim();
    return /^(https:\/\/|\/)[^\s"'<>]*$/.test(s) ? s : '';
  };
  return {
    id: input.id,
    language: isLang(input.language) ? input.language : '',
    categoryId: /^[0-9a-f-]{36}$/.test(String(input.categoryId ?? '')) ? input.categoryId : '',
    title: plain(String(input.title ?? '')).replace(/\s+/g, ' '),
    slug: String(input.slug ?? '').trim().toLowerCase(),
    excerpt: plain(String(input.excerpt ?? '')).replace(/\s+/g, ' '),
    bodyHtml: sanitizeArticleHtml(String(input.bodyHtml ?? '')),
    coverUrl: url(input.coverUrl),
    coverAlt: plain(String(input.coverAlt ?? '')),
    coverWidth: num(input.coverWidth),
    coverHeight: num(input.coverHeight),
    coverMobileUrl: url(input.coverMobileUrl),
    author: plain(String(input.author ?? '')).slice(0, 120),
    publishedAt: input.publishedAt && !Number.isNaN(Date.parse(input.publishedAt)) ? new Date(input.publishedAt).toISOString() : '',
    featured: !!input.featured,
    seoTitle: plain(String(input.seoTitle ?? '')).slice(0, 200),
    seoDescription: plain(String(input.seoDescription ?? '')).slice(0, 400),
    matchId: String(input.matchId ?? '').trim(),
  };
}

/** Database row of a draft (one-language text stored under its language) */
function toRow(d: ArticleDraft, lang: Lang, sport: string | null) {
  const l10n = (v: string) => (v ? { [lang]: v } : {});
  return {
    language: lang,
    slug: d.slug,
    title: l10n(d.title),
    excerpt: l10n(d.excerpt),
    body: l10n(d.bodyHtml),
    body_format: 'html',
    category_id: d.categoryId,
    sport: (sport === 'basketball' ? 'basketball' : 'football') as 'basketball' | 'football',
    cover_url: d.coverUrl || null,
    cover_alt: d.coverAlt || null,
    cover_width: d.coverWidth,
    cover_height: d.coverHeight,
    cover_mobile_url: d.coverMobileUrl || null,
    cover_position: null,
    cover_orientation: 'landscape',
    author: d.author || null,
    featured: d.featured,
    match_id: d.matchId || null,
    read_time_minutes: stats(d.bodyHtml).readMinutes,
    seo_title: d.seoTitle ? { [lang]: d.seoTitle } : null,
    seo_description: d.seoDescription ? { [lang]: d.seoDescription } : null,
  };
}

const hashOf = (d: ArticleDraft, lang: Lang) =>
  contentHash({ language: lang, title: d.title, excerpt: d.excerpt, body: d.bodyHtml, bodyFormat: 'html', coverUrl: d.coverUrl || null, coverMobileUrl: d.coverMobileUrl || null, coverPosition: null });

export async function saveArticle(input: ArticleDraft, intent: Intent, extras: { checklist?: string[]; previewId?: string } = {}): Promise<SaveResult> {
  const { supabase, member } = await requireStaffAction();
  const d = normalize(input);

  const existing = d.id
    ? (await supabase.from('news_articles').select('id, status, created_by, slug').eq('id', d.id).maybeSingle()).data
    : null;
  if (d.id && !existing) return { ok: false, message: 'Article introuvable (supprimé ?).' };

  // Same rules as the database policies, with clear messages
  if (existing && member.role !== 'admin') {
    if (existing.created_by !== member.userId) return { ok: false, message: 'Vous ne pouvez modifier que vos propres articles.' };
    if (existing.status === 'published' && !member.canPublish) return { ok: false, message: 'Cet article est en ligne : seul un administrateur peut le modifier.' };
  }
  if (existing?.status === 'published' && intent === 'autosave') return { ok: false, skipped: true };

  if (!d.language || !d.categoryId || !d.title || !SLUG_PATTERN.test(d.slug)) {
    if (intent === 'autosave') return { ok: false, skipped: true };
    return { ok: false, message: 'Pour enregistrer, choisissez la langue et la catégorie, puis donnez un titre et une adresse valide.', checks: checkArticle(d) };
  }
  const lang = d.language;

  const { data: category } = await supabase.from('categories').select('id, kind, active, sport').eq('id', d.categoryId).maybeSingle();
  if (!category || category.kind !== 'category') return { ok: false, message: 'Catégorie inconnue : choisissez-en une dans la liste.' };

  const checks = checkArticle(d, { categoryActive: category.active });
  const errors = blocking(checks);
  const row: Record<string, unknown> = toRow(d, lang, category.sport);

  if (intent === 'autosave' || intent === 'draft') {
    row.status = 'draft';
    row.published_at = d.publishedAt || null;
  } else if (intent === 'review') {
    if (errors.length) return { ok: false, message: 'Corrigez les points bloquants avant de soumettre l’article.', checks };
    row.status = 'review';
    row.published_at = d.publishedAt || null;
  } else {
    if (!member.canPublish) return { ok: false, message: 'Vous n’êtes pas autorisé à publier : soumettez l’article pour relecture.' };
    if (errors.length) return { ok: false, message: 'Publication impossible : corrigez les points bloquants.', checks };
    const ticked = new Set(extras.checklist ?? []);
    if (!CHECKLIST.every((c) => ticked.has(c.id))) return { ok: false, message: 'Cochez tous les points de la liste de contrôle avant de publier.' };
    // The responsive check must be the one of this exact version
    const hash = hashOf(d, lang);
    const { data: preview } = extras.previewId
      ? await supabase.from('article_previews').select('content_hash, report').eq('id', extras.previewId).maybeSingle()
      : { data: null };
    const report = preview?.report as { ok?: boolean; devices?: DeviceResult[]; checked_at?: string } | null;
    if (!preview || preview.content_hash !== hash || !report?.ok) {
      return { ok: false, message: 'Lancez « Prévisualiser et vérifier » sur cette version : ordinateur, tablette et mobile doivent être validés.' };
    }
    row.status = 'published';
    row.published_at = d.publishedAt || new Date().toISOString();
    row.responsive_report = { hash, ok: true, checked_at: report.checked_at, devices: report.devices, checklist: [...ticked], checked_by: member.userId };
  }

  const query = existing
    ? supabase.from('news_articles').update(row as never).eq('id', existing.id)
    : supabase.from('news_articles').insert(row as never);
  const { data, error } = await query.select('id, status, updated_at').single();
  if (error) return { ok: false, message: explain(error), checks };

  if (intent === 'publish' || existing?.status === 'published') refreshSite(d.slug);
  else revalidatePath('/admin', 'layout');
  const messages: Record<Intent, string> = {
    autosave: 'Brouillon enregistré automatiquement.',
    draft: 'Brouillon enregistré. Il n’est pas visible sur le site.',
    review: 'Article soumis pour relecture : un administrateur va le valider.',
    publish: new Date(String(row.published_at)) > new Date() ? 'Article programmé : il apparaîtra sur le site à la date choisie.' : 'Article publié : il est en ligne.',
  };
  return { ok: true, id: data.id, status: data.status, updatedAt: data.updated_at, message: messages[intent], checks };
}

/** Stores the editor's current version for the preview pages; returns its id and content hash */
export async function createPreview(input: ArticleDraft): Promise<{ id?: string; hash?: string; message?: string; checks?: Check[] }> {
  const { supabase, member } = await requireStaffAction();
  const d = normalize(input);
  if (!d.language) return { message: 'Choisissez d’abord la langue de l’article.' };
  const { data: category } = d.categoryId ? await supabase.from('categories').select('name, sport, slug').eq('id', d.categoryId).maybeSingle() : { data: null };
  const hash = hashOf(d, d.language);
  const content = { ...toRow(d, d.language, category?.sport ?? null), category_name: category?.name ?? null, category_slug: category?.slug ?? null, published_at: d.publishedAt || new Date().toISOString() };

  // Old previews of this person are no longer needed
  await supabase.from('article_previews').delete().eq('created_by', member.userId).lt('created_at', new Date(Date.now() - 86_400_000).toISOString());
  const { data, error } = await supabase
    .from('article_previews')
    .insert({ article_id: d.id ?? null, content: content as never, content_hash: hash })
    .select('id')
    .single();
  if (error) return { message: explain(error) };
  return { id: data.id, hash, checks: checkArticle(d) };
}

/** Result of the checks run in the editor's browser on each device */
export async function recordPreviewReport(previewId: string, devices: DeviceResult[]): Promise<{ ok: boolean; message?: string }> {
  const { supabase } = await requireStaffAction();
  const clean: DeviceResult[] = DEVICES.map((dev) => {
    const r = Array.isArray(devices) ? devices.find((x) => x?.device === dev.id) : undefined;
    const issues: LayoutIssue[] = (Array.isArray(r?.issues) ? r!.issues : [])
      .slice(0, 30)
      .map((i) => ({ level: i.level === 'error' ? 'error' : 'warning', code: String(i.code).slice(0, 40), message: String(i.message).slice(0, 300) }));
    return { device: dev.id, width: dev.width, ok: !!r && !issues.some((i) => i.level === 'error'), issues };
  });
  const ok = clean.every((r) => r.ok);
  const { error } = await supabase
    .from('article_previews')
    .update({ report: { ok, devices: clean, checked_at: new Date().toISOString() } as never })
    .eq('id', previewId);
  if (error) return { ok: false, message: explain(error) };
  return { ok };
}

export async function unpublishArticle(id: string): Promise<SaveResult> {
  const { supabase, member } = await requireStaffAction();
  if (!member.canPublish) return { ok: false, message: 'Seules les personnes autorisées à publier peuvent retirer un article.' };
  const { data, error } = await supabase.from('news_articles').update({ status: 'draft' }).eq('id', id).select('slug, status, updated_at').single();
  if (error) return { ok: false, message: explain(error) };
  refreshSite(data.slug);
  return { ok: true, id, status: data.status, updatedAt: data.updated_at, message: 'Article retiré du site : il redevient un brouillon.' };
}

export async function deleteArticle(id: string): Promise<{ ok: boolean; message: string }> {
  const { supabase } = await requireStaffAction();
  const { data, error } = await supabase.from('news_articles').delete().eq('id', id).select('slug, status');
  if (error) return { ok: false, message: explain(error) };
  if (!data?.length) return { ok: false, message: 'Suppression impossible : vous ne pouvez supprimer que vos brouillons.' };
  if (data[0].status === 'published') refreshSite(data[0].slug);
  else revalidatePath('/admin', 'layout');
  return { ok: true, message: 'Article supprimé.' };
}

/** A copy as a new draft, owned by the person who duplicates it */
export async function duplicateArticle(id: string): Promise<{ ok: boolean; id?: string; message: string }> {
  const { supabase } = await requireStaffAction();
  const { data: src } = await supabase.from('news_articles').select('*').eq('id', id).maybeSingle();
  if (!src) return { ok: false, message: 'Article introuvable.' };
  const lang = (src.language ?? 'fr') as Lang;
  const title = src.title as Record<string, string>;
  const copy = {
    language: src.language ?? 'fr',
    slug: `${src.slug}-copie-${Math.random().toString(36).slice(2, 6)}`.slice(0, 90),
    title: { ...title, [lang]: `${title[lang] ?? title.fr ?? ''} (copie)` },
    excerpt: src.excerpt,
    body: src.body,
    body_format: src.body_format,
    category_id: src.category_id,
    sport: src.sport,
    cover_url: src.cover_url,
    cover_alt: src.cover_alt,
    cover_width: src.cover_width,
    cover_height: src.cover_height,
    cover_mobile_url: src.cover_mobile_url,
    cover_position: src.cover_position,
    cover_orientation: src.cover_orientation,
    author: src.author,
    match_id: src.match_id,
    read_time_minutes: src.read_time_minutes,
    seo_title: src.seo_title,
    seo_description: src.seo_description,
    status: 'draft' as const,
  };
  const { data, error } = await supabase.from('news_articles').insert(copy).select('id').single();
  if (error) return { ok: false, message: explain(error) };
  revalidatePath('/admin', 'layout');
  return { ok: true, id: data.id, message: 'Copie créée en brouillon.' };
}

export async function markOnboarded() {
  const { supabase } = await requireStaffAction();
  await supabase.rpc('mark_onboarded');
  revalidatePath('/admin', 'layout');
}
