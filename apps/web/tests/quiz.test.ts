import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../src/lib/quiz/bank';
import { answer, buildQuiz, dailyConfig, pickQuestions, scoreAnswer, summarize, toPlayable, verdict } from '../src/lib/quiz/engine';
import { CATEGORIES, DIFFICULTIES } from '../src/lib/quiz/types';

test('every question is well formed in the three languages', () => {
  const ids = new Set<string>();
  for (const q of QUESTIONS) {
    assert.ok(!ids.has(q.id), `duplicate id ${q.id}`);
    ids.add(q.id);
    assert.ok(CATEGORIES.includes(q.category) && DIFFICULTIES.includes(q.difficulty), q.id);
    assert.ok(q.answer >= 0 && q.answer < q.choices.length, `${q.id}: answer in range`);
    assert.ok(q.choices.length >= 3 && q.choices.length <= 6, q.id);
    assert.ok(q.source, `${q.id}: source`);
    for (const lang of ['fr', 'en', 'ar'] as const) {
      assert.ok(q.prompt[lang].trim() && q.explanation[lang].trim(), `${q.id}.${lang}: texts`);
      const labels = q.choices.map((c) => c[lang].trim());
      assert.ok(labels.every(Boolean), `${q.id}.${lang}: choices`);
      assert.equal(new Set(labels).size, labels.length, `${q.id}.${lang}: distinct choices`);
    }
  }
  for (const c of CATEGORIES) assert.ok(QUESTIONS.filter((q) => q.category === c).length >= 4, `${c} has questions`);
});

test('the daily challenge is the same all day and changes the next day', () => {
  const a = pickQuestions(dailyConfig(new Date('2026-10-25T08:00:00Z'))).map((q) => q.id);
  const b = pickQuestions(dailyConfig(new Date('2026-10-25T22:00:00Z'))).map((q) => q.id);
  const c = pickQuestions(dailyConfig(new Date('2026-10-26T08:00:00Z'))).map((q) => q.id);
  assert.equal(a.length, 5);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
});

test('shuffled choices keep the right answer', () => {
  for (const q of QUESTIONS) {
    for (const lang of ['fr', 'ar'] as const) {
      const p = toPlayable(q, lang, 'seed-x');
      assert.equal(p.choices[p.answer], q.choices[q.answer][lang], q.id);
    }
  }
});

test('category and difficulty filters', () => {
  const qs = buildQuiz({ mode: 'category', category: 'honours', difficulty: 'hard', count: 10, seed: 's' }, 'fr');
  assert.ok(qs.length > 0 && qs.every((q) => q.category === 'honours' && q.difficulty === 'hard'));
});

test('scoring: correctness, speed and streak', () => {
  assert.equal(scoreAnswer(false, 1000, 3), 0);
  assert.equal(scoreAnswer(true, 0, 0), 150);
  assert.equal(scoreAnswer(true, 20_000, 0), 100);
  assert.equal(scoreAnswer(true, 10_000, 2), 145);
  const [q] = buildQuiz({ mode: 'mixed', count: 1, seed: 'z' }, 'en');
  const right = answer(q, q.answer, 5000, 1);
  assert.equal(right.streak, 2);
  assert.ok(right.record.correct && right.record.points > 100);
  const timeout = answer(q, null, 25_000, 4);
  assert.equal(timeout.streak, 0);
  assert.equal(timeout.record.points, 0);
  assert.equal(timeout.record.timeMs, 20_000);
});

test('summary and verdict', () => {
  const cfg = { mode: 'mixed' as const, count: 3, seed: 'x' };
  const r = summarize(cfg, [
    { questionId: 'a', choice: 0, correct: true, timeMs: 1000, points: 140 },
    { questionId: 'b', choice: 1, correct: true, timeMs: 2000, points: 150 },
    { questionId: 'c', choice: null, correct: false, timeMs: 20000, points: 0 },
  ]);
  assert.equal(r.score, 290);
  assert.equal(r.correct, 2);
  assert.equal(r.bestStreak, 2);
  assert.equal(verdict(r), 'good');
  assert.equal(verdict({ correct: 5, total: 5 }), 'perfect');
});
