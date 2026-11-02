'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { saveCategory, type ActionState } from '@/lib/editorial/admin-actions';
import { useToast } from '../Toast';

export interface CategoryFormValue {
  id?: string;
  kind: 'group' | 'category';
  parentId: string | null;
  name: { fr: string; ar: string; en: string };
  description: { fr: string; ar: string; en: string };
  sport: string | null;
  sort: number;
  active: boolean;
}

const input = 'w-full rounded-lg border border-border bg-white px-3 py-2 text-[15px] outline-none focus:border-wydad-logo';
const SPORTS = [
  ['', '—'],
  ['football', 'Football'],
  ['basketball', 'Basketball'],
  ['handball', 'Handball'],
  ['swimming', 'Natation'],
  ['boxing', 'Boxe'],
  ['fencing', 'Escrime'],
  ['other', 'Autre'],
];

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="min-h-11 rounded-lg bg-wydad-logo px-4 font-semibold text-white hover:bg-wydad-red-hover disabled:opacity-60">
      {pending ? 'Enregistrement…' : 'Enregistrer'}
    </button>
  );
}

/** Add or edit a group or a category (names and descriptions in the three languages) */
export function CategoryForm({ value, groups, label }: { value: CategoryFormValue; groups: { id: string; name: string }[]; label: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useFormState<ActionState, FormData>(saveCategory, {});
  const toast = useToast();
  const router = useRouter();
  useEffect(() => {
    if (!state.message) return;
    toast(state.message, state.ok ? 'success' : 'error');
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, toast, router]);

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="min-h-9 rounded-md border border-border bg-white px-3 text-sm font-semibold text-fg hover:border-wydad-logo">
        {label}
      </button>
    );

  return (
    <form action={action} className="mt-3 w-full space-y-4 rounded-xl border border-wydad-logo/40 bg-white p-4">
      {value.id && <input type="hidden" name="id" value={value.id} />}
      <input type="hidden" name="kind" value={value.kind} />
      <div className="grid gap-3 sm:grid-cols-3">
        {(['fr', 'ar', 'en'] as const).map((l) => (
          <div key={l}>
            <label htmlFor={`name_${l}-${value.id ?? 'new'}`} className="mb-1 block text-sm font-semibold">
              Nom ({l.toUpperCase()}){l === 'fr' && <span className="ms-1 text-xs text-wydad-red">obligatoire</span>}
            </label>
            <input id={`name_${l}-${value.id ?? 'new'}`} name={`name_${l}`} defaultValue={value.name[l]} dir={l === 'ar' ? 'rtl' : 'ltr'} className={input} />
          </div>
        ))}
      </div>
      {value.kind === 'category' && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {(['fr', 'ar', 'en'] as const).map((l) => (
              <div key={l}>
                <label htmlFor={`desc_${l}-${value.id ?? 'new'}`} className="mb-1 block text-sm font-semibold">
                  Ce qui va dans cette catégorie ({l.toUpperCase()})
                </label>
                <textarea id={`desc_${l}-${value.id ?? 'new'}`} name={`desc_${l}`} rows={3} defaultValue={value.description[l]} dir={l === 'ar' ? 'rtl' : 'ltr'} className={input} />
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor={`parent-${value.id ?? 'new'}`} className="mb-1 block text-sm font-semibold">Groupe</label>
              <select id={`parent-${value.id ?? 'new'}`} name="parent_id" defaultValue={value.parentId ?? ''} className={input}>
                <option value="">— Choisir —</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`sport-${value.id ?? 'new'}`} className="mb-1 block text-sm font-semibold">Sport</label>
              <select id={`sport-${value.id ?? 'new'}`} name="sport" defaultValue={value.sport ?? ''} className={input}>
                {SPORTS.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`sort-${value.id ?? 'new'}`} className="mb-1 block text-sm font-semibold">Ordre</label>
              <input id={`sort-${value.id ?? 'new'}`} name="sort" type="number" min={0} defaultValue={value.sort} className={input} />
            </div>
          </div>
        </>
      )}
      {value.kind === 'group' && <input type="hidden" name="sort" value={value.sort} />}
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="active" defaultChecked={value.active} className="h-4 w-4 accent-wydad-logo" />
        Active (proposée aux rédacteurs)
      </label>
      <div className="flex gap-2">
        <Submit />
        <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-lg px-4 font-semibold text-fg-muted hover:text-fg">Annuler</button>
      </div>
    </form>
  );
}
