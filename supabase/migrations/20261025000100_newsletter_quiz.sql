-- Newsletter subscribers and the Quiz Wydadi foundations.
--
-- Security: RLS is enabled with no policy on the newsletter tables, so the public API (anon and
-- signed-in keys) can neither read nor write them. Only the site's server routes write, with the
-- service role key, after validating and rate-limiting the request.

-- ── Newsletter ──────────────────────────────────────────────────────────────────────────

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  -- One row per address, whatever its case
  email_normalized text generated always as (lower(email)) stored unique,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  topics text[] not null default '{}'
    check (topics <@ array['club', 'matches', 'interviews', 'live', 'community', 'exclusive']::text[]),
  locale text not null default 'fr' check (locale in ('ar', 'fr', 'en')),
  source text check (length(source) <= 40),
  -- Consent: when and to which wording (GDPR / Moroccan law 09-08)
  consent_at timestamptz not null,
  consent_text text not null,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  -- Double opt-in: only the SHA-256 of the emailed token is stored
  confirm_token_hash text,
  confirm_expires_at timestamptz,
  confirm_sent_at timestamptz,
  -- Long-lived token for the unsubscribe link in every email
  unsubscribe_token text not null unique,
  ip_hash text,
  user_agent text check (length(user_agent) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists newsletter_subscribers_confirm_idx on public.newsletter_subscribers (confirm_token_hash) where confirm_token_hash is not null;
create index if not exists newsletter_subscribers_status_idx on public.newsletter_subscribers (status);

-- Submissions, for rate limiting and abuse review (hashed identifiers only)
create table if not exists public.newsletter_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('subscribe', 'confirm', 'unsubscribe', 'rejected')),
  ip_hash text,
  email_hash text,
  created_at timestamptz not null default now()
);
create index if not exists newsletter_events_ip_idx on public.newsletter_events (ip_hash, created_at desc);
create index if not exists newsletter_events_email_idx on public.newsletter_events (email_hash, created_at desc);

alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_events enable row level security;
-- No policies on purpose: no access through the public API.
revoke all on public.newsletter_subscribers from anon, authenticated;
revoke all on public.newsletter_events from anon, authenticated;

-- ── Quiz Wydadi (prepared for persistence; the site currently ships its verified bank in code) ──

create table if not exists public.quiz_questions (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  category text not null check (category in ('history', 'honours', 'legends', 'stadium', 'supporters')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  -- { "fr": "...", "en": "...", "ar": "..." }
  prompt jsonb not null,
  -- [{ "fr": "...", "en": "...", "ar": "..." }, …] — 2 to 6 choices
  choices jsonb not null check (jsonb_typeof(choices) = 'array' and jsonb_array_length(choices) between 2 and 6),
  answer_index smallint not null check (answer_index >= 0),
  explanation jsonb,
  -- Where the fact was checked
  source text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint answer_in_range check (answer_index < jsonb_array_length(choices))
);

-- Finished games; feeds a leaderboard once supporter accounts exist
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  mode text not null check (mode in ('daily', 'category', 'mixed')),
  category text,
  difficulty text,
  score integer not null check (score >= 0),
  correct integer not null check (correct >= 0),
  total integer not null check (total > 0 and correct <= total),
  duration_ms integer check (duration_ms >= 0),
  played_on date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists quiz_attempts_board_idx on public.quiz_attempts (mode, played_on, score desc);

alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
-- Published questions are public; attempts are only readable/writable by their owner
drop policy if exists "public read published questions" on public.quiz_questions;
create policy "public read published questions" on public.quiz_questions for select to anon, authenticated using (status = 'published');
drop policy if exists "own attempts" on public.quiz_attempts;
create policy "own attempts" on public.quiz_attempts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
