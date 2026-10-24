'use client';

import type { FieldDef, Option } from '@/lib/admin/types';
import { ImageInput } from './ImageInput';

/**
 * One control for every field type. Controlled: the form keeps all values in state. At the top
 * level `name` is set and the control renders named inputs (read by the server action through
 * FormData); inside a repeater it has no name and the repeater serializes its items as JSON.
 */
export type L10nValue = { fr?: string; ar?: string; en?: string };

const LANGS: { code: 'fr' | 'ar' | 'en'; label: string }[] = [
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
  { code: 'en', label: 'EN' },
];

export const inputCls =
  'w-full rounded-lg border border-border bg-white px-3 py-2.5 text-[15px] text-fg shadow-sm outline-none transition focus:border-wydad-logo focus:ring-2 focus:ring-wydad-logo/20 disabled:bg-surface-secondary';

/** "2026-10-26T18:00:00Z" → "2026-10-26T19:00" in the browser's time zone (for datetime-local) */
function toLocalInput(iso: unknown): string {
  if (typeof iso !== 'string' || !iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function slugify(text: string, sep = '-') {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`^\\${sep}+|\\${sep}+$`, 'g'), '')
    .slice(0, 80);
}

interface Props {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  name?: string;
  id: string;
  invalid?: boolean;
  /** Relation choices, loaded by the page */
  options?: Option[];
  /** For slug fields: the current value of the field it is generated from */
  source?: unknown;
}

export function FieldControl({ field, value, onChange, name, id, invalid, options, source }: Props) {
  const aria = { 'aria-invalid': invalid || undefined, 'aria-describedby': field.help ? `${id}-help` : undefined };

  switch (field.type) {
    case 'l10n':
    case 'l10n-long': {
      const v = (value && typeof value === 'object' ? value : {}) as L10nValue;
      return (
        <div className="space-y-2">
          {LANGS.map(({ code, label }) => {
            const common = {
              id: code === 'fr' ? id : `${id}-${code}`,
              name: name ? `${name}.${code}` : undefined,
              value: v[code] ?? '',
              dir: code === 'ar' ? ('rtl' as const) : ('ltr' as const),
              lang: code,
              onChange: (e: { target: { value: string } }) => onChange({ ...v, [code]: e.target.value }),
              className: `${inputCls} ${code === 'ar' ? 'font-arabic' : ''}`,
              'aria-label': `${field.label} (${label})`,
              ...aria,
            };
            return (
              <div key={code} className="flex items-start gap-2">
                <span className="mt-2.5 w-8 shrink-0 rounded bg-surface-secondary py-0.5 text-center text-xs font-bold text-fg-muted">{label}</span>
                {field.type === 'l10n-long' ? <textarea rows={field.name === 'body' ? 10 : 3} {...common} /> : <input type="text" {...common} />}
              </div>
            );
          })}
        </div>
      );
    }

    case 'textarea':
      return <textarea id={id} name={name} rows={4} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className={inputCls} {...aria} />;

    case 'boolean':
      return (
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-3">
          <input id={id} type="checkbox" name={name} checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-wydad-logo" {...aria} />
          <span className="text-[15px] text-fg">{field.label}</span>
        </label>
      );

    case 'select':
    case 'relation': {
      const choices = field.type === 'select' ? field.options ?? [] : options ?? [];
      return (
        <select id={id} name={name} value={String(value ?? '')} onChange={(e) => onChange(e.target.value || null)} className={inputCls} {...aria}>
          <option value="">{field.required ? 'Choisir…' : '—'}</option>
          {choices.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }

    case 'number':
      return (
        <input
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          min={field.min}
          max={field.max}
          value={value == null ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className={inputCls}
          {...aria}
        />
      );

    case 'date':
      return <input id={id} name={name} type="date" value={String(value ?? '').slice(0, 10)} onChange={(e) => onChange(e.target.value || null)} className={inputCls} {...aria} />;

    case 'datetime':
      // The visible input is in local time; the submitted value is an absolute ISO date
      return (
        <>
          <input
            id={id}
            type="datetime-local"
            value={toLocalInput(value)}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
            className={inputCls}
            {...aria}
          />
          {name && <input type="hidden" name={name} value={typeof value === 'string' ? value : ''} />}
        </>
      );

    case 'image':
      return <ImageInput id={id} name={name} bucket={field.bucket ?? 'site-assets'} value={typeof value === 'string' ? value : ''} onChange={onChange} />;

    case 'slug': {
      const from = source && typeof source === 'object' ? ((source as L10nValue).fr ?? (source as L10nValue).en ?? '') : typeof source === 'string' ? source : '';
      const sep = field.pattern?.includes('_') && !field.pattern.includes('-') ? '_' : '-';
      return (
        <div className="flex gap-2">
          <input id={id} name={name} type="text" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className={`${inputCls} font-mono text-sm`} spellCheck={false} {...aria} />
          {field.from && (
            <button type="button" onClick={() => onChange(slugify(from, sep))} disabled={!from} className="shrink-0 rounded-lg border border-border px-3 text-sm font-semibold text-fg hover:border-wydad-logo disabled:opacity-40">
              Générer
            </button>
          )}
        </div>
      );
    }

    case 'repeater':
      return null; // rendered by the form (needs recursion with its own state)

    default:
      return (
        <input
          id={id}
          name={name}
          type={field.type === 'email' ? 'email' : field.type === 'url' ? 'text' : 'text'}
          inputMode={field.type === 'url' ? 'url' : undefined}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          maxLength={field.max}
          className={inputCls}
          {...aria}
        />
      );
  }
}
