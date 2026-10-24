import type { FieldDef, ResourceDef } from './types';

/**
 * Server-side validation of admin forms, driven by the resource definitions. The browser checks
 * too, but only this decides what reaches the database (where constraints and RLS check again).
 */
export type FieldErrors = Record<string, string>;

const LANGS = ['fr', 'ar', 'en'] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Site paths (/news/…), anchors (#…) or http(s) URLs; never javascript: and the like */
export function isSafeUrl(value: string): boolean {
  if (/^\/(?!\/)/.test(value) || value.startsWith('#')) return true;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:' || u.protocol === 'mailto:';
  } catch {
    return false;
  }
}

/** Images: a site path or an https URL (Supabase Storage) */
function isSafeImage(value: string): boolean {
  if (/^\/(?!\/)[^\s]*$/.test(value)) return true;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

class Invalid extends Error {}
const fail = (message: string): never => {
  throw new Invalid(message);
};

/** Raw form values: FormData for top-level fields, JSON for repeater items */
function rawFromForm(form: FormData, field: FieldDef): unknown {
  switch (field.type) {
    case 'l10n':
    case 'l10n-long':
      return Object.fromEntries(LANGS.map((l) => [l, form.get(`${field.name}.${l}`)]));
    case 'boolean':
      return form.get(field.name) === 'on' || form.get(field.name) === 'true';
    case 'repeater': {
      const json = form.get(field.name);
      if (typeof json !== 'string' || !json) return [];
      try {
        return JSON.parse(json);
      } catch {
        return fail('Contenu illisible');
      }
    }
    default:
      return form.get(field.name);
  }
}

function check(field: FieldDef, raw: unknown): unknown {
  // Repeater items arrive as JSON, so numbers can be real numbers
  const str = typeof raw === 'string' ? raw.trim() : typeof raw === 'number' && Number.isFinite(raw) ? String(raw) : raw == null ? '' : null;
  const empty = str === '' || raw == null;

  switch (field.type) {
    case 'boolean':
      return raw === true || raw === 'on' || raw === 'true';

    case 'l10n':
    case 'l10n-long': {
      const obj = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
      const out: Record<string, string> = {};
      const max = field.type === 'l10n' ? 300 : 20000;
      for (const l of LANGS) {
        const v = obj[l];
        if (v == null || v === '') continue;
        if (typeof v !== 'string') fail('Texte invalide');
        // Browsers submit textarea line breaks as \r\n: store plain \n
        const t = (v as string).replace(/\r\n?/g, '\n').trim();
        if (t.length > max) fail(`${max} caractères maximum`);
        if (t) out[l] = t;
      }
      if (Object.keys(out).length === 0) return field.required ? fail('Renseignez au moins le français ou l’arabe') : null;
      return out;
    }

    case 'repeater': {
      if (!Array.isArray(raw)) fail('Liste invalide');
      const items = raw as unknown[];
      if (items.length > 200) fail('200 éléments maximum');
      return items.map((item, i) => {
        try {
          if (field.scalar) return check(field.fields![0], item);
          if (!item || typeof item !== 'object') fail('Élément invalide');
          const out: Record<string, unknown> = {};
          for (const sub of field.fields ?? []) {
            const v = check(sub, (item as Record<string, unknown>)[sub.name]);
            if (v !== null && v !== false) out[sub.name] = v;
            else if (sub.type === 'boolean') out[sub.name] = false;
          }
          return out;
        } catch (err) {
          if (err instanceof Invalid) fail(`Élément ${i + 1} : ${err.message}`);
          throw err;
        }
      });
    }

    default: {
      if (str === null) fail('Valeur invalide');
      if (empty) return field.required ? fail('Champ obligatoire') : null;
      const value = (str as string).replace(/\r\n?/g, '\n');
      if (field.max && field.type !== 'number' && value.length > field.max) fail(`${field.max} caractères maximum`);
      if (field.pattern && !new RegExp(field.pattern).test(value)) fail(field.patternMessage ?? 'Format invalide');

      switch (field.type) {
        case 'number': {
          const n = Number(value);
          if (!Number.isFinite(n)) fail('Nombre attendu');
          if (field.min != null && n < field.min) fail(`Minimum ${field.min}`);
          if (field.max != null && n > field.max) fail(`Maximum ${field.max}`);
          return n;
        }
        case 'date':
          return DATE.test(value) && !Number.isNaN(Date.parse(value)) ? value : fail('Date invalide');
        case 'datetime': {
          const d = new Date(value);
          return Number.isNaN(d.getTime()) ? fail('Date et heure invalides') : d.toISOString();
        }
        case 'select':
          return field.options?.some((o) => o.value === value) ? value : fail('Choix invalide');
        case 'relation':
          return UUID.test(value) ? value : fail('Choix invalide');
        case 'url':
          return isSafeUrl(value) ? value : fail('Lien invalide (https://… ou /chemin)');
        case 'image':
          return isSafeImage(value) ? value : fail('Image invalide');
        case 'email':
          return EMAIL.test(value) ? value : fail('E-mail invalide');
        default:
          return value.length > 20000 ? fail('Texte trop long') : value;
      }
    }
  }
}

/** Validates a submitted form against the resource: the row to write, or the errors by field */
export function validateForm(resource: ResourceDef, form: FormData): { row: Record<string, unknown>; errors: FieldErrors } {
  const row: Record<string, unknown> = {};
  const errors: FieldErrors = {};
  for (const field of resource.fields) {
    try {
      row[field.name] = check(field, rawFromForm(form, field));
    } catch (err) {
      if (err instanceof Invalid) errors[field.name] = err.message;
      else throw err;
    }
  }
  // Repeaters stored as jsonb default to an empty list rather than null
  for (const field of resource.fields) if (field.type === 'repeater' && row[field.name] == null && !errors[field.name]) row[field.name] = [];

  // Rules spanning several fields
  // Publishing without a date publishes now
  if (row.status === 'published' && 'published_at' in row && !row.published_at) row.published_at = new Date().toISOString();
  if (resource.table === 'navigation_items' && !row.label && !row.label_key) errors.label = 'Indiquez un libellé ou une clé de traduction';
  if (resource.table === 'announcements' && row.starts_at && row.ends_at && String(row.ends_at) <= String(row.starts_at)) errors.ends_at = 'La fin doit suivre le début';
  if (resource.table === 'matches' && row.home_team_id && row.home_team_id === row.away_team_id) errors.away_team_id = 'Deux équipes différentes';

  return { row, errors };
}
