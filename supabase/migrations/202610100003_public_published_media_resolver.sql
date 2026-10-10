-- Read-only public image resolver for already published stories.
-- Some client queries can miss media_assets through multiple RLS policies.
-- This function exposes ONLY media belonging to publicly published articles.
-- It cannot reveal draft/approved/unpublished attachments.

create or replace function public.get_published_news_media(p_article_ids uuid[])
returns table (
  article_id uuid,
  storage_path text,
  alt_text text,
  caption text,
  credit text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    a.id,
    m.storage_path::text,
    m.alt_text::text,
    m.caption::text,
    m.credit::text
  from public.articles as a
  join public.media_assets as m on m.id = a.hero_media_id
  where
    a.id = any(p_article_ids)
    and a.status = 'published'::public.article_status
    and a.published_at is not null
    and a.published_at <= now()
    and (
      m.storage_path like 'bengalwave-preview-news-images/%'
      or m.storage_path like 'bengalwave-news-images/%'
    )
  limit 100;
$$;

revoke all on function public.get_published_news_media(uuid[]) from public;
grant execute on function public.get_published_news_media(uuid[]) to anon, authenticated;

comment on function public.get_published_news_media(uuid[]) is
  'Read-only, published-only article hero image resolver; no draft data.';
