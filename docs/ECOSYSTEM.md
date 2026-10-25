# Wydad digital ecosystem: Wydad Live, Community, Newsletter, Quiz Wydadi

Branch `feature/wydad-digital-ecosystem`. Nothing here is merged or deployed.

## What is real, what is demo, what needs setup

| Feature | Real today | Demo (labelled "Démo") | Needs setup |
|---|---|---|---|
| **Wydad Live** `/live` | Official channel (@WACofficiel): videos, real view counts (YouTube feed), real live status (channel `/live` page, checked every 2 min) | Four show formats, their schedule and sample episodes; the partner creator seat | `LIVE_PARTNER_NAME` + `LIVE_PARTNER_YOUTUBE_CHANNEL_ID` to add the partner's channel (live status and replays become real) |
| **Community** `/community` | Page, value proposition, notify-me signup | Channel list illustration (no fake members or messages) | `NEXT_PUBLIC_DISCORD_URL` (must be a `discord.gg/…` or `discord.com/invite/…` link) |
| **Newsletter** `/newsletter`, home band, community | Signup saved in Supabase, duplicates, consent, rate limits, confirmation and unsubscribe links | — | `RESEND_API_KEY` + `NEWSLETTER_FROM_EMAIL` to send confirmation emails. Without them, signups stay `pending` and the site says no email was sent |
| **Quiz Wydadi** `/quiz` | 30 verified questions (5 categories × 3 levels), daily challenge, timer, scoring, explanations, sources | — | Leaderboard needs supporter accounts; scores stay on the device meanwhile |

## Architecture

- `src/lib/live/` types, providers (YouTube embed + live detection; Twitch and Kick embed builders ready), catalogue, data (`getLiveHub`). No React: reusable by a mobile app.
- `src/lib/newsletter/` schema (zod), tokens (only SHA-256 of the confirmation token is stored), mailer (Resend), service (subscribe / confirm / unsubscribe, rate limits).
- `src/app/api/newsletter/{subscribe,confirm,unsubscribe}` route handlers; the service-role client (`src/lib/supabase-service.ts`) is server-only.
- `src/lib/quiz/` types, verified bank, engine (seeded daily challenge, shuffling, scoring). Pure TypeScript, ready for React Native / Expo.
- `supabase/migrations/20261025000100_newsletter_quiz.sql`: `newsletter_subscribers`, `newsletter_events` (RLS on, no policy: no public API access), `quiz_questions` (public read when published), `quiz_attempts` (owner only).

## Newsletter security

- Double opt-in: link valid 48 h, single use; one-click unsubscribe (RFC 8058 headers on emails).
- Duplicates: one row per address (case-insensitive); existing addresses get the same generic answer.
- Abuse: hidden honeypot, minimum fill time, 5 requests / 15 min per IP and 3 per address (database + in-memory), cross-site posts refused, IPs and emails logged hashed.
- The site never says an email was sent unless the provider accepted it.

## Commands

```bash
npm run dev                          # http://localhost:3000
npm run test:unit -w apps/web        # quiz engine + newsletter validation
npm run test:db -w apps/web          # migration + RLS on in-memory Postgres
node apps/web/scripts/migrate.mjs    # apply supabase/migrations (needs SUPABASE_DB_URL)
npm run build -w apps/web
```

## Admin (next step)

The admin dashboard lives on `feat/admin-cms`. Once merged, the new tables plug into it as resources: shows / episodes / creators (move `lib/live/catalog.ts` to tables), `quiz_questions` (same shape as `lib/quiz/bank.ts`), newsletter subscribers (read-only list, export, campaigns).
