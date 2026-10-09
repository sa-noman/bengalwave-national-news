-- Schema blueprint: REVIEW BEFORE APPLYING IN SUPABASE.
-- No migration is executed automatically from this repository.
create extension if not exists pgcrypto;
create type public.article_status as enum ('draft','in_review','approved','scheduled','published','unpublished','archived');
create table public.categories (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique,
 label_bn text not null,
 created_at timestamptz not null default now()
);
create table public.articles (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique,
 headline text not null,
 summary text,
 body jsonb not null default '[]'::jsonb,
 category_id uuid references public.categories(id),
 status public.article_status not null default 'draft',
 author_id uuid references auth.users(id),
 published_at timestamptz,
 scheduled_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint published_requires_time check(status <> 'published' or published_at is not null)
);
create table public.sources (
 id uuid primary key default gen_random_uuid(),
 platform text not null check(platform in ('telegram','facebook','rss','manual')),
 external_id text not null,
 display_name text not null,
 enabled boolean not null default false,
 auto_publish_enabled boolean not null default false,
 unique(platform, external_id)
);
create table public.imported_items (
 id uuid primary key default gen_random_uuid(),
 source_id uuid not null references public.sources(id),
 external_post_id text not null,
 payload jsonb not null default '{}'::jsonb,
 article_id uuid references public.articles(id),
 received_at timestamptz not null default now(),
 unique(source_id,external_post_id)
);
create table public.article_revisions (
 id uuid primary key default gen_random_uuid(),
 article_id uuid not null references public.articles(id),
 editor_id uuid references auth.users(id),
 snapshot jsonb not null,
 created_at timestamptz not null default now()
);
create index articles_publication_idx on public.articles(status,published_at desc);
create index articles_category_idx on public.articles(category_id);
-- Deny unprivileged direct access until policy design & tests are finalized.
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.sources enable row level security;
alter table public.imported_items enable row level security;
alter table public.article_revisions enable row level security;
-- Minimal read access for published articles only.
create policy public_read_published on public.articles for select to anon,authenticated
using(status='published' and published_at <= now());
create policy public_read_categories on public.categories for select to anon,authenticated using(true);
-- No write policies yet; admin/editor write endpoints must enforce auth and roles first.
