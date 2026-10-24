-- Storage buckets for the site's media. Files are public to read (they are shown on the site);
-- only administrators upload, replace or delete. Each bucket only accepts web images, 8 MB max
-- (also enforced by the admin upload action before anything reaches Storage).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('site-assets', 'site-assets', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('news',        'news',        true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('people',      'people',      true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('galleries',   'galleries',   true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "public read site media" on storage.objects for select to anon, authenticated
  using (bucket_id in ('site-assets', 'news', 'people', 'galleries'));

create policy "admin upload site media" on storage.objects for insert to authenticated
  with check (bucket_id in ('site-assets', 'news', 'people', 'galleries') and public.is_admin());

create policy "admin update site media" on storage.objects for update to authenticated
  using (bucket_id in ('site-assets', 'news', 'people', 'galleries') and public.is_admin())
  with check (bucket_id in ('site-assets', 'news', 'people', 'galleries') and public.is_admin());

create policy "admin delete site media" on storage.objects for delete to authenticated
  using (bucket_id in ('site-assets', 'news', 'people', 'galleries') and public.is_admin());
