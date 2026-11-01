-- Editorial CMS: newsroom roles, a sport/team taxonomy, one language per article, responsive
-- validation before publication and an activity log.
--
-- Nothing is dropped: existing articles keep their three-language text (language = null means
-- "written in every language"), the old topic categories stay readable but inactive, and the
-- existing administrator keeps full rights.


-- ── Newsroom members: administrators and editors ─────────────────────────────────────────
-- admin_users becomes the newsroom: an administrator manages everything, an editor writes
-- articles and publishes only when an administrator allowed it (can_publish).

alter table public.admin_users
  add column role text not null default 'editor' check (role in ('admin', 'editor')),
  add column can_publish boolean not null default false,
  add column display_name text,
  add column email text,
  add column active boolean not null default true,
  add column onboarded_at timestamptz,
  add column invited_by uuid references auth.users (id) on delete set null,
  add column updated_at timestamptz not null default now();

-- Rows that exist today are the administrators provisioned by hand
update public.admin_users au
set role = 'admin', can_publish = true, email = u.email
from auth.users u
where u.id = au.user_id;

create trigger set_updated_at before update on public.admin_users for each row execute function public.set_updated_at();

-- An administrator: active member with the admin role (every admin-only policy uses this)
create or replace function public.is_admin() returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'admin' and active)
$$;

-- Any active newsroom member (administrator or editor)
create function public.is_staff() returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid() and active)
$$;

-- May put articles online: administrators, and editors an administrator authorised
create function public.staff_can_publish() returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid() and active and (role = 'admin' or can_publish))
$$;

revoke all on function public.is_staff() from public;
revoke all on function public.staff_can_publish() from public;
grant execute on function public.is_staff() to anon, authenticated;
grant execute on function public.staff_can_publish() to anon, authenticated;

-- A member marks the welcome tour as seen (their only write on admin_users)
create function public.mark_onboarded() returns void
language sql volatile security definer
set search_path = public, pg_temp
as $$
  update public.admin_users set onboarded_at = now() where user_id = auth.uid() and onboarded_at is null
$$;
revoke all on function public.mark_onboarded() from public;
grant execute on function public.mark_onboarded() to authenticated;

-- Administrators manage the newsroom; members still read their own row (policy from the RLS migration)
create policy "admins read all" on public.admin_users for select to authenticated using (public.is_admin());
create policy "admins insert" on public.admin_users for insert to authenticated with check (public.is_admin());
create policy "admins update" on public.admin_users for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete" on public.admin_users for delete to authenticated using (public.is_admin());

-- The club can never lock itself out: at least one active administrator remains
create function public.keep_one_admin() returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1 from public.admin_users
    where role = 'admin' and active and user_id is distinct from old.user_id
  ) and old.role = 'admin' and old.active
    and (tg_op = 'DELETE' or new.role <> 'admin' or not new.active) then
    raise exception 'last_admin: at least one active administrator must remain' using errcode = 'check_violation';
  end if;
  return coalesce(new, old);
end
$$;
create trigger keep_one_admin before update or delete on public.admin_users for each row execute function public.keep_one_admin();


-- ── Categories: groups (Football, Other sports, Club) and the categories inside them ──────

alter table public.categories
  add column kind text not null default 'category' check (kind in ('group', 'category')),
  add column parent_id uuid references public.categories (id) on delete restrict,
  add column sport public.sport,
  add column description jsonb check (public.is_l10n(description)),
  add column active boolean not null default true,
  add constraint categories_not_own_parent check (parent_id is distinct from id),
  add constraint categories_group_has_no_parent check (kind = 'category' or parent_id is null);
create index categories_parent_idx on public.categories (parent_id, sort);

-- The old topic categories stay for the public pages that still name them, but can't be chosen anymore
update public.categories set active = false where slug in ('match_report', 'transfer', 'interview', 'youth');

-- "club" becomes the Club group
update public.categories set kind = 'group', name = '{"fr":"Club","ar":"النادي","en":"Club"}', sort = 30 where slug = 'club';

insert into public.categories (id, slug, kind, name, sort) values
  (md5('category:football')::uuid, 'football', 'group', '{"fr":"Football","ar":"كرة القدم","en":"Football"}', 10),
  (md5('category:other_sports')::uuid, 'other_sports', 'group', '{"fr":"Autres sports","ar":"رياضات أخرى","en":"Other sports"}', 20),
  (md5('category:club')::uuid, 'club', 'group', '{"fr":"Club","ar":"النادي","en":"Club"}', 30)
on conflict (slug) do nothing;

insert into public.categories (id, slug, kind, parent_id, sport, name, description, sort)
select v.id::uuid, v.slug, 'category', (select id from public.categories where slug = v.parent), v.sport::public.sport, v.name::jsonb, v.description::jsonb, v.sort
from (values
  (md5('category:first_team'), 'first_team', 'football', 'football',
    '{"fr":"Équipe première","ar":"الفريق الأول","en":"First team"}',
    '{"fr":"L’équipe première masculine : matchs, résultats, transferts, entraînements, blessures et annonces officielles du groupe professionnel.","ar":"الفريق الأول للرجال: المباريات والنتائج والانتقالات والتداريب والإصابات والبلاغات الرسمية الخاصة بالفريق المحترف.","en":"The senior men’s team: matches, results, transfers, training, injuries and official news about the professional squad."}', 10),
  (md5('category:espoirs'), 'espoirs', 'football', 'football',
    '{"fr":"Espoirs (U23)","ar":"الأمل (أقل من 23 سنة)","en":"Espoirs (U23)"}',
    '{"fr":"L’équipe Espoirs : championnat Espoirs, jeunes joueurs proches du groupe professionnel, développement et promotions.","ar":"فريق الأمل: بطولة الأمل، اللاعبون الشباب القريبون من الفريق الأول، التكوين والترقيات.","en":"The Espoirs team: Espoirs league, young players close to the first team, development and promotions."}', 20),
  (md5('category:women'), 'women', 'football', 'football',
    '{"fr":"Football féminin","ar":"كرة القدم النسوية","en":"Women’s football"}',
    '{"fr":"L’équipe féminine : matchs, joueuses, recrutements et annonces de la section.","ar":"الفريق النسوي: المباريات واللاعبات والانتدابات وبلاغات الفرع.","en":"The women’s team: matches, players, signings and section announcements."}', 30),
  (md5('category:basketball'), 'basketball', 'other_sports', 'basketball',
    '{"fr":"Basketball","ar":"كرة السلة","en":"Basketball"}',
    '{"fr":"La section basket : matchs, résultats, compétitions, joueurs et vie de l’équipe.","ar":"فرع كرة السلة: المباريات والنتائج والمنافسات واللاعبون وأخبار الفريق.","en":"The basketball section: games, results, competitions, players and team news."}', 10),
  (md5('category:club_news'), 'club_news', 'club', null,
    '{"fr":"Vie du club","ar":"أخبار النادي","en":"Club news"}',
    '{"fr":"Informations générales et institutionnelles : partenaires, supporters, infrastructures, événements et vie de l’institution.","ar":"أخبار عامة ومؤسساتية: الشركاء والجماهير والمنشآت والفعاليات وحياة المؤسسة.","en":"General and institutional news: partners, supporters, facilities, events and life of the club."}', 10),
  (md5('category:academy'), 'academy', 'club', null,
    '{"fr":"Académie & formation","ar":"الأكاديمية والتكوين","en":"Academy & youth"}',
    '{"fr":"L’académie et les catégories de jeunes : détections, inscriptions, tournois et parcours de formation.","ar":"الأكاديمية والفئات الصغرى: الانتقاء والتسجيلات والدوريات ومسار التكوين.","en":"The academy and youth teams: trials, registrations, tournaments and development pathway."}', 20),
  (md5('category:official'), 'official', 'club', null,
    '{"fr":"Communiqués officiels","ar":"بلاغات رسمية","en":"Official announcements"}',
    '{"fr":"Communiqués signés par le club : décisions de la direction, billetterie, sanctions, assemblées générales. Texte validé par la direction avant publication.","ar":"بلاغات صادرة عن النادي: قرارات الإدارة والتذاكر والعقوبات والجموع العامة. نص مصادق عليه من الإدارة قبل النشر.","en":"Statements issued by the club: board decisions, ticketing, sanctions, general assemblies. Text approved by the management before publication."}', 30)
) as v (id, slug, parent, sport, name, description, sort)
on conflict (slug) do nothing;

-- Articles written so far all concern the first team (coaches, referees, match report)
update public.news_articles
set category_id = (select id from public.categories where slug = 'first_team')
where category_id in (select id from public.categories where slug in ('club', 'match_report'));


-- ── Articles: one language, rich text, featured image standard ───────────────────────────

-- What decides how an article renders: its responsive check is only valid for this exact content
create function public.article_content_hash(
  language text, title jsonb, excerpt jsonb, body jsonb, body_format text,
  cover_url text, cover_mobile_url text, cover_position text
) returns text
language sql immutable as $$
  select md5(
    coalesce(language, '') || '|' || coalesce(title ->> language, '') || '|' || coalesce(excerpt ->> language, '') || '|' ||
    coalesce(body ->> language, '') || '|' || coalesce(body_format, '') || '|' || coalesce(cover_url, '') || '|' ||
    coalesce(cover_mobile_url, '') || '|' || coalesce(cover_position, '')
  )
$$;

alter table public.news_articles
  -- null: legacy article written in all three languages; otherwise the one language it's written in
  add column language text check (language in ('ar', 'fr', 'en')),
  add column body_format text not null default 'text' check (body_format in ('text', 'html')),
  add column featured boolean not null default false,
  add column cover_alt text,
  -- Optional portrait crop (4:5) shown on phones
  add column cover_mobile_url text,
  -- Source pixels behind the published crop (an upscaled image is detected, not hidden)
  add column cover_width integer check (cover_width > 0),
  add column cover_height integer check (cover_height > 0),
  add column created_by uuid default auth.uid() references auth.users (id) on delete set null,
  add column updated_by uuid references auth.users (id) on delete set null,
  add column submitted_at timestamptz,
  -- { hash, ok, checked_at, devices: [{ device, width, ok, issues[] }] }
  add column responsive_report jsonb check (responsive_report is null or jsonb_typeof(responsive_report) = 'object'),
  add column content_hash text generated always as (
    public.article_content_hash(language, title, excerpt, body, body_format, cover_url, cover_mobile_url, cover_position)
  ) stored;

-- A one-language article has its text in that language
alter table public.news_articles add constraint news_language_text check (
  language is null or (title ? language and length(trim(title ->> language)) > 0)
);
create index news_articles_language_idx on public.news_articles (language, status, published_at desc);
create index news_articles_author_idx on public.news_articles (created_by);

-- Authorship, workflow dates and the publication rules, whatever client writes the row
create function public.news_articles_editorial() returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  hash text;
  cat record;
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, auth.uid());
  else
    new.created_by := old.created_by;
  end if;
  new.updated_by := coalesce(auth.uid(), new.updated_by);

  if new.status = 'review' and (tg_op = 'INSERT' or old.status <> 'review') then
    new.submitted_at := now();
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;

  -- Publication rules for CMS articles (legacy multilingual articles predate them)
  if new.status = 'published' and new.language is not null then
    hash := public.article_content_hash(new.language, new.title, new.excerpt, new.body, new.body_format, new.cover_url, new.cover_mobile_url, new.cover_position);
    if tg_op = 'INSERT' or old.status <> 'published' or hash <> old.content_hash or new.category_id <> old.category_id then
      if length(trim(coalesce(new.excerpt ->> new.language, ''))) = 0 or length(trim(coalesce(new.body ->> new.language, ''))) = 0 then
        raise exception 'publish_rules: title, summary and text are required' using errcode = 'check_violation';
      end if;
      if new.cover_url is null or length(trim(coalesce(new.cover_alt, ''))) = 0 then
        raise exception 'publish_rules: a featured image with its alt text is required' using errcode = 'check_violation';
      end if;
      select kind, active into cat from public.categories where id = new.category_id;
      if cat.kind <> 'category' or not cat.active then
        raise exception 'publish_rules: choose an active category (not a group)' using errcode = 'check_violation';
      end if;
      if new.responsive_report is null
        or new.responsive_report ->> 'hash' is distinct from hash
        or (new.responsive_report ->> 'ok') is distinct from 'true' then
        raise exception 'publish_rules: the desktop, tablet and mobile checks must pass for this exact version' using errcode = 'check_violation';
      end if;
    end if;
  end if;
  return new;
end
$$;
create trigger news_articles_editorial before insert or update on public.news_articles
  for each row execute function public.news_articles_editorial();

-- Who may do what with articles (also enforced again by the server actions)
drop policy "public read published" on public.news_articles;
drop policy "admin insert" on public.news_articles;
drop policy "admin update" on public.news_articles;
drop policy "admin delete" on public.news_articles;

-- The public sees published articles that are due; the newsroom sees everything
create policy "read published or newsroom" on public.news_articles for select to anon, authenticated
  using ((status = 'published' and published_at <= now()) or public.is_staff());

-- Administrators: everything. Editors: their own articles, online only with publishing rights
create policy "newsroom insert" on public.news_articles for insert to authenticated with check (
  public.is_admin()
  or (public.is_staff() and created_by = auth.uid() and (status in ('draft', 'review') or public.staff_can_publish()))
);
create policy "newsroom update" on public.news_articles for update to authenticated
  using (public.is_admin() or (public.is_staff() and created_by = auth.uid() and (status in ('draft', 'review') or public.staff_can_publish())))
  with check (public.is_admin() or (public.is_staff() and created_by = auth.uid() and (status in ('draft', 'review') or public.staff_can_publish())));
create policy "newsroom delete" on public.news_articles for delete to authenticated
  using (public.is_admin() or (public.is_staff() and created_by = auth.uid() and status in ('draft', 'review')));


-- ── Previews: the editor's current version, rendered and checked before it is saved ──────

create table public.article_previews (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.news_articles (id) on delete cascade,
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- The article fields as typed in the editor (already validated and sanitised by the server)
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  content_hash text not null,
  report jsonb,
  created_at timestamptz not null default now()
);
create index article_previews_owner_idx on public.article_previews (created_by, created_at desc);
alter table public.article_previews enable row level security;
create policy "own previews" on public.article_previews for all to authenticated
  using (public.is_staff() and created_by = auth.uid())
  with check (public.is_staff() and created_by = auth.uid());
create policy "admins read previews" on public.article_previews for select to authenticated using (public.is_admin());


-- ── Editorial activity: who created, submitted, published or removed what ────────────────

create table public.editorial_activity (
  id bigint generated always as identity primary key,
  article_id uuid,
  article_title text,
  action text not null check (action in ('created', 'updated', 'submitted', 'published', 'scheduled', 'unpublished', 'deleted')),
  actor_id uuid references auth.users (id) on delete set null,
  actor_name text,
  created_at timestamptz not null default now()
);
create index editorial_activity_recent_idx on public.editorial_activity (created_at desc);
alter table public.editorial_activity enable row level security;
-- Read by the newsroom; written only by the trigger below (no write policy)
create policy "newsroom read" on public.editorial_activity for select to authenticated using (public.is_staff());

create function public.log_editorial_activity() returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  r public.news_articles;
  act text;
  who text;
  title text;
begin
  r := coalesce(new, old);
  if tg_op = 'INSERT' then
    act := case when new.status = 'published' then (case when new.published_at > now() then 'scheduled' else 'published' end)
                when new.status = 'review' then 'submitted' else 'created' end;
  elsif tg_op = 'DELETE' then
    act := 'deleted';
  elsif new.status <> old.status then
    act := case new.status when 'published' then (case when new.published_at > now() then 'scheduled' else 'published' end)
                           when 'review' then 'submitted'
                           else (case when old.status = 'published' then 'unpublished' else 'updated' end) end;
  else
    act := 'updated';
    -- Autosave writes often: one "updated" entry per person and article every 15 minutes
    if exists (
      select 1 from public.editorial_activity
      where article_id = r.id and actor_id is not distinct from auth.uid() and action = 'updated' and created_at > now() - interval '15 minutes'
    ) then
      return null;
    end if;
  end if;

  select coalesce(display_name, email) into who from public.admin_users where user_id = auth.uid();
  title := coalesce(r.title ->> r.language, r.title ->> 'fr', r.title ->> 'ar', r.title ->> 'en');
  insert into public.editorial_activity (article_id, article_title, action, actor_id, actor_name)
  values (r.id, title, act, auth.uid(), who);
  return null;
end
$$;
create trigger log_editorial_activity after insert or update or delete on public.news_articles
  for each row execute function public.log_editorial_activity();


-- ── Media: editors upload article images ─────────────────────────────────────────────────

drop policy "admin read" on public.media;
drop policy "admin insert" on public.media;
drop policy "admin update" on public.media;
drop policy "admin delete" on public.media;
create policy "newsroom read" on public.media for select to authenticated using (public.is_staff());
create policy "newsroom insert" on public.media for insert to authenticated
  with check (public.is_admin() or (public.is_staff() and bucket = 'news' and created_by = auth.uid()));
create policy "admin or owner update" on public.media for update to authenticated
  using (public.is_admin() or (public.is_staff() and created_by = auth.uid()))
  with check (public.is_admin() or (public.is_staff() and created_by = auth.uid()));
create policy "admin delete" on public.media for delete to authenticated using (public.is_admin());

create policy "newsroom upload news images" on storage.objects for insert to authenticated
  with check (bucket_id = 'news' and public.is_staff());
