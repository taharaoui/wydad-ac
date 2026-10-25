// Applies supabase/migrations not applied yet, using SUPABASE_DB_URL from apps/web/.env.local
// (Session pooler URI). Tracks them in supabase_migrations.schema_migrations, like the Supabase CLI.
//   node scripts/migrate.mjs           apply
//   node scripts/migrate.mjs --status  list applied migrations
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, '..', '..', '..', 'supabase', 'migrations');
for (const line of fs.readFileSync(path.join(here, '..', '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error('SUPABASE_DB_URL missing in apps/web/.env.local');
  process.exit(1);
}
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query(`create schema if not exists supabase_migrations;
    create table if not exists supabase_migrations.schema_migrations (version text primary key, statements text[], name text);`);
  const done = new Set((await client.query('select version from supabase_migrations.schema_migrations')).rows.map((r) => r.version));
  if (process.argv.includes('--status')) {
    console.log([...done].sort().join('\n') || 'none');
  } else {
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
      const [version, ...name] = file.replace(/\.sql$/, '').split('_');
      if (done.has(version)) continue;
      const body = fs.readFileSync(path.join(dir, file), 'utf8');
      await client.query('begin');
      try {
        await client.query(body);
        await client.query('insert into supabase_migrations.schema_migrations values ($1, $2, $3)', [version, [body], name.join('_')]);
        await client.query('commit');
        console.log(`applied ${file}`);
      } catch (err) {
        await client.query('rollback');
        throw new Error(`${file}: ${err.message}`);
      }
    }
    console.log('up to date');
  }
} finally {
  await client.end();
}
