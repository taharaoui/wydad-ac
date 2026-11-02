'use client';

import { useEffect, useState, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { inviteMember, newAccessLink, removeMember, updateMember, type ActionState } from '@/lib/editorial/admin-actions';
import { useToast } from '../Toast';

const input = 'w-full rounded-lg border border-border bg-white px-3 py-2.5 text-[15px] outline-none focus:border-wydad-logo';

function LinkBox({ state }: { state: ActionState }) {
  const [copied, setCopied] = useState(false);
  if (!state.link) return null;
  return (
    <div className="space-y-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">
      <p className="font-semibold">{state.message}</p>
      <div className="flex flex-wrap gap-2">
        <input readOnly value={state.link} onFocus={(e) => e.target.select()} className="min-w-0 flex-1 rounded-lg border border-emerald-300 bg-white px-3 py-2 font-mono text-xs" />
        <button type="button" onClick={() => { navigator.clipboard.writeText(state.link!); setCopied(true); }} className="min-h-10 rounded-lg bg-emerald-700 px-4 font-semibold text-white">
          {copied ? 'Copié ✓' : 'Copier le lien'}
        </button>
      </div>
      <p className="text-xs">Le lien expire après une utilisation ou au bout du délai fixé dans Supabase (1 h par défaut). Vous pourrez en générer un nouveau depuis la liste.</p>
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="min-h-11 rounded-lg bg-wydad-logo px-5 font-semibold text-white hover:bg-wydad-red-hover disabled:opacity-60">
      {pending ? 'Invitation…' : 'Inviter'}
    </button>
  );
}

/** Invite form: name, e-mail, role and the publishing right */
export function InviteForm() {
  const [state, action] = useFormState<ActionState, FormData>(inviteMember, {});
  const [role, setRole] = useState('editor');
  const toast = useToast();
  const router = useRouter();
  useEffect(() => {
    if (state.message && !state.ok) toast(state.message, 'error');
    if (state.ok) router.refresh();
  }, [state, toast, router]);

  return (
    <div className="space-y-4">
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inv-name" className="mb-1.5 block text-sm font-semibold">Nom affiché</label>
          <input id="inv-name" name="display_name" required placeholder="Prénom Nom" className={input} />
        </div>
        <div>
          <label htmlFor="inv-email" className="mb-1.5 block text-sm font-semibold">E-mail</label>
          <input id="inv-email" name="email" type="email" required className={input} />
        </div>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-sm font-semibold">Rôle</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ['editor', 'Rédacteur / journaliste', 'Écrit des articles, importe des images, modifie ses brouillons.'],
              ['admin', 'Administrateur', 'Accès complet : utilisateurs, catégories, réglages, tous les articles.'],
            ].map(([v, t, d]) => (
              <label key={v} className={`flex cursor-pointer gap-3 rounded-xl border-2 p-3 ${role === v ? 'border-wydad-logo bg-wydad-logo/5' : 'border-border'}`}>
                <input type="radio" name="role" value={v} checked={role === v} onChange={() => setRole(v)} className="mt-1 accent-wydad-logo" />
                <span>
                  <span className="block font-semibold">{t}</span>
                  <span className="text-sm text-fg-secondary">{d}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {role === 'editor' && (
          <label className="flex items-start gap-3 sm:col-span-2">
            <input type="checkbox" name="can_publish" className="mt-1 h-5 w-5 accent-wydad-logo" />
            <span>
              <span className="block font-semibold">Autorisé à publier</span>
              <span className="text-sm text-fg-secondary">Sans cette autorisation, ses articles sont soumis pour relecture et un administrateur les publie.</span>
            </span>
          </label>
        )}
        <div className="sm:col-span-2">
          <Submit />
        </div>
      </form>
      <LinkBox state={state} />
    </div>
  );
}

export interface MemberRow {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  canPublish: boolean;
  active: boolean;
  lastSignIn: string | null;
  articles: number;
  isMe: boolean;
}

/** One member: role, publishing right, deactivation, new access link, removal */
export function MemberActions({ m }: { m: MemberRow }) {
  const [pending, start] = useTransition();
  const [link, setLink] = useState<ActionState>({});
  const toast = useToast();
  const router = useRouter();
  const run = (fn: () => Promise<ActionState>, confirm?: string) => {
    if (confirm && !window.confirm(confirm)) return;
    start(async () => {
      const res = await fn();
      if (res.link) setLink(res);
      else toast(res.message ?? '', res.ok ? 'success' : 'error');
      router.refresh();
    });
  };
  const btn = 'min-h-9 rounded-md border border-border px-2.5 text-sm font-semibold hover:border-wydad-logo disabled:opacity-50';
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {m.role === 'editor' && (
          <button type="button" disabled={pending} className={btn} onClick={() => run(() => updateMember(m.userId, { can_publish: !m.canPublish }))}>
            {m.canPublish ? 'Retirer le droit de publier' : 'Autoriser à publier'}
          </button>
        )}
        {!m.isMe && (
          <button type="button" disabled={pending} className={btn} onClick={() => run(() => updateMember(m.userId, { role: m.role === 'admin' ? 'editor' : 'admin' }), m.role === 'editor' ? `Donner à ${m.name} un accès administrateur complet ?` : undefined)}>
            {m.role === 'admin' ? 'Passer rédacteur' : 'Passer administrateur'}
          </button>
        )}
        {!m.isMe && (
          <button type="button" disabled={pending} className={btn} onClick={() => run(() => updateMember(m.userId, { active: !m.active }))}>
            {m.active ? 'Suspendre' : 'Réactiver'}
          </button>
        )}
        <button type="button" disabled={pending} className={btn} onClick={() => run(() => newAccessLink(m.userId))}>
          Nouveau lien d’accès
        </button>
        {!m.isMe && (
          <button type="button" disabled={pending} className={`${btn} text-wydad-red`} onClick={() => run(() => removeMember(m.userId), `Retirer l’accès de ${m.name} ? Ses articles restent publiés.`)}>
            Retirer l’accès
          </button>
        )}
      </div>
      <LinkBox state={link} />
    </div>
  );
}
