-- Bengal Wave: dedicated PREVIEW-only news image storage.
-- This adds a new isolated bucket. It does not modify any published article,
-- production deployment, or existing media. It can be applied independently.
-- All access policies are limited to this exact bucket and CMS roles.

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values (
  'bengalwave-preview-news-images',
  'bengalwave-preview-news-images',
  true,
  8388608,
  array['image/webp']::text[]
)
on conflict (id) do nothing;

-- Public visitors may read metadata ONLY for media actually attached to
-- published news. Unpublished media cannot be enumerated from the DB.
create policy "bw_preview_published_media_read"
on public.media_assets for select to anon, authenticated
using (
  storage_path like 'bengalwave-preview-news-images/%'
  and exists (
    select 1 from public.articles a
    where a.hero_media_id = media_assets.id
      and a.status = 'published'
      and a.published_at <= now()
  )
);

-- No anonymous uploads. Storage credentials come from each signed-in editor;
-- a browser-supplied role/author/path cannot grant upload permission.
create policy "bw_preview_media_upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'bengalwave-preview-news-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (storage.extension(name)) = 'webp'
  and public.has_cms_role(
    array['owner','editor','contributor']::public.cms_role[]
  )
);

-- This also allows failed uploads to be cleaned up by their uploader.
create policy "bw_preview_media_owner_read"
on storage.objects for select to authenticated
using (
  bucket_id = 'bengalwave-preview-news-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and public.has_cms_role(
    array['owner','editor','contributor']::public.cms_role[]
  )
);
create policy "bw_preview_media_owner_cleanup"
on storage.objects for delete to authenticated
using (
  bucket_id = 'bengalwave-preview-news-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and public.has_cms_role(
    array['owner','editor','contributor']::public.cms_role[]
  )
);

-- The bucket is public because published news photographs are public.
-- Each object has an unpredictable UUID directory. Draft article text and
-- editor-only metadata are still restricted by the existing article RLS.

-- Contributors may revise metadata for media they uploaded, while editorial
-- roles can already modify any asset via the existing policy.
create policy "bw_preview_media_uploader_update"
on public.media_assets for update to authenticated
using (
  uploaded_by = (select auth.uid())
  and storage_path like 'bengalwave-preview-news-images/%'
  and public.has_cms_role(array['owner','editor','contributor']::public.cms_role[])
)
with check (
  uploaded_by = (select auth.uid())
  and storage_path like 'bengalwave-preview-news-images/%'
  and public.has_cms_role(array['owner','editor','contributor']::public.cms_role[])
);
