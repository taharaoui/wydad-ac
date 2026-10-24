'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSessionClient } from '@/lib/supabase/server';
import { CMS_TAG, isSupabaseConfigured } from '@/lib/supabase/config';
import { requireAdminAction } from '@/lib/admin/auth';
import { getResource } from '@/lib/admin/resources';
import { validateForm, type FieldErrors } from '@/lib/admin/validate';
import type { Bucket } from '@/lib/admin/types';

// Tables are chosen at runtime from the resource definitions
type Db = SupabaseClient;

export interface FormState {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors;
}

/** Every public page reads the CMS through the `cms` cache tag: refresh it after any change */
function refreshSite() {
  revalidateTag(CMS_TAG);
  revalidatePath('/', 'layout');
}

/** Postgres errors in words the club understands */
function explain(error: { code?: string; message: string; details?: string }): FormState {
  if (error.code === '23505') return { message: 'Cette valeur existe déjà (identifiant ou adresse déjà utilisé).', errors: { slug: 'Déjà utilisé' } };
  if (error.code === '23503') return { message: 'Impossible : cet élément est utilisé ailleurs (ex. une catégorie qui a encore des articles).' };
  if (error.code === '23514') return { message: `Une règle de contenu n’est pas respectée (${error.message.match(/"([^"]+)"/)?.[1] ?? 'contrainte'}).` };
  if (error.code === '42501') return { message: 'Accès refusé.' };
  return { message: `Erreur : ${error.message}` };
}

// ── Session ──

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { message: 'Supabase n’est pas encore configuré (voir docs/ADMIN.md).' };
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  if (!email || !password) return { message: 'E-mail et mot de passe requis.' };

  const supabase = createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { message: 'E-mail ou mot de passe incorrect.' };

  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { message: 'Ce compte n’a pas accès à l’administration.' };
  }
  const next = String(form.get('next') ?? '');
  redirect(/^\/admin(\/[\w/-]*)?$/.test(next) && next !== '/admin/login' ? next : '/admin');
}

export async function signOut() {
  if (isSupabaseConfigured()) await createSessionClient().auth.signOut();
  redirect('/admin/login');
}

// ── Content ──

export async function saveResource(resourceKey: string, id: string | null, _: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireAdminAction();
  const resource = getResource(resourceKey);
  if (!resource) return { message: 'Module inconnu.' };
  if (!id && resource.canCreate === false && !resource.singleton) return { message: 'Création impossible pour ce module.' };

  const { row, errors } = validateForm(resource, form);
  if (Object.keys(errors).length) return { message: 'Corrigez les champs signalés.', errors };

  const db = supabase as unknown as Db;
  const children = resource.children ? (row[resource.children.field] as Record<string, unknown>[]) : null;
  if (resource.children) delete row[resource.children.field];

  const idColumn = resource.idColumn ?? 'id';
  let savedId = id;
  if (resource.singleton) {
    const { error } = await db.from(resource.table).upsert({ [idColumn]: Number(resource.singleton), ...row });
    if (error) return explain(error);
    savedId = resource.singleton;
  } else if (id) {
    const { error } = await db.from(resource.table).update(row).eq(idColumn, id);
    if (error) return explain(error);
  } else {
    const { data, error } = await db.from(resource.table).insert(row).select(idColumn).single();
    if (error) return explain(error);
    savedId = String((data as unknown as Record<string, unknown>)[idColumn]);
  }

  // Gallery photos: replace the list with the submitted one, in order
  if (resource.children && children && savedId) {
    const { table, foreignKey } = resource.children;
    const del = await db.from(table).delete().eq(foreignKey, savedId);
    if (del.error) return explain(del.error);
    if (children.length) {
      const ins = await db.from(table).insert(children.map((c, i) => ({ ...c, [foreignKey]: savedId, sort: i * 10 })));
      if (ins.error) return explain(ins.error);
    }
  }

  refreshSite();
  if (!id && !resource.singleton) redirect(`/admin/${resource.key}/${encodeURIComponent(savedId!)}?saved=1`);
  return { ok: true, message: 'Enregistré. Le site est à jour.' };
}

export async function deleteResource(resourceKey: string, id: string): Promise<FormState> {
  const { supabase } = await requireAdminAction();
  const resource = getResource(resourceKey);
  if (!resource || resource.canDelete === false) return { message: 'Suppression impossible pour ce module.' };
  const { error, count } = await (supabase as unknown as Db)
    .from(resource.table)
    .delete({ count: 'exact' })
    .eq(resource.idColumn ?? 'id', id);
  if (error) return explain(error);
  if (!count) return { message: 'Rien n’a été supprimé (déjà supprimé ?).' };
  refreshSite();
  redirect(`/admin/${resource.key}?deleted=1`);
}

// ── Media ──

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};
const BUCKETS: Bucket[] = ['site-assets', 'news', 'people', 'galleries'];

/** Checks the file's first bytes, not just the type the browser claims */
async function sniff(file: File): Promise<string | null> {
  const b = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const ascii = String.fromCharCode(...b);
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && ascii.slice(1, 4) === 'PNG') return 'image/png';
  if (ascii.slice(0, 4) === 'RIFF' && ascii.slice(8, 12) === 'WEBP') return 'image/webp';
  if (ascii.slice(4, 12) === 'ftypavif' || ascii.slice(4, 12) === 'ftypavis') return 'image/avif';
  const head = (await file.slice(0, 512).text()).trimStart();
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(head)) return 'image/svg+xml';
  return null;
}

/** SVGs can carry scripts: refuse any that do */
async function unsafeSvg(file: File) {
  const text = await file.text();
  return /<script|on[a-z]+\s*=|javascript:|<foreignObject/i.test(text);
}

export interface UploadResult {
  url?: string;
  error?: string;
}

export async function uploadMedia(form: FormData): Promise<UploadResult> {
  const { supabase, user } = await requireAdminAction();
  const file = form.get('file');
  const bucket = String(form.get('bucket') ?? '') as Bucket;
  if (!(file instanceof File) || file.size === 0) return { error: 'Choisissez un fichier.' };
  if (!BUCKETS.includes(bucket)) return { error: 'Dossier inconnu.' };
  if (file.size > MAX_BYTES) return { error: 'Fichier trop lourd (8 Mo maximum).' };
  const type = await sniff(file);
  if (!type || !TYPES[type]) return { error: 'Format refusé : JPEG, PNG, WebP, AVIF ou SVG uniquement.' };
  if (type === 'image/svg+xml' && (bucket !== 'site-assets' || (await unsafeSvg(file)))) return { error: 'SVG refusé (logos uniquement, sans script).' };

  const base = file.name.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 60) || 'image';
  const now = new Date();
  const path = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID().slice(0, 8)}-${base}.${TYPES[type]}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: type, cacheControl: '31536000', upsert: false });
  if (error) return { error: `Envoi impossible : ${error.message}` };
  const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  const width = Number(form.get('width')) || null;
  const height = Number(form.get('height')) || null;
  const { error: rowError } = await supabase.from('media').insert({ bucket, path, public_url: publicUrl, mime_type: type, size_bytes: file.size, width, height, created_by: user.id });
  if (rowError) {
    await supabase.storage.from(bucket).remove([path]);
    return { error: `Enregistrement impossible : ${rowError.message}` };
  }
  revalidatePath('/admin/media');
  return { url: publicUrl };
}

/** Replaces a file in place (same address, so every page using it shows the new one) */
export async function replaceMedia(form: FormData): Promise<UploadResult> {
  const { supabase } = await requireAdminAction();
  const id = String(form.get('id') ?? '');
  const file = form.get('file');
  const { data: media } = await supabase.from('media').select('*').eq('id', id).maybeSingle();
  if (!media) return { error: 'Média introuvable.' };
  if (!(file instanceof File) || file.size === 0) return { error: 'Choisissez un fichier.' };
  if (file.size > MAX_BYTES) return { error: 'Fichier trop lourd (8 Mo maximum).' };
  const type = await sniff(file);
  if (type !== media.mime_type) return { error: `Le remplaçant doit être du même format (${media.mime_type}).` };
  if (type === 'image/svg+xml' && (await unsafeSvg(file))) return { error: 'SVG refusé (contient du script).' };

  // Short cache on replaced files so the new version shows quickly
  const { error } = await supabase.storage.from(media.bucket).update(media.path, file, { contentType: type, cacheControl: '60', upsert: true });
  if (error) return { error: `Remplacement impossible : ${error.message}` };
  await supabase.from('media').update({ size_bytes: file.size, width: Number(form.get('width')) || media.width, height: Number(form.get('height')) || media.height }).eq('id', id);
  refreshSite();
  revalidatePath('/admin/media');
  return { url: media.public_url };
}

export async function deleteMedia(id: string): Promise<FormState> {
  const { supabase } = await requireAdminAction();
  const { data: media } = await supabase.from('media').select('*').eq('id', id).maybeSingle();
  if (!media) return { message: 'Média introuvable.' };
  const { data: usage, error } = await supabase.rpc('media_usage', { target_url: media.public_url });
  if (error) return explain(error);
  if (usage && usage.length) {
    return { message: `Ce fichier est encore utilisé (${usage.map((u) => `${u.table_name} : ${u.row_count}`).join(', ')}). Retirez-le de ces contenus avant de le supprimer.` };
  }
  const removed = await supabase.storage.from(media.bucket).remove([media.path]);
  if (removed.error) return explain(removed.error);
  await supabase.from('media').delete().eq('id', id);
  revalidatePath('/admin/media');
  return { ok: true, message: 'Média supprimé.' };
}

/** Latest uploads, for the image picker in forms */
export async function listMedia(bucket?: string): Promise<{ id: string; url: string; bucket: string }[]> {
  const { supabase } = await requireAdminAction();
  let query = supabase.from('media').select('id, public_url, bucket').order('created_at', { ascending: false }).limit(60);
  if (bucket) query = query.eq('bucket', bucket);
  const { data } = await query;
  return (data ?? []).map((m) => ({ id: m.id, url: m.public_url, bucket: m.bucket }));
}
