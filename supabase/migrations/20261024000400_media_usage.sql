-- Where a media URL is still used, so the admin can refuse to delete a file the site shows.
-- Looks at every column that stores an image URL, including inside jsonb (page blocks, partners).
-- Admin-only: raises for anyone else.

create function public.media_usage(target_url text)
returns table (table_name text, row_count bigint)
language plpgsql stable security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  select u.t, u.n from (
    select 'news_articles'::text as t, count(*) as n from news_articles where cover_url = target_url
    union all select 'pages', count(*) from pages where cover_url = target_url or blocks::text like '%' || target_url || '%'
    union all select 'galleries', count(*) from galleries where cover_url = target_url
    union all select 'gallery_items', count(*) from gallery_items where image_url = target_url
    union all select 'competitions', count(*) from competitions where logo_url = target_url
    union all select 'teams', count(*) from teams where logo_url = target_url
    union all select 'players', count(*) from players where photo_url = target_url
    union all select 'staff_members', count(*) from staff_members where photo_url = target_url
    union all select 'section_highlights', count(*) from section_highlights where image_url = target_url
    union all select 'membership_offers', count(*) from membership_offers where image_url = target_url
    union all select 'site_settings', count(*) from site_settings
      where logo_url = target_url or favicon_url = target_url or partners::text like '%' || target_url || '%'
  ) u
  where u.n > 0;
end
$$;
revoke all on function public.media_usage(text) from public;
grant execute on function public.media_usage(text) to authenticated;
