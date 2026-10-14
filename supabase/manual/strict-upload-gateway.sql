-- MANUAL, APPROVAL-GATED activation; intentionally not an automatic migration.
-- First deploy BW_STRICT_UPLOAD_GATEWAY=true with SUPABASE_UPLOAD_SECRET_KEY
-- and verify authenticated upload, thumbnail and metadata in an isolated DB.
-- RESTRICTIVE policies also cover other permissive policies present in a project.
-- Public reads and current authenticated cleanup permissions are unchanged.
begin;
create policy bw_media_gateway_insert_only on storage.objects
as restrictive for insert to anon, authenticated
with check (bucket_id not in ('bengalwave-news-images','bengalwave-preview-news-images'));
create policy bw_media_gateway_update_only on storage.objects
as restrictive for update to anon, authenticated
using (bucket_id not in ('bengalwave-news-images','bengalwave-preview-news-images'))
with check (bucket_id not in ('bengalwave-news-images','bengalwave-preview-news-images'));
commit;
-- Rollback order: drop these two policies BEFORE disabling the gateway flag.
-- drop policy bw_media_gateway_insert_only on storage.objects;
-- drop policy bw_media_gateway_update_only on storage.objects;
