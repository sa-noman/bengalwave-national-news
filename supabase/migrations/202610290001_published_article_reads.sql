-- Privacy-conscious, deduplicated reading statistics for the public homepage.
-- Count one meaningful browser visit per published article per Asia/Dhaka day.
-- No IP, user agent, email or raw browser identifier is stored.
create table if not exists public.article_read_uniques (
 article_id uuid not null references public.articles(id) on delete cascade,
 visit_date date not null,
 visitor_hash text not null check (visitor_hash ~ '^[0-9a-f]{64}$'),
 primary key (article_id, visit_date, visitor_hash)
);
create table if not exists public.article_read_totals (
 article_id uuid primary key references public.articles(id) on delete cascade,
 view_count bigint not null default 0 check (view_count >= 0),
 last_read_at timestamptz not null default now()
);
create index if not exists article_read_totals_rank_idx
 on public.article_read_totals (view_count desc, last_read_at desc);

alter table public.article_read_uniques enable row level security;
alter table public.article_read_totals enable row level security;
revoke all on table public.article_read_uniques from public, anon, authenticated;
revoke all on table public.article_read_totals from public, anon, authenticated;

-- Narrow public RPC: only add at most one count per visitor/day for already published articles.
-- All database identifiers are schema-qualified because this executes with elevated rights.
create or replace function public.record_published_article_read(
 p_slug text, p_visitor_hash text
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
 v_article_id uuid;
 v_added integer;
begin
 if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    or pg_catalog.length(p_slug)>150
    or p_visitor_hash is null
    or p_visitor_hash !~ '^[0-9a-f]{64}$'
 then
  return false;
 end if;
 select a.id into v_article_id from public.articles a
 where a.slug=p_slug and a.status='published'
   and a.published_at<=pg_catalog.now()
 limit 1;
 if v_article_id is null then return false; end if;
 insert into public.article_read_uniques(article_id,visit_date,visitor_hash)
 values (v_article_id,(pg_catalog.timezone('Asia/Dhaka',pg_catalog.now()))::date,p_visitor_hash)
 on conflict do nothing;
 get diagnostics v_added = row_count;
 if v_added=0 then return false; end if;
 insert into public.article_read_totals(article_id,view_count,last_read_at)
 values(v_article_id,1,pg_catalog.now())
 on conflict (article_id) do update
 set view_count=public.article_read_totals.view_count+1,last_read_at=excluded.last_read_at;
 return true;
end;
$$;
revoke execute on function public.record_published_article_read(text,text) from public, anon, authenticated;
grant execute on function public.record_published_article_read(text,text) to anon, authenticated;

-- Never return draft, scheduled, deleted or unpublished articles in rankings.
create or replace function public.get_most_read_article_ids(p_limit integer default 5)
returns table(article_id uuid, view_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
 select t.article_id,t.view_count
 from public.article_read_totals t
 join public.articles a on a.id=t.article_id
 where a.status='published' and a.published_at<=pg_catalog.now()
   and t.view_count>0
 order by t.view_count desc,t.last_read_at desc,a.published_at desc
 limit pg_catalog.least(pg_catalog.greatest(pg_catalog.coalesce(p_limit,5),1),5);
$$;
revoke execute on function public.get_most_read_article_ids(integer) from public, anon, authenticated;
grant execute on function public.get_most_read_article_ids(integer) to anon, authenticated;

comment on table public.article_read_uniques is 'One HMAC-derived anonymous browser visit per article and Dhaka calendar day; do not store identity data';
comment on table public.article_read_totals is 'Aggregated verified published-article visits for top-five public ranking';
