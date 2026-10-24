/**
 * Admin resources are described as plain data (serializable, so client forms receive them as props).
 * One engine renders lists and forms and validates on the server from these definitions.
 */
export type Bucket = 'site-assets' | 'news' | 'people' | 'galleries';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'slug'
  | 'url'
  | 'email'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'relation'
  | 'l10n'
  | 'l10n-long'
  | 'image'
  | 'repeater';

export interface Option {
  value: string;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  /** select */
  options?: Option[];
  /** relation: rows of another table; `labelColumn` may be a translated (jsonb) column */
  relation?: { table: string; labelColumn: string; l10n?: boolean; filter?: Record<string, string> };
  /** image upload target */
  bucket?: Bucket;
  /** slug: field the slug is generated from (its French text) */
  from?: string;
  /** Regex the value must match (slug and text) */
  pattern?: string;
  patternMessage?: string;
  min?: number;
  max?: number;
  /** repeater: fields of each item; with `scalar`, items are the value of the single sub-field */
  fields?: FieldDef[];
  scalar?: boolean;
  /** Layout: half-width on large screens */
  half?: boolean;
  /** Group heading shown above this field */
  section?: string;
}

export type ListColumnType = 'text' | 'l10n' | 'status' | 'date' | 'datetime' | 'boolean' | 'relation' | 'image';

export interface ListColumn {
  column: string;
  label: string;
  type?: ListColumnType;
  relation?: FieldDef['relation'];
}

export interface ResourceDef {
  key: string;
  table: string;
  /** Plural, for menus and list titles */
  label: string;
  /** Singular, for buttons ("Nouvel article") */
  singular: string;
  description: string;
  idColumn?: string;
  fields: FieldDef[];
  list: ListColumn[];
  search?: { column: string; l10n?: boolean };
  /** Filter by publication status (draft / published / archived) */
  statusFilter?: boolean;
  order: { column: string; ascending?: boolean }[];
  canCreate?: boolean;
  canDelete?: boolean;
  /** A single row (site settings): the list page opens the form */
  singleton?: string;
  /** Public page of a row, for the "view" link; {slug} / {id} are replaced */
  publicPath?: string;
  /** Draft preview inside the admin */
  preview?: 'news' | 'page';
  /** Sidebar group */
  group: 'content' | 'sport' | 'site';
  /** Gallery photos are edited inside their gallery (gallery_items) */
  children?: { table: 'gallery_items'; foreignKey: 'gallery_id'; field: string };
}

/** Publication status options shared by content tables */
export const STATUS_OPTIONS: Option[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'archived', label: 'Archivé' },
];
