// Editorial rules shared by the editor and the server (run: npm run test:unit)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkArticle, blocking, stats, type ArticleDraft } from '../src/lib/editorial/checks';
import { slugify } from '../src/lib/editorial/spec';

const good: ArticleDraft = {
  language: 'fr',
  categoryId: '6f1d3c3e-0d5b-4a39-9c41-1f0b3f0a2b11',
  title: 'Le Wydad s’impose face au Raja',
  slug: 'le-wydad-simpose-face-au-raja',
  excerpt: 'Les Rouges ont dominé le derby de Casablanca grâce à deux buts en seconde période, au Complexe Mohammed V.',
  bodyHtml: `<p>${'Le Wydad a remporté le derby face au Raja. '.repeat(8)}</p><h2>Le match</h2><p>${'Deux buts en seconde période. '.repeat(6)}</p>`,
  coverUrl: 'https://x.supabase.co/storage/v1/object/public/news/a.webp',
  coverAlt: 'Les joueurs du Wydad célèbrent le premier but',
  coverWidth: 1600,
  coverHeight: 900,
  coverMobileUrl: '',
  author: 'Rédaction',
  publishedAt: '',
  featured: false,
  seoTitle: '',
  seoDescription: '',
  matchId: '',
};
const ids = (d: ArticleDraft) => blocking(checkArticle(d)).map((c) => c.id);

test('a complete article has no blocking issue', () => {
  assert.deepEqual(ids(good), []);
});

test('language, category, image and alt text are required', () => {
  assert.ok(ids({ ...good, language: '' }).includes('language'));
  assert.ok(ids({ ...good, categoryId: '' }).includes('category'));
  assert.ok(ids({ ...good, coverUrl: '' }).includes('cover'));
  assert.ok(ids({ ...good, coverAlt: ' ' }).includes('alt'));
});

test('an image smaller than 1200 × 675 blocks publication (never upscaled)', () => {
  assert.ok(ids({ ...good, coverWidth: 800, coverHeight: 450 }).includes('cover-small'));
});

test('a word too long for a phone blocks publication, links do not', () => {
  assert.ok(ids({ ...good, bodyHtml: `${good.bodyHtml}<p>${'a'.repeat(40)}</p>` }).includes('long-word'));
  assert.ok(!ids({ ...good, bodyHtml: `${good.bodyHtml}<p>Source https://www.example.com/${'a'.repeat(60)}</p>` }).includes('long-word'));
});

test('long titles, summaries and slugs are checked', () => {
  assert.ok(ids({ ...good, title: 'x'.repeat(130) }).includes('title-long'));
  assert.ok(ids({ ...good, excerpt: 'x '.repeat(250) }).includes('excerpt-long'));
  assert.ok(ids({ ...good, slug: 'Pas Un Slug' }).includes('slug'));
});

test('advice: intertitles in long articles, language mix', () => {
  const long = `<p>${'mot '.repeat(450)}</p>`;
  assert.ok(checkArticle({ ...good, bodyHtml: long }).some((c) => c.id === 'subheadings'));
  const mixed = checkArticle({ ...good, language: 'ar', title: 'الوداد يفوز', bodyHtml: good.bodyHtml });
  assert.ok(mixed.some((c) => c.id === 'language-mix'));
});

test('word count and reading time', () => {
  const s = stats('<p>un deux trois</p><h2>Titre</h2><ul><li>quatre</li></ul>');
  assert.equal(s.words, 5);
  assert.equal(s.subheadings, 1);
  assert.equal(s.readMinutes, 1);
});

test('slugs from titles', () => {
  assert.equal(slugify('Le Wydad s’impose 2-0 à Rabat !'), 'le-wydad-simpose-2-0-a-rabat');
  assert.equal(slugify('الوداد يفوز'), '');
});
