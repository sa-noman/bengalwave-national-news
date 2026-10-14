-- Harden CMS data boundaries without changing published content or presentation.
-- Existing data was checked before writing this additive migration.

-- Defense in depth: Server Action validation alone does not protect direct
-- authenticated PostgREST access. Keep all existing valid HTTP(S) sources.
alter table public.articles
  add constraint articles_source_url_http_only
  check (
    source_url is null
    or (
      length(source_url) <= 1200
      and source_url ~* '^https?://[^[:space:][:cntrl:]]+$'
    )
  );

-- CMS contributors must never set editor-controlled feature flags, including
-- by creating a draft directly against the Supabase API.
create or replace function public.enforce_article_editor_only_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  editor_ok boolean;
begin
  -- Administrative migrations without an end-user JWT are separately secured.
  if (select auth.uid()) is null then return new; end if;

  editor_ok := public.has_cms_role(array['owner','editor']::public.cms_role[]);
  if not editor_ok then
    if tg_op = 'INSERT' then
      if new.is_featured or new.featured_priority <> 0 then
        raise exception 'Featured flags require editor privileges'
          using errcode = '42501';
      end if;
    else
      if new.is_featured is distinct from old.is_featured
        or new.featured_priority is distinct from old.featured_priority then
        raise exception 'Featured flags require editor privileges'
          using errcode = '42501';
      end if;
    end if;

    -- Contributors may attach only their own images, not any guessed asset ID.
    if new.hero_media_id is not null
      and (tg_op = 'INSERT' or new.hero_media_id is distinct from old.hero_media_id)
      and not exists (
        select 1 from public.media_assets as m
        where m.id = new.hero_media_id
          and m.uploaded_by = (select auth.uid())
      ) then
      raise exception 'Article image must belong to the contributor'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$function$;
revoke all on function public.enforce_article_editor_only_fields() from public, anon, authenticated;
create trigger trg_enforce_article_editor_only_fields
before insert or update on public.articles
for each row execute function public.enforce_article_editor_only_fields();

-- Preserve existing UUID-folder storage layout for every CMS asset.
alter table public.media_assets
  add constraint media_assets_safe_storage_path
  check (
    storage_path ~
      '^(bengalwave-news-images|bengalwave-preview-news-images)/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/full[.]webp$'
    and (
      uploaded_by is null or split_part(storage_path, '/', 2) = uploaded_by::text
    )
  );

-- The published-only read RPC serves anonymous visitors without revealing
-- staff UUIDs. Staff may still read metadata via existing role-aware policies.
drop policy if exists bw_preview_published_media_read on public.media_assets;
drop policy if exists bw_production_published_media_read on public.media_assets;
