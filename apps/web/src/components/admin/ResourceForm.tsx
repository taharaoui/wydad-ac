'use client';

import { Fragment, useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { deleteResource, saveResource, type FormState } from '@/app/admin/actions';
import type { FieldDef, Option, ResourceDef } from '@/lib/admin/types';
import { FieldControl } from './FieldControl';

type Row = Record<string, unknown>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex min-h-11 items-center rounded-lg bg-wydad-logo px-6 font-semibold text-white shadow-sm hover:bg-wydad-red-hover disabled:opacity-60">
      {pending ? 'Enregistrement…' : label}
    </button>
  );
}

function Repeater({ field, value, onChange, id }: { field: FieldDef; value: unknown; onChange: (v: unknown[]) => void; id: string }) {
  const items = Array.isArray(value) ? value : [];
  const sub = field.fields ?? [];
  const blank = () => (field.scalar ? {} : Object.fromEntries(sub.map((f) => [f.name, f.type === 'boolean' ? false : null])));
  const set = (i: number, next: unknown) => onChange(items.map((it, j) => (j === i ? next : it)));
  const move = (i: number, by: number) => {
    const next = [...items];
    const [it] = next.splice(i, 1);
    next.splice(i + by, 0, it);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-fg-muted">Aucun élément.</p>}
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface-secondary/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-fg">
              {field.label} {i + 1}
            </span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter" className="h-9 w-9 rounded-md border border-border bg-white text-fg disabled:opacity-30">
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Descendre" className="h-9 w-9 rounded-md border border-border bg-white text-fg disabled:opacity-30">
                ↓
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="h-9 rounded-md px-3 text-sm font-semibold text-wydad-red hover:bg-wydad-red/10">
                Retirer
              </button>
            </div>
          </div>
          {field.scalar ? (
            <FieldControl field={sub[0]} id={`${id}-${i}`} value={item} onChange={(v) => set(i, v)} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {sub.map((f) => (
                <div key={f.name} className={f.type === 'l10n' || f.type === 'l10n-long' || f.type === 'image' ? 'sm:col-span-2' : ''}>
                  {f.type !== 'boolean' && (
                    <label htmlFor={`${id}-${i}-${f.name}`} className="mb-1 block text-sm font-medium text-fg-secondary">
                      {f.label}
                      {f.required && <span className="text-wydad-red"> *</span>}
                    </label>
                  )}
                  <FieldControl
                    field={f}
                    id={`${id}-${i}-${f.name}`}
                    value={(item as Row)?.[f.name]}
                    onChange={(v) => set(i, { ...(item as Row), [f.name]: v })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, blank()])} className="rounded-lg border border-dashed border-wydad-logo/50 px-4 py-2 text-sm font-semibold text-wydad-red hover:bg-wydad-red/5">
        + Ajouter
      </button>
    </div>
  );
}

function DeleteButton({ resource, id }: { resource: ResourceDef; id: string }) {
  const [state, action] = useFormState<FormState>(deleteResource.bind(null, resource.key, id), {});
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(`Supprimer définitivement ce(tte) ${resource.singular} ? Cette action est irréversible.`)) e.preventDefault();
      }}
    >
      <button type="submit" className="inline-flex min-h-11 items-center rounded-lg px-4 font-semibold text-wydad-red hover:bg-wydad-red/10">
        Supprimer
      </button>
      {state.message && (
        <p role="alert" className="mt-2 max-w-md text-sm text-wydad-red">
          {state.message}
        </p>
      )}
    </form>
  );
}

export function ResourceForm({
  resource,
  id,
  initial,
  relationOptions,
  saved,
}: {
  resource: ResourceDef;
  id: string | null;
  initial: Row;
  relationOptions: Record<string, Option[]>;
  saved?: boolean;
}) {
  const [values, setValues] = useState<Row>(initial);
  const [state, action] = useFormState<FormState, FormData>(saveResource.bind(null, resource.key, id), saved ? { ok: true, message: 'Enregistré. Le site est à jour.' } : {});
  const [dirty, setDirty] = useState(false);
  const set = (name: string, v: unknown) => {
    setValues((prev) => ({ ...prev, [name]: v }));
    setDirty(true);
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => {
    if (state.ok) setDirty(false);
    if (state.errors) document.getElementById(`f-${Object.keys(state.errors)[0]}`)?.focus();
  }, [state]);

  return (
    <div>
      <form action={action} className="space-y-6" noValidate>
        {state.message && (
          <div role={state.ok ? 'status' : 'alert'} className={`rounded-lg px-4 py-3 text-sm font-medium ${state.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-wydad-red/10 text-wydad-red'}`}>
            {state.message}
          </div>
        )}
        <div className="grid gap-x-5 gap-y-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-7">
          {resource.fields.map((f) => {
            const fid = `f-${f.name}`;
            const error = state.errors?.[f.name];
            const wide = !f.half || f.type === 'l10n' || f.type === 'l10n-long' || f.type === 'repeater';
            return (
              <Fragment key={f.name}>
              {f.section && <h2 className="border-b border-border pb-2 pt-2 font-condensed text-xl font-bold uppercase tracking-wide text-fg sm:col-span-2">{f.section}</h2>}
              <div className={wide ? 'sm:col-span-2' : ''}>
                {f.type !== 'boolean' && (
                  <label htmlFor={fid} className="mb-1.5 block text-sm font-semibold text-fg">
                    {f.label}
                    {f.required && <span className="text-wydad-red"> *</span>}
                  </label>
                )}
                {f.type === 'repeater' ? (
                  <>
                    <input type="hidden" name={f.name} value={JSON.stringify(values[f.name] ?? [])} />
                    <Repeater field={f} id={fid} value={values[f.name]} onChange={(v) => set(f.name, v)} />
                  </>
                ) : (
                  <FieldControl
                    field={f}
                    name={f.name}
                    id={fid}
                    value={values[f.name]}
                    onChange={(v) => set(f.name, v)}
                    invalid={!!error}
                    options={relationOptions[f.name]}
                    source={f.from ? values[f.from] : undefined}
                  />
                )}
                {f.help && (
                  <p id={`${fid}-help`} className="mt-1.5 text-sm text-fg-muted">
                    {f.help}
                  </p>
                )}
                {error && (
                  <p className="mt-1.5 text-sm font-medium text-wydad-red" role="alert">
                    {error}
                  </p>
                )}
              </div>
              </Fragment>
            );
          })}
        </div>
        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <SubmitButton label={id || resource.singleton ? 'Enregistrer' : 'Créer'} />
          {dirty && <span className="text-sm text-fg-muted">Modifications non enregistrées</span>}
        </div>
      </form>
      {id && resource.canDelete !== false && !resource.singleton && (
        <div className="mt-8 border-t border-border pt-6">
          <DeleteButton resource={resource} id={id} />
        </div>
      )}
    </div>
  );
}
