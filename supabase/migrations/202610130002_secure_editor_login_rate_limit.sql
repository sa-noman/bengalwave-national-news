-- Secret-gated CMS sign-in throttle. Prevent anonymous clients from burning
-- a known editor's allowance through the previously unauthenticated RPC.
-- Provision guard secret_digest separately in private schema, never commit secrets.
create schema if not exists private;
create table if not exists private.editor_login_rate_limit_guard (
  id integer primary key check (id=1),
  secret_digest text not null
);
revoke all on schema private from public, anon, authenticated;
revoke all on private.editor_login_rate_limit_guard from public, anon, authenticated;

create or replace function public.check_editor_login_rate_limit(
  p_ip_key text, p_account_key text, p_secret text
) returns boolean
language sql volatile security definer
set search_path = ''
as $secured_limit$
  with authorized as (
    select exists(
      select 1 from private.editor_login_rate_limit_guard
      where id=1
        and secret_digest=pg_catalog.encode(
          pg_catalog.sha256(pg_catalog.convert_to(p_secret,'UTF8')), 'hex'
        )
    ) as valid
  ), keys as (
    select 'account:' || p_account_key as bucket_key, 8 as max_attempts
    union all
    select 'ip:' || p_ip_key as bucket_key, 20 as max_attempts
  ), attempts as (
    insert into public.editor_login_attempts(bucket_key,attempt_count,window_started_at)
    select k.bucket_key,1,now() from keys k cross join authorized a
    where a.valid
      and p_ip_key ~ '^[a-f0-9]{64}$'
      and p_account_key ~ '^[a-f0-9]{64}$'
    order by k.bucket_key
    on conflict(bucket_key) do update set
      attempt_count=case when public.editor_login_attempts.window_started_at < now()-interval '15 minutes'
        then 1 else public.editor_login_attempts.attempt_count+1 end,
      window_started_at=case when public.editor_login_attempts.window_started_at < now()-interval '15 minutes'
        then now() else public.editor_login_attempts.window_started_at end
    returning bucket_key,attempt_count
  )
  select coalesce((select count(*)=2 and bool_and(a.attempt_count<=k.max_attempts)
    from attempts a join keys k using(bucket_key)),false);
$secured_limit$;

revoke all on function public.check_editor_login_rate_limit(text,text,text) from public;
grant execute on function public.check_editor_login_rate_limit(text,text,text) to anon, authenticated;

-- Old two-argument signature is intentionally removed, because anyone could
-- invoke it to lock out other editorial accounts.
drop function if exists public.check_editor_login_rate_limit(text,text);
