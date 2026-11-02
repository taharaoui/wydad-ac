'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { CMS_TAG } from '@/lib/supabase/config';
import { createServiceClient } from '@/lib/supabase/service';
import { requireAdminAction } from '@/lib/admin/auth';
import { plain } from './sanitize';

export interface ActionState {
  ok?: boolean;
  message?: string;
  /** Invitation link to hand to the new member (shown once) */
  link?: string;
}

const SPORTS = ['football', 'basketball', 'handball', 'swimming', 'boxing', 'fencing', 'other'] as const;

// ── Categories ──

export async function saveCategory(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdminAction();
  const id = String(form.get('id') ?? '');
  const kind = form.get('kind') === 'group' ? 'group' : 'category';
  const text = (k: string) => plain(String(form.get(k) ?? '')).slice(0, k.startsWith('desc') ? 600 : 80);
  const name = { fr: text('name_fr'), ar: text('name_ar'), en: text('name_en') };
  const description = { fr: text('desc_fr'), ar: text('desc_ar'), en: text('desc_en') };
  if (!name.fr) return { message: 'Le nom en français est obligatoire.' };
  const parentId = kind === 'category' ? String(form.get('parent_id') ?? '') : '';
  if (kind === 'category' && !parentId) return { message: 'Choisissez le groupe de la catégorie.' };
  const sport = String(form.get('sport') ?? '');
  const row = {
    kind,
    name: Object.fromEntries(Object.entries(name).filter(([, v]) => v)),
    description: Object.values(description).some(Boolean) ? Object.fromEntries(Object.entries(description).filter(([, v]) => v)) : null,
    parent_id: parentId || null,
    sport: (SPORTS as readonly string[]).includes(sport) ? (sport as (typeof SPORTS)[number]) : null,
    sort: Math.max(0, Math.min(10000, Number(form.get('sort')) || 0)),
    active: form.get('active') === 'on',
  };
  if (id) {
    const { error } = await supabase.from('categories').update(row).eq('id', id);
    if (error) return { message: `Erreur : ${error.message}` };
  } else {
    const base = name.fr.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'categorie';
    const { error } = await supabase.from('categories').insert({ ...row, slug: `${base}_${Math.random().toString(36).slice(2, 5)}` });
    if (error) return { message: `Erreur : ${error.message}` };
  }
  revalidateTag(CMS_TAG);
  revalidatePath('/admin', 'layout');
  return { ok: true, message: row.active ? 'Catégorie enregistrée.' : 'Catégorie enregistrée (désactivée : elle n’est plus proposée aux rédacteurs).' };
}

// ── Newsroom members ──

/** Address of this site, for invitation links */
function origin() {
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https');
  return host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_SITE_URL ?? '';
}

/**
 * Invites someone to the newsroom: creates their Supabase account (no password yet), gives them a
 * role, and returns a one-time link where they choose their password. The administrator sends the
 * link themselves (e-mail, WhatsApp): no password ever travels.
 */
export async function inviteMember(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, member } = await requireAdminAction();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const displayName = plain(String(form.get('display_name') ?? '')).slice(0, 80);
  const role = form.get('role') === 'admin' ? 'admin' : 'editor';
  const canPublish = role === 'admin' || form.get('can_publish') === 'on';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: 'Adresse e-mail invalide.' };
  if (!displayName) return { message: 'Indiquez le nom de la personne (il signe ses articles).' };

  let service;
  try {
    service = createServiceClient();
  } catch {
    return { message: 'SUPABASE_SERVICE_ROLE_KEY n’est pas configurée sur le serveur : impossible de créer le compte.' };
  }
  let { data, error } = await service.auth.admin.generateLink({ type: 'invite', email });
  let type: 'invite' | 'recovery' = 'invite';
  // Already has an account (e.g. a fan account, or a previous invitation): a link to set a password
  if (error && /already|registered|exists/i.test(error.message)) {
    ({ data, error } = await service.auth.admin.generateLink({ type: 'recovery', email }));
    type = 'recovery';
  }
  if (error || !data?.user || !data.properties?.hashed_token) return { message: `Invitation impossible : ${error?.message ?? 'réponse inattendue'}` };

  const { error: rowError } = await supabase.from('admin_users').upsert(
    { user_id: data.user.id, email, display_name: displayName, role, can_publish: canPublish, active: true, invited_by: member.userId, note: `invited by ${member.email}` },
    { onConflict: 'user_id' },
  );
  if (rowError) return { message: `Erreur : ${rowError.message}` };
  revalidatePath('/admin/users');
  return {
    ok: true,
    message: `${displayName} est ajouté(e) à la rédaction. Envoyez-lui ce lien (valable une seule fois) pour choisir son mot de passe :`,
    link: `${origin()}/admin/accept?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=${type}`,
  };
}

/** A new one-time link for a member who lost theirs or forgot their password */
export async function newAccessLink(userId: string): Promise<ActionState> {
  const { supabase } = await requireAdminAction();
  const { data: row } = await supabase.from('admin_users').select('email').eq('user_id', userId).maybeSingle();
  if (!row?.email) return { message: 'Membre introuvable.' };
  const service = createServiceClient();
  const { data, error } = await service.auth.admin.generateLink({ type: 'recovery', email: row.email });
  if (error || !data.properties?.hashed_token) return { message: `Lien impossible : ${error?.message ?? 'réponse inattendue'}` };
  return { ok: true, message: 'Nouveau lien (valable une seule fois) :', link: `${origin()}/admin/accept?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery` };
}

export async function updateMember(userId: string, patch: { role?: 'admin' | 'editor'; can_publish?: boolean; active?: boolean; display_name?: string }): Promise<ActionState> {
  const { supabase, member } = await requireAdminAction();
  if (userId === member.userId && (patch.role === 'editor' || patch.active === false)) return { message: 'Vous ne pouvez pas retirer vos propres droits d’administrateur.' };
  const clean: typeof patch = {};
  if (patch.role) clean.role = patch.role === 'admin' ? 'admin' : 'editor';
  if (typeof patch.can_publish === 'boolean') clean.can_publish = patch.can_publish;
  if (typeof patch.active === 'boolean') clean.active = patch.active;
  if (typeof patch.display_name === 'string') clean.display_name = plain(patch.display_name).slice(0, 80);
  if (clean.role === 'admin') clean.can_publish = true;
  const { error } = await supabase.from('admin_users').update(clean).eq('user_id', userId);
  if (error) return { message: /last_admin/.test(error.message) ? 'Il doit rester au moins un administrateur actif.' : `Erreur : ${error.message}` };
  revalidatePath('/admin', 'layout');
  return { ok: true, message: 'Droits mis à jour.' };
}

/** Removes the newsroom access (the person's articles stay, signed with their name) */
export async function removeMember(userId: string): Promise<ActionState> {
  const { supabase, member } = await requireAdminAction();
  if (userId === member.userId) return { message: 'Vous ne pouvez pas retirer votre propre accès.' };
  const { error } = await supabase.from('admin_users').delete().eq('user_id', userId);
  if (error) return { message: /last_admin/.test(error.message) ? 'Il doit rester au moins un administrateur actif.' : `Erreur : ${error.message}` };
  revalidatePath('/admin/users');
  return { ok: true, message: 'Accès retiré.' };
}
