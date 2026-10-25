/**
 * Quiz Wydadi data model. No React and no browser APIs: the same types and engine can run in a
 * future mobile app (Expo / React Native) or on a server that records attempts.
 */
export type L10n = { fr: string; en: string; ar: string };
export type Lang = keyof L10n;

export const CATEGORIES = ['history', 'honours', 'legends', 'stadium', 'supporters'] as const;
export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  prompt: L10n;
  choices: L10n[];
  /** Index of the right choice in `choices` */
  answer: number;
  explanation: L10n;
  /** Where the fact was checked */
  source: string;
}

/** A question as served to a player: one language, choices shuffled, answer index remapped */
export interface PlayableQuestion {
  id: string;
  category: Category;
  difficulty: Difficulty;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
  source: string;
}

export type Mode = 'daily' | 'category' | 'mixed';

export interface QuizConfig {
  mode: Mode;
  category?: Category;
  difficulty?: Difficulty;
  count: number;
  /** Same seed, same questions in the same order (the daily challenge uses the date) */
  seed: string;
}

export interface AnswerRecord {
  questionId: string;
  /** null when time ran out */
  choice: number | null;
  correct: boolean;
  timeMs: number;
  points: number;
}

export interface QuizResult {
  config: QuizConfig;
  answers: AnswerRecord[];
  score: number;
  correct: number;
  total: number;
  bestStreak: number;
  durationMs: number;
}
