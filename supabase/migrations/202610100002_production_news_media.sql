-- Additive production image storage for Bengal Wave CMS.
-- Existing Preview uploads and article rows remain untouched.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values (
  'bengalwave-news-images',
  'bengalwave-news-images',
  true,
  8388608,
  array['image/webp']::text[]
)
on conflict (id) do nothing;

-- Public media metadata only for published and dated reports.
create policy "bw_production_published_media_read"
on public.media_assets for select to anon, authenticated
using (
  storage_path like 'bengalwave-news-images/%'
  and exists(
    select 1 from public.articles a
    where a.hero_media_id=media_assets.id
      and a.status='published'
      and a.published_at<=now()
  )
);

-- Editorial role + user's own UUID directory are mandatory.
create policy "bw_production_media_upload"
on storage.objects for insert to authenticated
with check(
  bucket_id='bengalwave-news-images'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and (storage.extension(name))='webp'
  and public.has_cms_role(array['owner','editor','contributor']::public.cms_role[])
);
create policy "bw_production_media_owner_read"
on storage.objects for select to authenticated
using (
  bucket_id='bengalwave-news-images'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and public.has_cms_role(array['owner','editor','contributor']::public.cms_role[])
);
create policy "bw_production_media_owner_cleanup"
on storage.objects for delete to authenticated
using (
  bucket_id='bengalwave-news-images'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and public.has_cms_role(array['owner','editor','contributor']::public.cms_role[])
);
create policy "bw_production_media_uploader_update"
on public.media_assets for update to authenticated
using (
  uploaded_by=(select auth.uid())
  and storage_path like 'bengalwave-news-images/%'
  and public.has_cms_role(array['owner','editor','contributor']::public.cms_role[])
)
with check (
  uploaded_by=(select auth.uid())
  and storage_path like 'bengalwave-news-images/%'
  and public.has_cms_role(array['owner','editor','contributor']::public.cms_role[])
);
