import { z } from 'zod';

export const NewsCategoryEnum = z.enum(['match_report', 'transfer', 'club', 'interview', 'youth']);

export const NewsArticleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.object({
    ar: z.string(),
    fr: z.string(),
    en: z.string(),
  }),
  excerpt: z.object({
    ar: z.string(),
    fr: z.string(),
    en: z.string(),
  }),
  body: z.object({
    ar: z.string(),
    fr: z.string(),
    en: z.string(),
  }),
  category: NewsCategoryEnum,
  /** Section the story is about; football when omitted */
  sport: z.enum(['football', 'basketball']).optional(),
  cover_image_url: z.string().optional(),
  /** CSS object-position for crops of the cover, e.g. "center 78%" */
  cover_position: z.string().optional(),
  /** Portrait covers (club graphics) are shown as a poster in the hero instead of full-bleed */
  cover_orientation: z.enum(['landscape', 'portrait']).optional(),
  /** Linked match, for match reports (opens the match centre) */
  match_id: z.string().optional(),
  published_at: z.string(), // ISO datetime
  read_time_minutes: z.number(),
  author: z.string().optional(),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;
