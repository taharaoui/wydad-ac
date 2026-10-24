// Applies the migrations and supabase/seed.sql twice to an in-memory Postgres: the import must load
// the bundled content, satisfy every constraint, and add nothing the second time.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const supabaseDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const db = new PGlite();
await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth; create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
`);
for (const file of fs.readdirSync(path.join(supabaseDir, 'migrations')).sort()) {
  await db.exec(fs.readFileSync(path.join(supabaseDir, 'migrations', file), 'utf8'));
}
const seed = fs.readFileSync(path.join(supabaseDir, 'seed.sql'), 'utf8');

const TABLES = ['site_settings', 'home_sections', 'navigation_items', 'categories', 'news_articles', 'staff_members', 'galleries', 'gallery_items', 'competitions', 'teams', 'matches', 'match_notes', 'section_highlights', 'membership_offers'];
async function counts() {
  const out = {};
  for (const t of TABLES) out[t] = Number((await db.query(`select count(*) as n from public.${t}`)).rows[0].n);
  return out;
}

test('the seed loads the bundled content', async () => {
  await db.exec(seed);
  const c = await counts();
  for (const t of TABLES) assert.ok(c[t] > 0, `${t} has rows`);
  assert.equal(c.site_settings, 1);
  assert.equal(c.home_sections, 5);
  // Menu tree keeps its nesting: Football > First team > Squad
  const { rows } = await db.query(`
    select c.href from public.navigation_items c
    join public.navigation_items p on p.id = c.parent_id and p.label_key = 'first_team'
    join public.navigation_items g on g.id = p.parent_id and g.label_key = 'football'
    where c.label_key = 'squad'`);
  assert.deepEqual(rows.map((r) => r.href), ['/team']);
  const news = await db.query(`select n.slug, c.slug as category from public.news_articles n join public.categories c on c.id = n.category_id where n.status = 'published' order by n.published_at desc`);
  assert.ok(news.rows.length >= 4, 'bundled articles imported and published');
});

test('running the seed again adds nothing and keeps admin edits', async () => {
  const before = await counts();
  await db.exec(`update public.membership_offers set price_amount = 1234 where slug = 'gold'`);
  await db.exec(seed);
  assert.deepEqual(await counts(), before);
  const { rows } = await db.query(`select price_amount from public.membership_offers where slug = 'gold'`);
  assert.equal(Number(rows[0].price_amount), 1234, 'edit kept');
});
