import { z } from 'zod';

/** Topics a subscriber can pick (same list as the database check constraint) */
export const TOPICS = ['club', 'matches', 'interviews', 'live', 'community', 'exclusive'] as const;
export type Topic = (typeof TOPICS)[number];

/** Version of the consent wording; stored with each subscription */
export const CONSENT_VERSION = 'newsletter-consent-v1';

/** A real person takes more than this to fill the form; bots usually don't */
export const MIN_FILL_MS = 1500;

export const SubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email(),
  topics: z.array(z.enum(TOPICS)).min(1).max(TOPICS.length),
  locale: z.enum(['ar', 'fr', 'en']).default('fr'),
  consent: z.literal(true),
  source: z.string().trim().max(40).regex(/^[a-z0-9_-]*$/).optional(),
  /** Honeypot: hidden field that people leave empty */
  website: z.string().max(0).optional().or(z.literal('')),
  /** When the form was shown (ms since epoch) */
  startedAt: z.number().int().positive(),
});
export type SubscribeInput = z.infer<typeof SubscribeSchema>;

export type SubscribeResult =
  /** Saved as pending; `emailSent` says whether the confirmation email really went out */
  | { result: 'pending'; emailSent: boolean }
  /** The address already exists (confirmed or pending): same answer either way */
  | { result: 'exists' }
  | { result: 'error'; code: 'invalid' | 'consent' | 'topics' | 'rate_limited' | 'unavailable' | 'server' };
