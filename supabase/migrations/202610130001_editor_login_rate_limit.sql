-- Shared, atomic rate limiting for editorial password sign-in.
-- This additive migration does not alter existing accounts or articles.
create table if not exists public.editor_login_attempts (
  bucket_key text primary key,
  attempt_count integer not null default 0,
  window_started_at timestamptz not null default now()
);
alter table public.editor_login_attempts enable row level security;
revoke all on public.editor_login_attempts from public, anon, authenticated;

create or replace function public.check_editor_login_rate_limit(
  p_ip_key text, p_account_key text
) returns boolean language plpgsql security definer
set search_path = '' as $$
declare
  k text;
  current_count integer;
  allowed boolean := true;
begin
  if p_ip_key !~ '^[a-f0-9]{64}$' or p_account_key !~ '^[a-f0-9]{64}$' then
    return false;
  end if;
  for k in select unnest(array['ip:'||p_ip_key,'account:'||p_account_key]) order by 1 loop
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(k,0));
    insert into public.editor_login_attempts(bucket_key,attempt_count,window_started_at)
    values(k,1,now())
    on conflict(bucket_key) do update set
      attempt_count=case when public.editor_login_attempts.window_started_at < now()-interval '15 minutes'
        then 1 else public.editor_login_attempts.attempt_count+1 end,
      window_started_at=case when public.editor_login_attempts.window_started_at < now()-interval '15 minutes'
        then now() else public.editor_login_attempts.window_started_at end
    returning attempt_count into current_count;
    if current_count > case when k like 'ip:%' then 20 else 8 end then
      allowed := false;
    end if;
  end loop;
  return allowed;
end;
$$;
revoke all on function public.check_editor_login_rate_limit(text,text) from public;
grant execute on function public.check_editor_login_rate_limit(text,text) to anon, authenticated;
