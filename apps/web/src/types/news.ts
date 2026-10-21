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
  cover_image_url: z.string().optional(),
  published_at: z.string(), // ISO datetime
  read_time_minutes: z.number(),
  author: z.string().optional(),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;
