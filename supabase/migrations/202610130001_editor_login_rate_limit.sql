-- Atomic shared login throttling. Additive; does not alter CMS content.
create table if not exists public.editor_login_attempts (
  bucket_key text primary key,
  attempt_count integer not null default 0,
  window_started_at timestamptz not null default now()
);
alter table public.editor_login_attempts enable row level security;
revoke all on public.editor_login_attempts from public, anon, authenticated;

create or replace function public.check_editor_login_rate_limit(p_ip_key text,p_account_key text)
returns boolean
language sql volatile security definer
set search_path = ''
as $rate_limit$
  with keys as (
    select 'account:' || p_account_key as bucket_key, 8 as max_attempts
    union all
    select 'ip:' || p_ip_key as bucket_key, 20 as max_attempts
  ), attempts as (
    insert into public.editor_login_attempts(bucket_key,attempt_count,window_started_at)
    select bucket_key,1,now() from keys
    where p_ip_key ~ '^[a-f0-9]{64}$' and p_account_key ~ '^[a-f0-9]{64}$'
    order by bucket_key
    on conflict(bucket_key) do update set
      attempt_count=case when public.editor_login_attempts.window_started_at < now()-interval '15 minutes'
        then 1 else public.editor_login_attempts.attempt_count+1 end,
      window_started_at=case when public.editor_login_attempts.window_started_at < now()-interval '15 minutes'
        then now() else public.editor_login_attempts.window_started_at end
    returning bucket_key,attempt_count
  )
  select coalesce((select count(*)=2 and bool_and(a.attempt_count<=k.max_attempts)
    from attempts a join keys k using(bucket_key)),false);
$rate_limit$;
revoke all on function public.check_editor_login_rate_limit(text,text) from public;
grant execute on function public.check_editor_login_rate_limit(text,text) to anon, authenticated;
