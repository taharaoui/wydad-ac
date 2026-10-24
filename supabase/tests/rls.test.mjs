// Applies the migrations to an in-memory Postgres (PGlite) that mimics Supabase's roles, auth and
// storage schemas, then checks who can read and write what.
// Run: npm run test:db -w apps/web
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const db = new PGlite();

const ADMIN = '00000000-0000-0000-0000-00000000000a';
const USER = '00000000-0000-0000-0000-00000000000b';

/** Supabase pieces the migrations rely on: roles, auth.users / auth.uid(), storage tables */
const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text, owner uuid);
  alter table storage.objects enable row level security;
  grant usage on schema storage to anon, authenticated;
  grant all on storage.objects to anon, authenticated;
`;

/** Run sql as a role (anon / authenticated) with an optional user id, as PostgREST does */
async function as(role, userId, sql, params = []) {
  await db.exec('reset role');
  await db.query(`select set_config('request.jwt.claims', $1, false)`, [userId ? JSON.stringify({ sub: userId, role }) : '']);
  await db.exec(`set role ${role}`);
  try {
    return await db.query(sql, params);
  } finally {
    await db.exec('reset role');
  }
}
const rejects = (p) => assert.rejects(p, /row-level security|permission denied/);

// Setup runs before any test is registered
{
  await db.exec(SUPABASE_STUB);
  for (const file of fs.readdirSync(dir).sort()) await db.exec(fs.readFileSync(path.join(dir, file), 'utf8'));
  // Supabase grants table privileges to the API roles; RLS does the filtering
  await db.exec(`
    grant usage on schema public to anon, authenticated;
    grant all on all tables in schema public to anon, authenticated;
    insert into auth.users (id, email) values ('${ADMIN}', 'admin@wydad.test'), ('${USER}', 'fan@wydad.test');
    insert into public.admin_users (user_id, note) values ('${ADMIN}', 'test admin');
    insert into public.categories (slug, name) values ('club', '{"fr":"Club"}');
    insert into public.news_articles (slug, title, category_id, status, published_at) values
      ('published-article', '{"fr":"Publié"}', (select id from public.categories), 'published', now() - interval '1 day'),
      ('draft-article', '{"fr":"Brouillon"}', (select id from public.categories), 'draft', null),
      ('scheduled-article', '{"fr":"Programmé"}', (select id from public.categories), 'published', now() + interval '1 day');
    insert into public.announcements (message, active) values ('{"fr":"Actif"}', true), ('{"fr":"Inactif"}', false);
    insert into public.announcements (message, active, ends_at) values ('{"fr":"Expiré"}', true, now() - interval '1 hour');
    insert into public.navigation_items (menu, label_key, href, visible) values ('main', 'news', '/news', true), ('main', 'hidden', '/x', false);
    insert into public.galleries (slug, title, status) values ('public-gallery', '{"fr":"Pub"}', 'published'), ('draft-gallery', '{"fr":"Draft"}', 'draft');
    insert into public.gallery_items (gallery_id, image_url) select id, '/a.jpg' from public.galleries;
    insert into public.media (bucket, path, public_url, mime_type, size_bytes) values ('news', 'a.jpg', '/a.jpg', 'image/jpeg', 10);
  `);
}

test('visitors see published, due news only', async () => {
  const { rows } = await as('anon', null, 'select slug from public.news_articles order by slug');
  assert.deepEqual(rows.map((r) => r.slug), ['published-article']);
});

test('a signed-in non-admin sees the same as a visitor', async () => {
  const { rows } = await as('authenticated', USER, 'select slug from public.news_articles');
  assert.deepEqual(rows.map((r) => r.slug), ['published-article']);
});

test('admins see drafts and scheduled articles', async () => {
  const { rows } = await as('authenticated', ADMIN, 'select slug from public.news_articles order by slug');
  assert.deepEqual(rows.map((r) => r.slug), ['draft-article', 'published-article', 'scheduled-article']);
});

test('visitors and non-admins cannot write content', async () => {
  await rejects(as('anon', null, `insert into public.categories (slug, name) values ('x', '{"fr":"x"}')`));
  await rejects(as('authenticated', USER, `insert into public.categories (slug, name) values ('y', '{"fr":"y"}')`));
  // Updates and deletes outside RLS's reach silently affect no rows
  const upd = await as('authenticated', USER, `update public.news_articles set slug = 'hacked' where slug = 'published-article'`);
  assert.equal(upd.affectedRows, 0);
  const del = await as('anon', null, `delete from public.news_articles`);
  assert.equal(del.affectedRows, 0);
});

test('admins can create, publish, unpublish and delete', async () => {
  await as('authenticated', ADMIN, `insert into public.news_articles (slug, title, category_id) values ('new-one', '{"fr":"Nouveau"}', (select id from public.categories limit 1))`);
  let anon = await as('anon', null, `select 1 from public.news_articles where slug = 'new-one'`);
  assert.equal(anon.rows.length, 0, 'draft hidden');
  await as('authenticated', ADMIN, `update public.news_articles set status = 'published', published_at = now() where slug = 'new-one'`);
  anon = await as('anon', null, `select 1 from public.news_articles where slug = 'new-one'`);
  assert.equal(anon.rows.length, 1, 'published visible');
  await as('authenticated', ADMIN, `update public.news_articles set status = 'draft' where slug = 'new-one'`);
  anon = await as('anon', null, `select 1 from public.news_articles where slug = 'new-one'`);
  assert.equal(anon.rows.length, 0, 'unpublished hidden again');
  const del = await as('authenticated', ADMIN, `delete from public.news_articles where slug = 'new-one'`);
  assert.equal(del.affectedRows, 1);
});

test('nobody can make themselves an admin through the API', async () => {
  await rejects(as('authenticated', USER, `insert into public.admin_users (user_id) values ('${USER}')`));
  await rejects(as('authenticated', ADMIN, `insert into public.admin_users (user_id) values ('${USER}')`));
  const mine = await as('authenticated', USER, 'select * from public.admin_users');
  assert.equal(mine.rows.length, 0, 'non-admin sees no admin rows');
  const own = await as('authenticated', ADMIN, 'select user_id from public.admin_users');
  assert.deepEqual(own.rows.map((r) => r.user_id), [ADMIN], 'admin sees only own row');
  const anonAdmins = await as('anon', null, 'select * from public.admin_users');
  assert.equal(anonAdmins.rows.length, 0);
});

test('announcements: only active and current ones are public', async () => {
  const { rows } = await as('anon', null, 'select message ->> $1 as m from public.announcements', ['fr']);
  assert.deepEqual(rows.map((r) => r.m), ['Actif']);
});

test('menus: hidden items are not public', async () => {
  const { rows } = await as('anon', null, 'select label_key from public.navigation_items');
  assert.deepEqual(rows.map((r) => r.label_key), ['news']);
});

test('gallery photos follow their gallery status', async () => {
  const { rows } = await as('anon', null, 'select g.slug from public.gallery_items i join public.galleries g on g.id = i.gallery_id');
  assert.deepEqual(rows.map((r) => r.slug), ['public-gallery']);
});

test('media library metadata is admin-only', async () => {
  assert.equal((await as('anon', null, 'select * from public.media')).rows.length, 0);
  assert.equal((await as('authenticated', USER, 'select * from public.media')).rows.length, 0);
  assert.equal((await as('authenticated', ADMIN, 'select * from public.media')).rows.length, 1);
});

test('storage: only admins upload to site buckets', async () => {
  await rejects(as('anon', null, `insert into storage.objects (bucket_id, name) values ('news', 'x.jpg')`));
  await rejects(as('authenticated', USER, `insert into storage.objects (bucket_id, name) values ('news', 'x.jpg')`));
  await as('authenticated', ADMIN, `insert into storage.objects (bucket_id, name) values ('news', 'x.jpg')`);
  const { rows } = await as('anon', null, `select name from storage.objects where bucket_id = 'news'`);
  assert.deepEqual(rows.map((r) => r.name), ['x.jpg'], 'files are publicly readable');
});

test('constraints reject malformed content', async () => {
  await assert.rejects(as('authenticated', ADMIN, `insert into public.categories (slug, name) values ('Bad Slug', '{"fr":"x"}')`), /check/);
  await assert.rejects(as('authenticated', ADMIN, `insert into public.categories (slug, name) values ('ok', '{"de":"x"}')`), /check/);
  await assert.rejects(
    as('authenticated', ADMIN, `insert into public.news_articles (slug, title, category_id, status) values ('no-date', '{"fr":"x"}', (select id from public.categories limit 1), 'published')`),
    /published_needs_date/,
  );
  await assert.rejects(as('authenticated', ADMIN, `insert into public.site_settings (id) values (2)`), /check/);
});

test('media_usage finds references and is admin-only', async () => {
  await as('authenticated', ADMIN, `update public.news_articles set cover_url = '/a.jpg' where slug = 'published-article'`);
  await as('authenticated', ADMIN, `insert into public.pages (slug, title, blocks) values ('p1', '{"fr":"P"}', '[{"type":"image","url":"/a.jpg"}]')`);
  const { rows } = await as('authenticated', ADMIN, `select table_name, row_count from public.media_usage('/a.jpg') order by 1`);
  assert.deepEqual(rows.map((r) => [r.table_name, Number(r.row_count)]), [['gallery_items', 2], ['news_articles', 1], ['pages', 1]]);
  const none = await as('authenticated', ADMIN, `select * from public.media_usage('/unused.jpg')`);
  assert.equal(none.rows.length, 0);
  await assert.rejects(as('authenticated', USER, `select * from public.media_usage('/a.jpg')`), /admin only/);
  await rejects(as('anon', null, `select * from public.media_usage('/a.jpg')`));
});
