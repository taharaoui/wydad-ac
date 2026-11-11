// Applies the newsletter/quiz migration to an in-memory Postgres (PGlite) with Supabase-like roles,
// then checks constraints and that the public API roles can't touch subscribers.
// Run: npm run test:db -w apps/web
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const db = new PGlite();
await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth; create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub', '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
`);
await db.exec(fs.readFileSync(path.join(dir, '20261025000100_newsletter_quiz.sql'), 'utf8'));
await db.exec('grant usage on schema public to anon, authenticated; grant select on public.quiz_questions to anon, authenticated;');

const row = (email, extra = '') =>
  db.query(`insert into public.newsletter_subscribers (email, consent_at, consent_text, unsubscribe_token${extra ? ', topics' : ''}) values ($1, now(), 'v1', md5(random()::text)${extra ? `, ${extra}` : ''}) returning *`, [email]);

test('one row per address, case-insensitive', async () => {
  await row('Fan@Example.com');
  await assert.rejects(row('fan@example.COM'), /duplicate key/);
});

test('invalid emails and unknown topics are refused', async () => {
  await assert.rejects(row('not-an-email'), /check/);
  await assert.rejects(row('a@b.co', "array['spam']"), /check/);
  const ok = await row('b@b.co', "array['club','live']");
  assert.deepEqual(ok.rows[0].topics, ['club', 'live']);
});

test('the public API roles cannot read or write subscribers', async () => {
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`);
    await assert.rejects(db.query('select * from public.newsletter_subscribers'), /permission denied/);
    await assert.rejects(db.query(`insert into public.newsletter_subscribers (email, consent_at, consent_text, unsubscribe_token) values ('x@y.z', now(), 'v', 't')`), /permission denied/);
    await db.exec('reset role');
  }
});

test('quiz questions: answer must point to a choice; drafts are hidden', async () => {
  await assert.rejects(
    db.query(`insert into public.quiz_questions (id, category, difficulty, prompt, choices, answer_index, source) values ('q1', 'history', 'easy', '{}', '[{"fr":"a"},{"fr":"b"}]', 2, 's')`),
    /answer_in_range/,
  );
  await db.query(`insert into public.quiz_questions (id, category, difficulty, prompt, choices, answer_index, source, status) values ('q2', 'history', 'easy', '{}', '[{"fr":"a"},{"fr":"b"}]', 1, 's', 'draft'), ('q3', 'history', 'easy', '{}', '[{"fr":"a"},{"fr":"b"}]', 0, 's', 'published')`);
  await db.exec('set role anon');
  const { rows } = await db.query('select id from public.quiz_questions');
  await db.exec('reset role');
  assert.deepEqual(rows.map((r) => r.id), ['q3']);
});
