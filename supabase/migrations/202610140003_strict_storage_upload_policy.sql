-- Tighten authenticated direct Storage uploads: only the exact folder and
-- filenames that the server-side Sharp image pipeline creates are accepted.
-- This is not a claim to verify file bytes; Content-Type may be user supplied.
-- All existing uploaded objects were checked for the same naming convention.
drop policy if exists bw_production_media_upload on storage.objects;
create policy bw_production_media_upload
on storage.objects for insert to authenticated
with check (
  bucket_id='bengalwave-news-images'
  and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/(full|thumb)[.]webp$'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and storage.extension(name)='webp'
  and public.has_cms_role(array['owner','editor','contributor']::public.cms_role[])
);

drop policy if exists bw_preview_media_upload on storage.objects;
create policy bw_preview_media_upload
on storage.objects for insert to authenticated
with check (
  bucket_id='bengalwave-preview-news-images'
  and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/(full|thumb)[.]webp$'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and storage.extension(name)='webp'
  and public.has_cms_role(array['owner','editor','contributor']::public.cms_role[])
);

-- An authenticated staff member cannot delete a photo still attached
-- to a published news story. Clean-up of failed, unlinked uploads remains
-- permitted for the same uploader.
drop policy if exists bw_production_media_owner_cleanup on storage.objects;
create policy bw_production_media_owner_cleanup
on storage.objects for delete to authenticated
using (
  bucket_id='bengalwave-news-images'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and public.has_cms_role(array['owner','editor','contributor']::public.cms_role[])
  and not exists (
    select 1
    from public.media_assets m
    join public.articles a on a.hero_media_id=m.id
    where a.status='published'::public.article_status
      and m.storage_path='bengalwave-news-images/'||
        (storage.foldername(name))[1]||'/'||
        (storage.foldername(name))[2]||'/full.webp'
  )
);

drop policy if exists bw_preview_media_owner_cleanup on storage.objects;
create policy bw_preview_media_owner_cleanup
on storage.objects for delete to authenticated
using (
  bucket_id='bengalwave-preview-news-images'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and public.has_cms_role(array['owner','editor','contributor']::public.cms_role[])
  and not exists (
    select 1
    from public.media_assets m
    join public.articles a on a.hero_media_id=m.id
    where a.status='published'::public.article_status
      and m.storage_path='bengalwave-preview-news-images/'||
        (storage.foldername(name))[1]||'/'||
        (storage.foldername(name))[2]||'/full.webp'
  )
);
