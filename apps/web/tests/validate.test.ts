// Server-side validation of admin forms (run: npm run test:unit)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateForm, isSafeUrl } from '../src/lib/admin/validate';
import { getResource, RESOURCES } from '../src/lib/admin/resources';

const form = (entries: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
};
const news = getResource('news')!;
const validNews = {
  'title.fr': 'Victoire face au Raja',
  slug: 'victoire-face-au-raja',
  'excerpt.fr': 'Résumé',
  'body.fr': 'Texte',
  category_id: '6f1d3c3e-0d5b-4a39-9c41-1f0b3f0a2b11',
  sport: 'football',
  read_time_minutes: '3',
  status: 'draft',
};

test('a valid article passes and becomes a database row', () => {
  const { row, errors } = validateForm(news, form(validNews));
  assert.deepEqual(errors, {});
  assert.deepEqual(row.title, { fr: 'Victoire face au Raja' });
  assert.equal(row.read_time_minutes, 3);
  assert.equal(row.cover_url, null);
});

test('required fields, slug format and select values are enforced', () => {
  const { errors } = validateForm(news, form({ ...validNews, 'title.fr': '  ', slug: 'Pas Un Slug', sport: 'cricket', category_id: 'x' }));
  assert.match(errors.title, /au moins/);
  assert.match(errors.slug, /Minuscules/);
  assert.match(errors.sport, /invalide/);
  assert.match(errors.category_id, /invalide/);
});

test('publishing without a date publishes now', () => {
  const { row, errors } = validateForm(news, form({ ...validNews, status: 'published' }));
  assert.deepEqual(errors, {});
  assert.ok(Math.abs(Date.parse(String(row.published_at)) - Date.now()) < 5000);
});

test('dangerous links and images are refused', () => {
  for (const bad of ['javascript:alert(1)', 'data:text/html,x', '//evil.example', 'vbscript:x']) assert.equal(isSafeUrl(bad), false, bad);
  for (const ok of ['/news/x', '#benefits', 'https://webook.com/x', 'mailto:contact@wydad.ma']) assert.equal(isSafeUrl(ok), true, ok);
  const { errors } = validateForm(news, form({ ...validNews, cover_url: 'javascript:alert(1)' }));
  assert.match(errors.cover_url, /Image invalide/);
  const ann = validateForm(getResource('announcements')!, form({ 'message.fr': 'Billetterie ouverte', link_url: 'javascript:alert(1)' }));
  assert.match(ann.errors.link_url, /Lien invalide/);
});

test('repeaters validate every item', () => {
  const notes = getResource('match-notes')!;
  const good = validateForm(notes, form({ external_match_id: 'mt_123', goals: JSON.stringify([{ side: 'home', player: 'Ganvoula', minute: 62, penalty: true }]) }));
  assert.deepEqual(good.errors, {});
  assert.deepEqual(good.row.goals, [{ side: 'home', player: 'Ganvoula', minute: 62, penalty: true, own_goal: false }]);
  const bad = validateForm(notes, form({ external_match_id: 'mt_123', goals: JSON.stringify([{ side: 'middle', player: '', minute: 200 }]) }));
  assert.match(bad.errors.goals, /Élément 1/);
  const garbage = validateForm(notes, form({ external_match_id: 'mt_123', officials: '{not json' }));
  assert.match(garbage.errors.officials, /illisible/);
});

test('scalar repeaters (benefits) keep translated strings', () => {
  const offers = getResource('memberships')!;
  const { row, errors } = validateForm(offers, form({ 'name.fr': 'Gold', slug: 'gold', tier: 'gold', availability: 'available', currency: 'MAD', status: 'draft', benefits: JSON.stringify([{ fr: 'Loge privée', ar: 'مقصورة خاصة' }]) }));
  assert.deepEqual(errors, {});
  assert.deepEqual(row.benefits, [{ fr: 'Loge privée', ar: 'مقصورة خاصة' }]);
});

test('cross-field rules', () => {
  const nav = validateForm(getResource('navigation')!, form({ menu: 'main', href: '/x' }));
  assert.match(nav.errors.label, /libellé/);
  const ann = validateForm(getResource('announcements')!, form({ 'message.fr': 'x', starts_at: '2026-11-02T10:00:00Z', ends_at: '2026-11-01T10:00:00Z' }));
  assert.match(ann.errors.ends_at, /fin/);
});

test('every resource definition is consistent', () => {
  for (const r of RESOURCES) {
    for (const f of r.fields) {
      if (f.type === 'select') assert.ok(f.options?.length, `${r.key}.${f.name} has options`);
      if (f.type === 'relation') assert.ok(f.relation?.table, `${r.key}.${f.name} has a relation`);
      if (f.type === 'repeater') assert.ok(f.fields?.length, `${r.key}.${f.name} has sub-fields`);
      if (f.pattern) assert.doesNotThrow(() => new RegExp(f.pattern!), `${r.key}.${f.name} pattern`);
    }
  }
});

test('textarea line breaks are normalized (browsers send \\r\\n)', () => {
  const { row } = validateForm(news, form({ ...validNews, 'body.fr': 'Un.\r\n\r\nDeux.' }));
  assert.deepEqual(row.body, { fr: 'Un.\n\nDeux.' });
});
