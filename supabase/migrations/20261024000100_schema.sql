-- Wydad Athletic Club — content schema
--
-- Everything the club edits lives here. Live football data (Botola fixtures, standings, first-team
-- squad) stays in TheStatsAPI and is only *enriched* here (match_notes, player photos), so the site
-- never has two sources for the same fact.
--
-- Translated text is a jsonb object {"ar": "...", "fr": "...", "en": "..."} (type l10n below).


-- ── Shared types and helpers ─────────────────────────────────────────────────────────────

create type public.content_status as enum ('draft', 'published', 'archived');
create type public.sport as enum ('football', 'basketball', 'handball', 'swimming', 'boxing', 'fencing', 'other');
create type public.match_status as enum ('scheduled', 'live', 'finished', 'postponed', 'cancelled');

-- A translated string: an object whose values are strings, keyed by ar / fr / en only
create function public.is_l10n(value jsonb) returns boolean
language sql immutable as $$
  select value is null or (
    jsonb_typeof(value) = 'object'
    and not exists (
      select 1 from jsonb_each(value) e
      where e.key not in ('ar', 'fr', 'en') or jsonb_typeof(e.value) <> 'string'
    )
  )
$$;

create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end
$$;

-- ── Administrators ───────────────────────────────────────────────────────────────────────
-- Provisioned by hand (SQL editor / service role): signing up never makes anyone an admin.

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

-- ── Site ─────────────────────────────────────────────────────────────────────────────────

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  club_name jsonb not null default '{}' check (public.is_l10n(club_name)),
  tagline jsonb check (public.is_l10n(tagline)),
  logo_url text,
  favicon_url text,
  email text,
  phone text,
  address jsonb check (public.is_l10n(address)),
  -- [{ "network": "instagram", "url": "https://…" }]
  social_links jsonb not null default '[]' check (jsonb_typeof(social_links) = 'array'),
  -- [{ "name": "Kappa", "logo_url": "/images/sponsors/kappa.svg", "url": "https://…" }]
  partners jsonb not null default '[]' check (jsonb_typeof(partners) = 'array'),
  seo_title jsonb check (public.is_l10n(seo_title)),
  seo_description jsonb check (public.is_l10n(seo_description)),
  updated_at timestamptz not null default now()
);

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  -- main = side menu, bar = top bar links, footer_* = footer columns
  menu text not null check (menu in ('main', 'bar', 'footer_club', 'footer_services')),
  parent_id uuid references public.navigation_items (id) on delete cascade,
  -- Either a key of the `header` messages (translated by the app) or a custom label
  label_key text,
  label jsonb check (public.is_l10n(label)),
  href text,
  sort integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint navigation_label_present check (label_key is not null or label is not null),
  constraint navigation_not_own_parent check (parent_id is distinct from id)
);
create index navigation_items_menu_idx on public.navigation_items (menu, parent_id, sort);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  message jsonb not null check (public.is_l10n(message)),
  link_url text,
  link_label jsonb check (public.is_l10n(link_label)),
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default false,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcement_dates check (ends_at is null or starts_at is null or ends_at > starts_at)
);

-- Home page sections the club can hide, reorder or retitle (a fixed list: no free-form code)
create table public.home_sections (
  key text primary key check (key in ('fixtures', 'standings', 'brand', 'news', 'instagram')),
  visible boolean not null default true,
  sort integer not null default 0,
  title jsonb check (public.is_l10n(title)),
  updated_at timestamptz not null default now()
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  public_url text not null,
  mime_type text not null,
  size_bytes integer not null check (size_bytes > 0),
  width integer,
  height integer,
  alt jsonb check (public.is_l10n(alt)),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (bucket, path)
);

-- CMS pages at /p/{slug}; body is a list of validated blocks (heading, paragraph, image, quote)
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title jsonb not null check (public.is_l10n(title)),
  summary jsonb check (public.is_l10n(summary)),
  cover_url text,
  blocks jsonb not null default '[]' check (jsonb_typeof(blocks) = 'array'),
  seo_title jsonb check (public.is_l10n(seo_title)),
  seo_description jsonb check (public.is_l10n(seo_description)),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── News ─────────────────────────────────────────────────────────────────────────────────

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(_[a-z0-9]+)*$'),
  name jsonb not null check (public.is_l10n(name)),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.news_articles (
  id uuid primary key default gen_random_uuid(),
  -- Id of the article before the move to Supabase (keeps old links and makes the import idempotent)
  legacy_id text unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title jsonb not null check (public.is_l10n(title)),
  excerpt jsonb not null default '{}' check (public.is_l10n(excerpt)),
  body jsonb not null default '{}' check (public.is_l10n(body)),
  category_id uuid not null references public.categories (id) on delete restrict,
  sport public.sport not null default 'football',
  cover_url text,
  cover_position text,
  cover_orientation text check (cover_orientation in ('landscape', 'portrait')),
  -- TheStatsAPI match id (mt_…) or a manual match slug, for match reports
  match_id text,
  author text,
  read_time_minutes integer not null default 2 check (read_time_minutes between 1 and 60),
  seo_title jsonb check (public.is_l10n(seo_title)),
  seo_description jsonb check (public.is_l10n(seo_description)),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_needs_date check (status <> 'published' or published_at is not null)
);
create index news_articles_feed_idx on public.news_articles (status, published_at desc);
create index news_articles_category_idx on public.news_articles (category_id);

-- ── Galleries ────────────────────────────────────────────────────────────────────────────

create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title jsonb not null check (public.is_l10n(title)),
  description jsonb check (public.is_l10n(description)),
  cover_url text,
  status public.content_status not null default 'draft',
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  image_url text not null,
  caption jsonb check (public.is_l10n(caption)),
  width integer,
  height integer,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gallery_id, image_url)
);
create index gallery_items_order_idx on public.gallery_items (gallery_id, sort);

-- ── Sport ────────────────────────────────────────────────────────────────────────────────

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sport public.sport not null,
  name text not null,
  short_name text,
  season text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sport public.sport not null,
  name text not null,
  short_name text,
  logo_url text,
  -- TheStatsAPI team id (tm_…) when the club exists there; crests are shared with football
  external_id text,
  is_wydad boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fixtures no data feed covers (basketball, other sections). Botola football comes from TheStatsAPI.
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sport public.sport not null,
  competition_id uuid not null references public.competitions (id) on delete restrict,
  home_team_id uuid not null references public.teams (id) on delete restrict,
  away_team_id uuid not null references public.teams (id) on delete restrict,
  kickoff timestamptz not null,
  venue text,
  matchday integer check (matchday > 0),
  match_status public.match_status not null default 'scheduled',
  score_home integer check (score_home >= 0),
  score_away integer check (score_away >= 0),
  tickets_url text,
  highlight_youtube_id text,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint different_teams check (home_team_id <> away_team_id)
);
create index matches_kickoff_idx on public.matches (sport, kickoff);

-- Hand-entered facts added to a TheStatsAPI match (officials, goals the feed lacks, highlights)
create table public.match_notes (
  id uuid primary key default gen_random_uuid(),
  external_match_id text not null unique check (external_match_id ~ '^mt_[0-9]+$'),
  venue text,
  -- [{ "role": "referee" | "var", "name": "…", "name_ar": "…" }]
  officials jsonb not null default '[]' check (jsonb_typeof(officials) = 'array'),
  -- [{ "side": "home" | "away", "player": "…", "minute": 62, "penalty": true, "own_goal": false }]
  goals jsonb not null default '[]' check (jsonb_typeof(goals) = 'array'),
  -- YouTube id of the official highlights, when the automatic Arryadia lookup misses them
  highlight_youtube_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Manual league tables (basketball…); the Botola table comes from TheStatsAPI
create table public.standings (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete restrict,
  position integer not null check (position > 0),
  played integer not null default 0 check (played >= 0),
  won integer not null default 0 check (won >= 0),
  drawn integer not null default 0 check (drawn >= 0),
  lost integer not null default 0 check (lost >= 0),
  points_for integer not null default 0,
  points_against integer not null default 0,
  points integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (competition_id, team_id)
);

-- Players the feed does not cover (basketball and other sections) and photo overrides for
-- TheStatsAPI players (external_id = pl_…)
create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams (id) on delete set null,
  sport public.sport not null,
  external_id text unique,
  name text not null,
  name_ar text,
  number integer check (number between 0 and 99),
  position text,
  nationality jsonb check (public.is_l10n(nationality)),
  birth_date date,
  photo_url text,
  status public.content_status not null default 'draft',
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index players_team_idx on public.players (sport, team_id, sort);

create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  -- first_team, espoirs, basketball, women… (the page that lists them)
  squad text not null default 'first_team' check (squad ~ '^[a-z_]+$'),
  name text not null,
  name_ar text,
  role jsonb not null check (public.is_l10n(role)),
  category text not null check (category in ('technical', 'team_managers', 'performance', 'medical', 'video', 'equipment')),
  is_head boolean not null default false,
  nationality jsonb check (public.is_l10n(nationality)),
  photo_url text,
  statement_url text,
  status public.content_status not null default 'draft',
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index staff_one_head_per_squad on public.staff_members (squad) where is_head and status = 'published';

-- Notable news shown on a section page (swimming, boxing…), retelling an official post
create table public.section_highlights (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('swimming', 'boxing', 'fencing', 'handball', 'women', 'academy', 'basketball')),
  title jsonb not null check (public.is_l10n(title)),
  text jsonb not null check (public.is_l10n(text)),
  image_url text not null,
  source_url text not null,
  cta_label jsonb check (public.is_l10n(cta_label)),
  published_on date not null,
  status public.content_status not null default 'draft',
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index section_highlights_idx on public.section_highlights (section, status, published_on desc);

-- ── Memberships ──────────────────────────────────────────────────────────────────────────
-- Offers only. Payments, if any, go through a payment provider: never store card data here.

create table public.membership_offers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  tier text not null check (tier in ('bronze', 'silver', 'gold', 'other')),
  name jsonb not null check (public.is_l10n(name)),
  description jsonb check (public.is_l10n(description)),
  price_amount numeric(12, 2) check (price_amount >= 0),
  currency text not null default 'MAD' check (currency ~ '^[A-Z]{3}$'),
  -- [{ "ar": "…", "fr": "…", "en": "…" }, …]
  benefits jsonb not null default '[]' check (jsonb_typeof(benefits) = 'array'),
  image_url text,
  cta_url text,
  availability text not null default 'available' check (availability in ('available', 'sold_out', 'coming_soon')),
  status public.content_status not null default 'draft',
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── updated_at triggers ──────────────────────────────────────────────────────────────────

do $$
declare t text;
begin
  foreach t in array array[
    'site_settings', 'navigation_items', 'announcements', 'home_sections', 'pages', 'categories',
    'news_articles', 'galleries', 'gallery_items', 'competitions', 'teams', 'matches', 'match_notes',
    'standings', 'players', 'staff_members', 'section_highlights', 'membership_offers'
  ] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end
$$;
