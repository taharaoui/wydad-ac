-- Wydad Live, Community, Quiz Wydadi and the newsletter join the CMS-driven navigation and home page.
--
-- Only a database that already holds the seeded content is touched: a fresh one gets these rows
-- from the seed. Rows use the ids scripts/seed.ts gives them (md5 of the item's path), and
-- `on conflict do nothing` keeps anything the newsroom has already edited.

-- ── Home: newsletter band between the Gold showcase and Instagram ──
alter table public.home_sections drop constraint if exists home_sections_key_check;
alter table public.home_sections
  add constraint home_sections_key_check check (key in ('fixtures', 'standings', 'brand', 'news', 'newsletter', 'instagram'));
insert into public.home_sections (key, visible, sort)
select 'newsletter', true, 35 where exists (select 1 from public.home_sections)
on conflict (key) do nothing;

-- ── Bar and footer ──
insert into public.navigation_items (id, menu, label_key, href, sort, visible, parent_id)
select md5('nav:' || v.menu || ':/' || v.key)::uuid, v.menu, v.key, v.href, v.sort, true, null
from (values
  ('bar', 'wydad_live', '/live', 20),
  ('footer_club', 'wydad_live', '/live', 35),
  ('footer_services', 'community_hub', '/community', 50),
  ('footer_services', 'quiz', '/quiz', 60),
  ('footer_services', 'newsletter', '/newsletter', 70)
) as v (menu, key, href, sort)
where exists (select 1 from public.navigation_items n where n.menu = v.menu)
on conflict (id) do nothing;

-- ── Main menu, under Fans ──
insert into public.navigation_items (id, menu, label_key, href, sort, visible, parent_id)
select md5('nav:main:nav:main:/fans/' || v.key)::uuid, 'main', v.key, v.href, v.sort, true, md5('nav:main:/fans')::uuid
from (values ('wydad_live', '/live', 10), ('community_hub', '/community', 40), ('quiz', '/quiz', 50), ('newsletter', '/newsletter', 60)) as v (key, href, sort)
where exists (select 1 from public.navigation_items where id = md5('nav:main:/fans')::uuid)
on conflict (id) do nothing;

-- The podcasts and community anchors on /fans gave way to /live and /community; hidden only if untouched
update public.navigation_items set visible = false
where menu = 'main' and parent_id = md5('nav:main:/fans')::uuid
  and (label_key, href) in (('podcasts', '/fans#podcasts'), ('community', '/fans#community'));
