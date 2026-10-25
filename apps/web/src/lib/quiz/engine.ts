import { QUESTIONS } from './bank';
import type { AnswerRecord, Category, Lang, PlayableQuestion, Question, QuizConfig, QuizResult } from './types';

/**
 * Quiz rules, framework-free (works in Node, the browser or React Native).
 * Scoring: 100 points per right answer + up to 50 for speed + 10 per answer of the current streak.
 */
export const TIME_LIMIT_MS = 20_000;
export const DAILY_COUNT = 5;

/** Deterministic PRNG (mulberry32) from a string seed */
export function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Date key of the daily challenge, in Moroccan time (UTC+0 since 20 Sep 2026) */
export const dailyKey = (now = new Date()) => now.toISOString().slice(0, 10);

/** Questions matching a config, picked and ordered by its seed */
export function pickQuestions(config: QuizConfig, bank: Question[] = QUESTIONS): Question[] {
  const pool = bank.filter((q) => (!config.category || q.category === config.category) && (!config.difficulty || q.difficulty === config.difficulty));
  return shuffle(pool, rng(config.seed)).slice(0, config.count);
}

/** One language, choices shuffled (deterministically), answer index remapped */
export function toPlayable(q: Question, lang: Lang, seed: string): PlayableQuestion {
  const order = shuffle(
    q.choices.map((_, i) => i),
    rng(`${seed}:${q.id}`),
  );
  return {
    id: q.id,
    category: q.category,
    difficulty: q.difficulty,
    prompt: q.prompt[lang],
    choices: order.map((i) => q.choices[i][lang]),
    answer: order.indexOf(q.answer),
    explanation: q.explanation[lang],
    source: q.source,
  };
}

export function buildQuiz(config: QuizConfig, lang: Lang, bank: Question[] = QUESTIONS): PlayableQuestion[] {
  return pickQuestions(config, bank).map((q) => toPlayable(q, lang, config.seed));
}

export const dailyConfig = (now = new Date()): QuizConfig => ({ mode: 'daily', count: DAILY_COUNT, seed: `daily:${dailyKey(now)}` });

/** Points for one answer */
export function scoreAnswer(correct: boolean, timeMs: number, streakBefore: number): number {
  if (!correct) return 0;
  const speed = Math.max(0, Math.min(1, 1 - timeMs / TIME_LIMIT_MS));
  return 100 + Math.round(speed * 50) + streakBefore * 10;
}

/** Records an answer (choice null = timed out) and returns the new record and streak */
export function answer(question: PlayableQuestion, choice: number | null, timeMs: number, streak: number): { record: AnswerRecord; streak: number } {
  const correct = choice !== null && choice === question.answer;
  const points = scoreAnswer(correct, Math.min(timeMs, TIME_LIMIT_MS), streak);
  return { record: { questionId: question.id, choice, correct, timeMs: Math.min(timeMs, TIME_LIMIT_MS), points }, streak: correct ? streak + 1 : 0 };
}

export function summarize(config: QuizConfig, answers: AnswerRecord[]): QuizResult {
  let streak = 0;
  let bestStreak = 0;
  for (const a of answers) {
    streak = a.correct ? streak + 1 : 0;
    bestStreak = Math.max(bestStreak, streak);
  }
  return {
    config,
    answers,
    score: answers.reduce((s, a) => s + a.points, 0),
    correct: answers.filter((a) => a.correct).length,
    total: answers.length,
    bestStreak,
    durationMs: answers.reduce((s, a) => s + a.timeMs, 0),
  };
}

/** Result band for the end screen */
export function verdict(result: Pick<QuizResult, 'correct' | 'total'>): 'perfect' | 'great' | 'good' | 'low' {
  const ratio = result.total ? result.correct / result.total : 0;
  return ratio === 1 ? 'perfect' : ratio >= 0.7 ? 'great' : ratio >= 0.4 ? 'good' : 'low';
}

export const categoryCount = (category: Category, bank: Question[] = QUESTIONS) => bank.filter((q) => q.category === category).length;
