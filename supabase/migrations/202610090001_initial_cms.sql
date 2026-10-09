-- Bengal Wave CMS v1. Prepared for project lkleykmjphmliqybmwff.
-- Everything remains private by default; there is no automatic publication or admin bootstrap.
create extension if not exists pgcrypto;

create type public.cms_role as enum ('owner', 'editor', 'contributor');
create type public.article_status as enum
  ('draft', 'in_review', 'approved', 'scheduled', 'published', 'unpublished', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.cms_role not null default 'contributor',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Do not enable self-service account elevation. Owners are assigned by an
-- authorized administrator after the first user's email is confirmed.
create function public.has_cms_role(allowed public.cms_role[])
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_active and p.role = any(allowed)
  );
$$;
revoke all on function public.has_cms_role(public.cms_role[]) from public;
grant execute on function public.has_cms_role(public.cms_role[]) to authenticated;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label_bn text not null,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label_bn text not null
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt_text text not null default '',
  caption text,
  credit text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  headline text not null check(char_length(trim(headline)) between 5 and 300),
  summary text not null default '',
  body text not null default '',
  status public.article_status not null default 'draft',
  category_id uuid references public.categories(id) on delete set null,
  hero_media_id uuid references public.media_assets(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  source_name text,
  source_url text,
  is_featured boolean not null default false,
  featured_priority integer not null default 0,
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint article_published_has_date check(status <> 'published' or published_at is not null),
  constraint article_scheduled_has_date check(status <> 'scheduled' or scheduled_at is not null)
);

create table public.article_tags (
  article_id uuid not null references public.articles(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key(article_id, tag_id)
);

create table public.article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  editor_id uuid references auth.users(id) on delete set null,
  prior_state jsonb not null,
  created_at timestamptz not null default now()
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  platform text not null check(platform in ('telegram','facebook','rss','manual')),
  external_id text not null,
  display_name text not null,
  enabled boolean not null default false,
  auto_publish_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  unique(platform, external_id),
  constraint cannot_auto_publish_disabled_source check(not auto_publish_enabled or enabled)
);

create table public.imported_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  external_post_id text not null,
  raw_payload jsonb not null default '{}'::jsonb,
  processing_status text not null default 'new'
    check(processing_status in ('new','duplicate','in_review','processed','rejected','failed')),
  article_id uuid references public.articles(id) on delete set null,
  received_at timestamptz not null default now(),
  unique(source_id, external_post_id)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  article_id uuid references public.articles(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index articles_publication_idx on public.articles(status,published_at desc);
create index articles_category_idx on public.articles(category_id,status,published_at desc);
create index articles_author_idx on public.articles(author_id,status);
create index revisions_article_idx on public.article_revisions(article_id,created_at desc);
create index imports_unprocessed_idx on public.imported_items(processing_status,received_at desc);
create index audit_occurred_idx on public.audit_logs(occurred_at desc);
create index articles_featured_idx on public.articles(is_featured,featured_priority desc)
 where status='published';

create function public.set_article_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end; $$;
create trigger trg_article_timestamp before update on public.articles
for each row execute function public.set_article_updated_at();

create function public.archive_article_revision()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old is distinct from new then
    insert into public.article_revisions(article_id,editor_id,prior_state)
    values(old.id, auth.uid(), to_jsonb(old));
  end if;
  return new;
end; $$;
revoke all on function public.archive_article_revision() from public;
create trigger trg_article_revision after update on public.articles
for each row execute function public.archive_article_revision();

-- Row-level security: all sensitive data deny by default.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.media_assets enable row level security;
alter table public.articles enable row level security;
alter table public.article_tags enable row level security;
alter table public.article_revisions enable row level security;
alter table public.sources enable row level security;
alter table public.imported_items enable row level security;
alter table public.audit_logs enable row level security;

-- Public browsing: published articles and active categories only.
create policy categories_public_read on public.categories for select to anon, authenticated
using(is_active);
create policy categories_editor_read on public.categories for select to authenticated
using(public.has_cms_role(array['owner','editor']::public.cms_role[]));
create policy categories_editor_insert on public.categories for insert to authenticated
with check(public.has_cms_role(array['owner','editor']::public.cms_role[]));
create policy categories_editor_update on public.categories for update to authenticated
using(public.has_cms_role(array['owner','editor']::public.cms_role[]))
with check(public.has_cms_role(array['owner','editor']::public.cms_role[]));

create policy article_public_read on public.articles for select to anon, authenticated
using(status='published' and published_at <= now());
create policy article_staff_read on public.articles for select to authenticated
using(public.has_cms_role(array['owner','editor']::public.cms_role[])
  or (author_id=auth.uid() and public.has_cms_role(array['contributor']::public.cms_role[])));
create policy article_staff_insert on public.articles for insert to authenticated
with check(author_id=auth.uid() and status='draft'
  and public.has_cms_role(array['owner','editor','contributor']::public.cms_role[]));
create policy article_editor_update on public.articles for update to authenticated
using(public.has_cms_role(array['owner','editor']::public.cms_role[]))
with check(public.has_cms_role(array['owner','editor']::public.cms_role[]));
create policy article_contributor_update on public.articles for update to authenticated
using(status='draft' and author_id=auth.uid()
  and public.has_cms_role(array['contributor']::public.cms_role[]))
with check(status in ('draft','in_review') and author_id=auth.uid());
create policy article_owner_delete on public.articles for delete to authenticated
using(public.has_cms_role(array['owner']::public.cms_role[]));

create policy profiles_self_read on public.profiles for select to authenticated
using(id=auth.uid());
create policy profiles_owner_read on public.profiles for select to authenticated
using(public.has_cms_role(array['owner']::public.cms_role[]));
-- No client-side profile insert or role updates.

create policy tags_public_read on public.tags for select to anon,authenticated using(true);
create policy tags_editor_insert on public.tags for insert to authenticated
with check(public.has_cms_role(array['owner','editor']::public.cms_role[]));
create policy tags_editor_update on public.tags for update to authenticated
using(public.has_cms_role(array['owner','editor']::public.cms_role[]))
with check(public.has_cms_role(array['owner','editor']::public.cms_role[]));

create policy article_tags_public_read on public.article_tags for select to anon,authenticated
using(exists(select 1 from public.articles a where a.id=article_id and a.status='published' and a.published_at<=now()));
create policy article_tags_editor_read on public.article_tags for select to authenticated
using(public.has_cms_role(array['owner','editor']::public.cms_role[]));
create policy article_tags_editor_insert on public.article_tags for insert to authenticated
with check(public.has_cms_role(array['owner','editor']::public.cms_role[]));
create policy article_tags_editor_delete on public.article_tags for delete to authenticated
using(public.has_cms_role(array['owner','editor']::public.cms_role[]));

create policy media_staff_read on public.media_assets for select to authenticated
using(public.has_cms_role(array['owner','editor','contributor']::public.cms_role[]));
create policy media_staff_insert on public.media_assets for insert to authenticated
with check(uploaded_by=auth.uid()
  and public.has_cms_role(array['owner','editor','contributor']::public.cms_role[]));
create policy media_owner_editor_update on public.media_assets for update to authenticated
using(public.has_cms_role(array['owner','editor']::public.cms_role[]))
with check(public.has_cms_role(array['owner','editor']::public.cms_role[]));

create policy revisions_staff_read on public.article_revisions for select to authenticated
using(public.has_cms_role(array['owner','editor']::public.cms_role[])
  or exists(select 1 from public.articles a
     where a.id=article_id and a.author_id=auth.uid()
       and public.has_cms_role(array['contributor']::public.cms_role[])));

create policy source_staff_read on public.sources for select to authenticated
using(public.has_cms_role(array['owner','editor']::public.cms_role[]));
create policy source_owner_insert on public.sources for insert to authenticated
with check(public.has_cms_role(array['owner']::public.cms_role[])
  and not auto_publish_enabled);
create policy source_owner_update on public.sources for update to authenticated
using(public.has_cms_role(array['owner']::public.cms_role[]))
with check(public.has_cms_role(array['owner']::public.cms_role[])
  and not auto_publish_enabled);
-- Auto-publish cannot be switched on via the regular CMS client.
create policy imports_staff_read on public.imported_items for select to authenticated
using(public.has_cms_role(array['owner','editor']::public.cms_role[]));
-- Import writes require a separately secured backend ingestion service, not user/browser credentials.

create policy audits_owner_read on public.audit_logs for select to authenticated
using(public.has_cms_role(array['owner']::public.cms_role[]));

-- Sensible initial category taxonomy. The "Latest" view is chronological, not a category.
insert into public.categories(slug,label_bn,sort_order) values
('national','জাতীয়',10),
('international','আন্তর্জাতিক',20),
('politics','রাজনীতি',30),
('economy','অর্থনীতি',40),
('features','ফিচার',50),
('culture','সংস্কৃতি',60),
('technology','প্রযুক্তি',70),
('sports','খেলাধুলা',80),
('entertainment','বিনোদন',90)
on conflict(slug) do nothing;
