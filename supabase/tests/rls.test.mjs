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
const EDITOR = '00000000-0000-0000-0000-00000000000c';
const PUBLISHER = '00000000-0000-0000-0000-00000000000d';

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
    insert into auth.users (id, email) values ('${ADMIN}', 'admin@wydad.test'), ('${USER}', 'fan@wydad.test'), ('${EDITOR}', 'editor@wydad.test'), ('${PUBLISHER}', 'publisher@wydad.test');
    insert into public.admin_users (user_id, note, role, can_publish) values ('${ADMIN}', 'test admin', 'admin', true), ('${EDITOR}', 'test editor', 'editor', false), ('${PUBLISHER}', 'trusted editor', 'editor', true);
    insert into public.categories (slug, name) values ('test_cat', '{"fr":"Test"}');
    insert into public.news_articles (slug, title, category_id, status, published_at) values
      ('published-article', '{"fr":"Publié"}', (select id from public.categories where slug = 'test_cat'), 'published', now() - interval '1 day'),
      ('draft-article', '{"fr":"Brouillon"}', (select id from public.categories where slug = 'test_cat'), 'draft', null),
      ('scheduled-article', '{"fr":"Programmé"}', (select id from public.categories where slug = 'test_cat'), 'published', now() + interval '1 day');
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
  await as('authenticated', ADMIN, `insert into public.news_articles (slug, title, category_id) values ('new-one', '{"fr":"Nouveau"}', (select id from public.categories where slug = 'test_cat'))`);
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
  // An editor cannot promote themselves or grant themselves publishing rights
  const upd = await as('authenticated', EDITOR, `update public.admin_users set role = 'admin', can_publish = true where user_id = '${EDITOR}'`);
  assert.equal(upd.affectedRows, 0);
  const mine = await as('authenticated', USER, 'select * from public.admin_users');
  assert.equal(mine.rows.length, 0, 'non-member sees no newsroom rows');
  const own = await as('authenticated', EDITOR, 'select user_id from public.admin_users');
  assert.deepEqual(own.rows.map((r) => r.user_id), [EDITOR], 'an editor sees only their own row');
  const all = await as('authenticated', ADMIN, 'select user_id from public.admin_users');
  assert.equal(all.rows.length, 3, 'an administrator sees the whole newsroom');
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

test('media library metadata is newsroom-only', async () => {
  assert.equal((await as('anon', null, 'select * from public.media')).rows.length, 0);
  assert.equal((await as('authenticated', USER, 'select * from public.media')).rows.length, 0);
  assert.equal((await as('authenticated', ADMIN, 'select * from public.media')).rows.length, 1);
});

test('storage: only the newsroom uploads to site buckets', async () => {
  await rejects(as('anon', null, `insert into storage.objects (bucket_id, name) values ('news', 'x.jpg')`));
  await rejects(as('authenticated', USER, `insert into storage.objects (bucket_id, name) values ('news', 'x.jpg')`));
  await as('authenticated', ADMIN, `insert into storage.objects (bucket_id, name) values ('news', 'x.jpg')`);
  const { rows } = await as('anon', null, `select name from storage.objects where bucket_id = 'news'`);
  assert.deepEqual(rows.map((r) => r.name), ['x.jpg'], 'files are publicly readable');
});

test('constraints reject malformed content', async () => {
  await assert.rejects(as('authenticated', ADMIN, `insert into public.categories (slug, name) values ('Bad Slug', '{"fr":"x"}')`), /check/);
  await assert.rejects(as('authenticated', ADMIN, `insert into public.categories (slug, name) values ('ok', '{"de":"x"}')`), /check/);
  // A published article without a date gets the publication time
  await as('authenticated', ADMIN, `insert into public.news_articles (slug, title, category_id, status) values ('no-date', '{"fr":"x"}', (select id from public.categories where slug = 'test_cat'), 'published')`);
  const dated = await as('authenticated', ADMIN, `select published_at from public.news_articles where slug = 'no-date'`);
  assert.ok(dated.rows[0].published_at);
  await as('authenticated', ADMIN, `delete from public.news_articles where slug = 'no-date'`);
  await assert.rejects(as('authenticated', ADMIN, `insert into public.news_articles (slug, language, title, category_id) values ('wrong-lang', 'ar', '{"fr":"x"}', (select id from public.categories where slug = 'test_cat'))`), /news_language_text/);
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

// ── Editorial CMS: roles, workflow and publication rules ──

const firstTeam = `(select id from public.categories where slug = 'first_team')`;
const hashOf = (slug) => `(select content_hash from public.news_articles where slug = '${slug}')`;
const report = (slug) => `jsonb_build_object('hash', ${hashOf(slug)}, 'ok', true)`;
const article = (slug, status = 'draft') =>
  `insert into public.news_articles (slug, language, title, excerpt, body, body_format, category_id, status, cover_url, cover_alt)
   values ('${slug}', 'fr', '{"fr":"Titre"}', '{"fr":"Résumé"}', '{"fr":"<p>Texte</p>"}', 'html', ${firstTeam}, '${status}', '/c.jpg', 'Alt')`;

test('the taxonomy has groups and their categories', async () => {
  const { rows } = await as('anon', null, `select c.slug, p.slug as parent from public.categories c left join public.categories p on p.id = c.parent_id where c.kind = 'category' and c.active and c.parent_id is not null order by p.sort, c.sort`);
  assert.deepEqual(rows.map((r) => `${r.parent}/${r.slug}`), [
    'football/first_team', 'football/espoirs', 'football/women', 'other_sports/basketball', 'club/club_news', 'club/academy', 'club/official',
  ]);
});

test('an editor writes drafts and submits them, but cannot publish without the right', async () => {
  await as('authenticated', EDITOR, article('editor-draft'));
  const { rows } = await as('authenticated', EDITOR, `select created_by from public.news_articles where slug = 'editor-draft'`);
  assert.equal(rows[0].created_by, EDITOR, 'authorship is recorded');
  await as('authenticated', EDITOR, `update public.news_articles set status = 'review' where slug = 'editor-draft'`);
  const sub = await as('authenticated', ADMIN, `select submitted_at from public.news_articles where slug = 'editor-draft'`);
  assert.ok(sub.rows[0].submitted_at, 'submission date set');
  const pub = await as('authenticated', EDITOR, `update public.news_articles set status = 'published', responsive_report = ${report('editor-draft')} where slug = 'editor-draft'`).catch((e) => e);
  assert.ok(pub instanceof Error || pub.affectedRows === 0, 'publishing refused');
  await assert.rejects(as('authenticated', EDITOR, `${article('editor-direct', 'published')}`));
});

test('an editor cannot touch articles of others', async () => {
  const upd = await as('authenticated', EDITOR, `update public.news_articles set slug = 'x' where slug = 'draft-article'`);
  assert.equal(upd.affectedRows, 0);
  const del = await as('authenticated', EDITOR, `delete from public.news_articles where slug = 'published-article'`);
  assert.equal(del.affectedRows, 0);
});

test('publication needs the image, alt text and a passing responsive check of this exact version', async () => {
  await as('authenticated', PUBLISHER, article('rules'));
  await assert.rejects(as('authenticated', PUBLISHER, `update public.news_articles set status = 'published' where slug = 'rules'`), /publish_rules/);
  await assert.rejects(
    as('authenticated', PUBLISHER, `update public.news_articles set status = 'published', responsive_report = jsonb_build_object('hash', 'stale', 'ok', true) where slug = 'rules'`),
    /publish_rules/,
  );
  await assert.rejects(
    as('authenticated', PUBLISHER, `update public.news_articles set status = 'published', cover_alt = '', responsive_report = ${report('rules')} where slug = 'rules'`),
    /publish_rules/,
  );
  await as('authenticated', PUBLISHER, `update public.news_articles set status = 'published', responsive_report = ${report('rules')} where slug = 'rules'`);
  const live = await as('anon', null, `select 1 from public.news_articles where slug = 'rules'`);
  assert.equal(live.rows.length, 1, 'a trusted editor published it');
  // Changing the text of a live article needs a new check
  await assert.rejects(as('authenticated', PUBLISHER, `update public.news_articles set body = '{"fr":"<p>Autre</p>"}' where slug = 'rules'`), /publish_rules/);
  // Settings that don't change the layout don't
  await as('authenticated', PUBLISHER, `update public.news_articles set featured = true where slug = 'rules'`);
});

test('the activity log follows the workflow and is newsroom-only', async () => {
  const { rows } = await as('authenticated', EDITOR, `select action from public.editorial_activity where article_title = 'Titre' order by id`);
  assert.ok(rows.some((r) => r.action === 'created') && rows.some((r) => r.action === 'submitted') && rows.some((r) => r.action === 'published'));
  assert.equal((await as('authenticated', USER, 'select * from public.editorial_activity')).rows.length, 0);
  await rejects(as('authenticated', ADMIN, `insert into public.editorial_activity (action) values ('published')`));
});

test('previews belong to their author', async () => {
  await as('authenticated', EDITOR, `insert into public.article_previews (content, content_hash) values ('{}', 'h')`);
  assert.equal((await as('authenticated', PUBLISHER, 'select * from public.article_previews')).rows.length, 0);
  assert.equal((await as('authenticated', EDITOR, 'select * from public.article_previews')).rows.length, 1);
});

test('the last administrator cannot be removed or demoted', async () => {
  await assert.rejects(as('authenticated', ADMIN, `update public.admin_users set role = 'editor' where user_id = '${ADMIN}'`), /last_admin/);
  await assert.rejects(as('authenticated', ADMIN, `delete from public.admin_users where user_id = '${ADMIN}'`), /last_admin/);
  // Another administrator first, then it's fine
  await as('authenticated', ADMIN, `update public.admin_users set role = 'admin' where user_id = '${PUBLISHER}'`);
  await as('authenticated', ADMIN, `update public.admin_users set active = false where user_id = '${ADMIN}'`);
  assert.equal((await as('authenticated', ADMIN, 'select public.is_admin() as a')).rows[0].a, false, 'a deactivated admin loses access');
});
