'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { TIME_LIMIT_MS, answer as answerQuestion, buildQuiz, categoryCount, dailyConfig, dailyKey, summarize, verdict } from '@/lib/quiz/engine';
import { CATEGORIES, type AnswerRecord, type Category, type Difficulty, type Lang, type PlayableQuestion, type QuizConfig, type QuizResult } from '@/lib/quiz/types';

const ICONS: Record<Category, string> = { history: '📜', honours: '🏆', legends: '⭐', stadium: '🏟️', supporters: '📣' };

/** Scores kept on this device only (no accounts yet): clearly labelled as such */
const STORE = 'wydad-quiz-v1';
interface LocalStore {
  best: Record<string, number>;
  daily: Record<string, { score: number; correct: number; total: number }>;
}
function readStore(): LocalStore {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) ?? '{}');
    return { best: raw.best ?? {}, daily: raw.daily ?? {} };
  } catch {
    return { best: {}, daily: {} };
  }
}
function writeStore(s: LocalStore) {
  try {
    localStorage.setItem(STORE, JSON.stringify(s));
  } catch {
    // Private mode or storage disabled: the game still works
  }
}
const configKey = (c: QuizConfig) => (c.mode === 'daily' ? 'daily' : `${c.category ?? 'all'}:${c.difficulty ?? 'mixed'}`);

type View = { name: 'home' } | { name: 'play'; config: QuizConfig; questions: PlayableQuestion[] } | { name: 'results'; result: QuizResult; questions: PlayableQuestion[] };

export function QuizHub({ lang }: { lang: Lang }) {
  const t = useTranslations('quiz');
  const [view, setView] = useState<View>({ name: 'home' });
  const [difficulty, setDifficulty] = useState<Difficulty | 'mixed'>('mixed');
  const [store, setStore] = useState<LocalStore>({ best: {}, daily: {} });
  const today = dailyKey();
  useEffect(() => setStore(readStore()), []);

  const start = (config: QuizConfig) => {
    const questions = buildQuiz(config, lang);
    if (questions.length) setView({ name: 'play', config, questions });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const quick = (category?: Category) =>
    start({ mode: category ? 'category' : 'mixed', category, difficulty: difficulty === 'mixed' ? undefined : difficulty, count: category ? 6 : 10, seed: `${Date.now()}` });

  const finish = (config: QuizConfig, questions: PlayableQuestion[], answers: AnswerRecord[]) => {
    const result = summarize(config, answers);
    const next = readStore();
    const key = configKey(config);
    next.best[key] = Math.max(next.best[key] ?? 0, result.score);
    if (config.mode === 'daily') next.daily[today] = { score: result.score, correct: result.correct, total: result.total };
    writeStore(next);
    setStore(next);
    setView({ name: 'results', result, questions });
  };

  if (view.name === 'play') return <Game key={view.config.seed} config={view.config} questions={view.questions} onDone={finish} onQuit={() => setView({ name: 'home' })} />;
  if (view.name === 'results') return <Results result={view.result} questions={view.questions} onReplay={() => start({ ...view.result.config, seed: view.result.config.mode === 'daily' ? view.result.config.seed : `${Date.now()}` })} onHome={() => setView({ name: 'home' })} />;

  const daily = store.daily[today];
  const bestEntries = Object.entries(store.best).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const keyLabel = (key: string) => {
    if (key === 'daily') return t('daily');
    const [cat, diff] = key.split(':');
    return `${cat === 'all' ? t('all_categories') : t(`c_${cat}`)} · ${t(`d_${diff === 'mixed' ? 'mixed' : diff}`)}`;
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-wydad-charcoal text-white">
        <div className="pointer-events-none absolute -start-20 top-0 h-[420px] w-[420px] rounded-full bg-wydad-logo/40 blur-[120px]" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:px-8">
          <div>
            <p className="font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white/60">{t('kicker')}</p>
            <h1 className="mt-3 font-condensed text-6xl font-extrabold uppercase italic leading-none rtl:not-italic sm:text-8xl">{t('title')}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">{t('intro')}</p>
          </div>
          {/* Daily challenge */}
          <div className="relative overflow-hidden rounded-2xl bg-wydad-logo p-7 shadow-2xl sm:p-8">
            <span className="absolute -end-6 -top-6 text-[9rem] leading-none opacity-15" aria-hidden>
              ⚡
            </span>
            <p className="font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white/80">{today}</p>
            <h2 className="mt-1 font-condensed text-4xl font-extrabold uppercase italic leading-none rtl:not-italic">{t('daily')}</h2>
            {daily ? (
              <>
                <p className="mt-4 font-condensed text-5xl font-extrabold tabular-nums">{t('points', { n: String(daily.score) })}</p>
                <p className="mt-1 text-white/85">
                  {t('daily_done')} · {t('correct_count', { c: String(daily.correct), n: String(daily.total) })}
                </p>
                <p className="mt-4 text-sm text-white/75">{t('come_back')}</p>
              </>
            ) : (
              <>
                <p className="mt-3 text-white/85">{t('daily_text')}</p>
                <button type="button" onClick={() => start(dailyConfig())} className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-white px-7 font-condensed text-xl font-extrabold uppercase text-wydad-logo transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50">
                  {t('start')}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-condensed text-4xl font-extrabold uppercase italic leading-none text-fg rtl:not-italic">{t('play')}</h2>
          <div role="radiogroup" aria-label={t('difficulty')} className="flex flex-wrap gap-1 rounded-xl bg-surface-secondary p-1">
            {(['mixed', 'easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={difficulty === d}
                onClick={() => setDifficulty(d)}
                className={`min-h-10 rounded-lg px-4 font-condensed text-base font-bold uppercase transition-colors ${difficulty === d ? 'bg-wydad-logo text-white' : 'text-fg hover:bg-fg/5'}`}
              >
                {t(`d_${d}`)}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <button type="button" onClick={() => quick()} className="group flex h-full w-full flex-col items-start rounded-2xl bg-wydad-charcoal p-6 text-start text-white transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wydad-logo/40">
              <span className="text-4xl" aria-hidden>🔴</span>
              <span className="mt-4 font-condensed text-3xl font-extrabold uppercase leading-none">{t('all_categories')}</span>
              <span className="mt-2 text-sm text-white/65">{t('questions', { n: '10' })}</span>
            </button>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c}>
              <button type="button" onClick={() => quick(c)} className="group flex h-full w-full flex-col items-start rounded-2xl border border-border bg-surface p-6 text-start transition hover:-translate-y-1 hover:border-wydad-logo focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wydad-logo/30">
                <span className="text-4xl" aria-hidden>{ICONS[c]}</span>
                <span className="mt-4 font-condensed text-3xl font-extrabold uppercase leading-none text-fg group-hover:text-wydad-red">{t(`c_${c}`)}</span>
                <span className="mt-2 text-sm text-fg-muted">{t('questions', { n: String(categoryCount(c)) })}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="best" className="rounded-2xl border border-border bg-surface p-6">
            <h2 id="best" className="font-condensed text-2xl font-extrabold uppercase text-fg">{t('best_local')}</h2>
            {bestEntries.length === 0 ? (
              <p className="mt-3 text-fg-muted">{t('no_local')}</p>
            ) : (
              <ol className="mt-4 divide-y divide-border">
                {bestEntries.map(([key, score]) => (
                  <li key={key} className="flex items-center justify-between py-2.5">
                    <span className="text-fg-secondary">{keyLabel(key)}</span>
                    <span className="font-condensed text-xl font-extrabold tabular-nums text-wydad-red">{t('points', { n: String(score) })}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
          <section aria-labelledby="board" className="rounded-2xl border-2 border-dashed border-border p-6">
            <h2 id="board" className="font-condensed text-2xl font-extrabold uppercase text-fg">{t('leaderboard')}</h2>
            <p className="mt-3 text-fg-secondary">{t('leaderboard_soon')}</p>
          </section>
        </div>
        <p className="mt-8 text-sm text-fg-muted">{t('sources_note')}</p>
      </div>
    </div>
  );
}

function Game({ config, questions, onDone, onQuit }: { config: QuizConfig; questions: PlayableQuestion[]; onDone: (c: QuizConfig, q: PlayableQuestion[], a: AnswerRecord[]) => void; onQuit: () => void }) {
  const t = useTranslations('quiz');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [picked, setPicked] = useState<AnswerRecord | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());
  const nextRef = useRef<HTMLButtonElement>(null);
  const q = questions[index];
  const score = answers.reduce((s, a) => s + a.points, 0);

  const choose = useCallback(
    (choice: number | null) => {
      if (picked) return;
      const { record, streak: next } = answerQuestion(q, choice, Date.now() - startedAt.current, streak);
      setPicked(record);
      setStreak(next);
      setAnswers((a) => [...a, record]);
    },
    [picked, q, streak],
  );

  // Countdown; time out = no answer
  useEffect(() => {
    if (picked) return;
    startedAt.current = Date.now();
    setElapsed(0);
    const id = setInterval(() => {
      const ms = Date.now() - startedAt.current;
      setElapsed(ms);
      if (ms >= TIME_LIMIT_MS) choose(null);
    }, 100);
    return () => clearInterval(id);
  }, [index, picked, choose]);

  useEffect(() => {
    if (picked) nextRef.current?.focus();
  }, [picked]);

  const next = () => {
    if (index + 1 >= questions.length) return onDone(config, questions, answers);
    setIndex(index + 1);
    setPicked(null);
  };

  // Keyboard: 1-4 to answer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!picked && n >= 1 && n <= q.choices.length) choose(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [picked, q, choose]);

  const remaining = Math.max(0, Math.ceil((TIME_LIMIT_MS - elapsed) / 1000));
  const progress = Math.min(1, elapsed / TIME_LIMIT_MS);

  return (
    <div className="min-h-[80vh] bg-wydad-charcoal text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={onQuit} className="text-sm font-semibold text-white/60 hover:text-white">
            ← {t('title')}
          </button>
          <div className="flex items-center gap-4 font-condensed text-lg font-bold uppercase">
            {streak > 1 && <span className="text-[#E8C468]">🔥 {t('streak', { n: String(streak) })}</span>}
            <span className="tabular-nums">{t('points', { n: String(score) })}</span>
          </div>
        </div>

        {/* Progress through the quiz */}
        <div className="mt-6 flex gap-1.5" aria-hidden>
          {questions.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < answers.length ? (answers[i].correct ? 'bg-emerald-400' : 'bg-white/30') : i === index ? 'bg-white' : 'bg-white/10'}`} />
          ))}
        </div>
        <p className="mt-3 font-condensed text-sm font-bold uppercase tracking-[0.14em] text-white/60">
          {t('question_of', { i: String(index + 1), n: String(questions.length) })} · {t(`c_${q.category}`)} · {t(`d_${q.difficulty}`)}
        </p>

        <h1 className="mt-4 font-condensed text-3xl font-extrabold leading-tight sm:text-4xl" aria-live="polite">
          {q.prompt}
        </h1>

        {/* Timer */}
        <div className="mt-6 flex items-center gap-3" role="timer" aria-label={t('time_left', { s: String(remaining) })}>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full rounded-full transition-[width] duration-100 ease-linear ${remaining <= 5 && !picked ? 'bg-wydad-logo' : 'bg-white'}`} style={{ width: `${(1 - (picked ? Math.min(1, picked.timeMs / TIME_LIMIT_MS) : progress)) * 100}%` }} />
          </div>
          <span className="w-10 text-end font-condensed text-lg font-bold tabular-nums">{t('time_left', { s: String(picked ? Math.max(0, Math.ceil((TIME_LIMIT_MS - picked.timeMs) / 1000)) : remaining) })}</span>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {q.choices.map((c, i) => {
            const isAnswer = i === q.answer;
            const isPicked = picked?.choice === i;
            const state = !picked ? 'idle' : isAnswer ? 'right' : isPicked ? 'wrong' : 'dim';
            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={!!picked}
                  onClick={() => choose(i)}
                  className={`flex min-h-16 w-full items-center gap-4 rounded-xl px-5 py-4 text-start text-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 ${
                    state === 'idle'
                      ? 'bg-white/[0.07] ring-1 ring-white/15 hover:-translate-y-0.5 hover:bg-white/[0.12]'
                      : state === 'right'
                        ? 'bg-emerald-500 text-white'
                        : state === 'wrong'
                          ? 'bg-wydad-logo text-white'
                          : 'bg-white/[0.04] text-white/40'
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-condensed text-base font-extrabold ${state === 'idle' ? 'bg-white/10' : 'bg-black/20'}`}>{i + 1}</span>
                  {c}
                </button>
              </li>
            );
          })}
        </ul>

        {picked && (
          <div className="mt-8 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10" role="status">
            <p className={`font-condensed text-2xl font-extrabold uppercase ${picked.correct ? 'text-emerald-400' : 'text-white'}`}>
              {picked.correct ? `${t('correct')} +${picked.points}` : picked.choice === null ? t('timeout') : t('wrong')}
            </p>
            {!picked.correct && <p className="mt-1 text-white/85">{t('answer_was', { a: q.choices[q.answer] })}</p>}
            <p className="mt-3 leading-relaxed text-white/75">{q.explanation}</p>
            <p className="mt-2 text-xs text-white/45">
              {t('source')} : {q.source}
            </p>
            <button ref={nextRef} type="button" onClick={next} className="mt-5 inline-flex min-h-12 items-center rounded-lg bg-white px-6 font-condensed text-lg font-extrabold uppercase text-wydad-logo focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50">
              {index + 1 >= questions.length ? t('see_results') : t('next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Results({ result, questions, onReplay, onHome }: { result: QuizResult; questions: PlayableQuestion[]; onReplay: () => void; onHome: () => void }) {
  const t = useTranslations('quiz');
  const [copied, setCopied] = useState(false);
  const band = verdict(result);
  const share = async () => {
    const text = `Quiz Wydadi — ${t('points', { n: String(result.score) })} (${result.correct}/${result.total}) 🔴⚪ ${location.origin}${location.pathname}`;
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Share sheet dismissed
    }
  };

  return (
    <div className="bg-wydad-charcoal text-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white/60">{result.config.mode === 'daily' ? t('daily') : t('results_title')}</p>
        <p className="mt-2 font-condensed text-7xl font-extrabold tabular-nums sm:text-8xl">{t('points', { n: String(result.score) })}</p>
        <p className="mt-2 text-xl text-white/85">{t('correct_count', { c: String(result.correct), n: String(result.total) })}</p>
        <p className="mt-1 font-condensed text-2xl font-extrabold uppercase text-[#E8C468]">{t(`r_${band}`)}</p>
        {result.bestStreak > 1 && <p className="mt-1 text-white/70">🔥 {t('streak', { n: String(result.bestStreak) })}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={onReplay} className="inline-flex min-h-12 items-center rounded-lg bg-wydad-logo px-6 font-condensed text-lg font-extrabold uppercase hover:bg-wydad-red-hover">
            {t('replay')}
          </button>
          <button type="button" onClick={onHome} className="inline-flex min-h-12 items-center rounded-lg bg-white px-6 font-condensed text-lg font-extrabold uppercase text-wydad-logo">
            {t('other_quiz')}
          </button>
          <button type="button" onClick={share} className="inline-flex min-h-12 items-center rounded-lg border border-white/25 px-6 font-condensed text-lg font-extrabold uppercase hover:bg-white/10" aria-live="polite">
            {copied ? t('copied') : t('share')}
          </button>
        </div>

        <h2 className="mt-12 font-condensed text-2xl font-extrabold uppercase">{t('review')}</h2>
        <ol className="mt-4 space-y-2">
          {result.answers.map((a, i) => {
            const q = questions.find((x) => x.id === a.questionId)!;
            return (
              <li key={a.questionId} className="flex gap-3 rounded-xl bg-white/[0.05] p-4">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${a.correct ? 'bg-emerald-500' : 'bg-wydad-logo'}`} aria-hidden>
                  {a.correct ? '✓' : '✗'}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">
                    {i + 1}. {q.prompt}
                  </span>
                  <span className="block text-sm text-white/65">{q.choices[q.answer]}</span>
                </span>
                <span className="ms-auto shrink-0 font-condensed font-bold tabular-nums text-white/70">+{a.points}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
