// Database tasks for the club's Supabase project, using SUPABASE_DB_URL from apps/web/.env.local
// (Project Settings › Database › Connection string, "Session" mode). Nothing secret is printed.
//
//   node scripts/db.mjs migrate              apply supabase/migrations not applied yet
//   node scripts/db.mjs seed                 import supabase/seed.sql (idempotent)
//   node scripts/db.mjs grant-admin <email>  make an existing Supabase Auth user an administrator
//   node scripts/db.mjs revoke-admin <email>
//   node scripts/db.mjs status               applied migrations, admins, row counts
//
// Migrations are recorded in supabase_migrations.schema_migrations, like the Supabase CLI does,
// so `supabase db push` can take over later.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const migrationsDir = path.join(root, 'supabase', 'migrations');

function loadEnv() {
  const file = path.join(here, '..', '.env.local');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const url = process.env.SUPABASE_DB_URL;
if (!url || !/^postgres(ql)?:\/\//.test(url)) {
  console.error('SUPABASE_DB_URL is missing from apps/web/.env.local (Project Settings › Database › Connection string › URI).');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: url.includes('localhost') || url.includes('127.0.0.1') ? false : { rejectUnauthorized: false } });
const [command, arg] = process.argv.slice(2);

async function migrate() {
  await client.query(`
    create schema if not exists supabase_migrations;
    create table if not exists supabase_migrations.schema_migrations (version text primary key, statements text[], name text);`);
  const done = new Set((await client.query('select version from supabase_migrations.schema_migrations')).rows.map((r) => r.version));
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  let applied = 0;
  for (const file of files) {
    const [version, ...rest] = file.replace(/\.sql$/, '').split('_');
    if (done.has(version)) continue;
    const body = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try {
      await client.query('begin');
      await client.query(body);
      await client.query('insert into supabase_migrations.schema_migrations (version, statements, name) values ($1, $2, $3)', [version, [body], rest.join('_')]);
      await client.query('commit');
      console.log(`applied ${file}`);
      applied++;
    } catch (err) {
      await client.query('rollback');
      throw new Error(`${file}: ${err.message}`);
    }
  }
  console.log(applied ? `${applied} migration(s) applied` : 'database already up to date');
}

async function seed() {
  const file = path.join(root, 'supabase', 'seed.sql');
  await client.query(fs.readFileSync(file, 'utf8'));
  console.log('seed imported (existing rows left untouched)');
  await status();
}

async function userId(email) {
  if (!email) throw new Error('usage: grant-admin <email>');
  const { rows } = await client.query('select id from auth.users where lower(email) = lower($1)', [email]);
  if (!rows[0]) throw new Error(`no Supabase Auth user with that email: create it first (Authentication › Users › Add user)`);
  return rows[0].id;
}

async function grantAdmin(email) {
  const id = await userId(email);
  await client.query(`insert into public.admin_users (user_id, note) values ($1, $2) on conflict (user_id) do nothing`, [id, `granted from the CLI on ${new Date().toISOString().slice(0, 10)}`]);
  console.log(`${email} is an administrator`);
}

async function revokeAdmin(email) {
  const id = await userId(email);
  const { rowCount } = await client.query('delete from public.admin_users where user_id = $1', [id]);
  console.log(rowCount ? `${email} is no longer an administrator` : `${email} was not an administrator`);
}

async function status() {
  const migrations = await client.query(`select version, name from supabase_migrations.schema_migrations order by version`).catch(() => ({ rows: [] }));
  console.log(`migrations: ${migrations.rows.map((r) => `${r.version}_${r.name}`).join(', ') || 'none'}`);
  const admins = await client.query(`select count(*)::int as n from public.admin_users`).catch(() => ({ rows: [{ n: '?' }] }));
  console.log(`administrators: ${admins.rows[0].n}`);
  for (const t of ['news_articles', 'categories', 'staff_members', 'navigation_items', 'galleries', 'gallery_items', 'matches', 'match_notes', 'section_highlights', 'membership_offers', 'pages', 'media']) {
    const r = await client.query(`select count(*)::int as n, count(*) filter (where ${['categories', 'navigation_items', 'gallery_items', 'match_notes', 'media'].includes(t) ? 'true' : `status = 'published'`})::int as p from public.${t}`).catch(() => null);
    if (r) console.log(`  ${t.padEnd(20)} ${r.rows[0].n} rows${r.rows[0].p !== r.rows[0].n ? ` (${r.rows[0].p} published)` : ''}`);
  }
}

try {
  await client.connect();
  if (command === 'migrate') await migrate();
  else if (command === 'seed') await seed();
  else if (command === 'grant-admin') await grantAdmin(arg);
  else if (command === 'revoke-admin') await revokeAdmin(arg);
  else if (command === 'status') await status();
  else console.log('commands: migrate | seed | grant-admin <email> | revoke-admin <email> | status');
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
