-- Row Level Security
--
-- Rules, for every table:
--   • the public (anon) and signed-in users read only what is meant to be public (published, visible,
--     within its dates);
--   • only administrators listed in admin_users write, and they read everything (drafts included);
--   • nobody can add themselves to admin_users through the API: that table has no write policy, so
--     rows are only added from the SQL editor or with the service role.

-- True when the caller is a provisioned administrator. security definer so it can read admin_users
-- without exposing it; search_path pinned so it cannot be hijacked.
create function public.is_admin() returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid())
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ── admin_users: an admin may see their own row (to know they are one); no API writes at all ──
alter table public.admin_users enable row level security;
create policy "admins read own row" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- ── Tables readable by everyone, written by admins ───────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['site_settings', 'home_sections', 'categories', 'competitions', 'teams', 'match_notes', 'standings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end
$$;

-- ── Tables with a publication status: the public sees published rows only ─────────────────
do $$
declare t text;
begin
  foreach t in array array['pages', 'galleries', 'matches', 'players', 'staff_members', 'section_highlights', 'membership_offers'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$create policy "public read published" on public.%I for select to anon, authenticated using (status = 'published' or public.is_admin())$p$, t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.is_admin())', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end
$$;

-- News: published and already due (scheduled articles stay hidden until their date)
alter table public.news_articles enable row level security;
create policy "public read published" on public.news_articles for select to anon, authenticated
  using ((status = 'published' and published_at <= now()) or public.is_admin());
create policy "admin insert" on public.news_articles for insert to authenticated with check (public.is_admin());
create policy "admin update" on public.news_articles for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.news_articles for delete to authenticated using (public.is_admin());

-- Gallery photos follow their gallery
alter table public.gallery_items enable row level security;
create policy "public read published" on public.gallery_items for select to anon, authenticated
  using (public.is_admin() or exists (select 1 from public.galleries g where g.id = gallery_id and g.status = 'published'));
create policy "admin insert" on public.gallery_items for insert to authenticated with check (public.is_admin());
create policy "admin update" on public.gallery_items for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.gallery_items for delete to authenticated using (public.is_admin());

-- Menus: visible items only
alter table public.navigation_items enable row level security;
create policy "public read visible" on public.navigation_items for select to anon, authenticated
  using (visible or public.is_admin());
create policy "admin insert" on public.navigation_items for insert to authenticated with check (public.is_admin());
create policy "admin update" on public.navigation_items for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.navigation_items for delete to authenticated using (public.is_admin());

-- Announcements: active and within their dates
alter table public.announcements enable row level security;
create policy "public read current" on public.announcements for select to anon, authenticated
  using (
    public.is_admin()
    or (active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()))
  );
create policy "admin insert" on public.announcements for insert to authenticated with check (public.is_admin());
create policy "admin update" on public.announcements for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.announcements for delete to authenticated using (public.is_admin());

-- Media library metadata: admins only (the files themselves are public through Storage URLs)
alter table public.media enable row level security;
create policy "admin read" on public.media for select to authenticated using (public.is_admin());
create policy "admin insert" on public.media for insert to authenticated with check (public.is_admin());
create policy "admin update" on public.media for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.media for delete to authenticated using (public.is_admin());
