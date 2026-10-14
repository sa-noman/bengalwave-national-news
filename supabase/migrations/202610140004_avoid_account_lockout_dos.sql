-- Stop targeted username/account lockout denial-of-service.
-- Retain a 20-attempt / 15-minute IP bucket, guarded by the already existing
-- server-only attestation secret. Owner/editor MFA independently protects
-- privileged access, even if an IP rotates.
-- No user, password, auth session, or editorial content is modified.
create or replace function public.check_editor_login_rate_limit(
  p_ip_key text,
  p_account_key text,
  p_secret text
)
returns boolean
language sql
security definer
set search_path = ''
as $function$
  with authorized as (
    select exists(
      select 1 from private.editor_login_rate_limit_guard
      where id=1
        and secret_digest=pg_catalog.encode(
          pg_catalog.sha256(pg_catalog.convert_to(p_secret,'UTF8')),'hex'
        )
    ) as valid
  ), attempts as (
    insert into public.editor_login_attempts(bucket_key,attempt_count,window_started_at)
    select 'ip:'||p_ip_key,1,now()
    from authorized a
    where a.valid
      and p_ip_key ~ '^[a-f0-9]{64}$'
      and p_account_key ~ '^[a-f0-9]{64}$'
    on conflict(bucket_key) do update set
      attempt_count=case
        when public.editor_login_attempts.window_started_at < now()-interval '15 minutes'
          then 1
        else public.editor_login_attempts.attempt_count+1
      end,
      window_started_at=case
        when public.editor_login_attempts.window_started_at < now()-interval '15 minutes'
          then now()
        else public.editor_login_attempts.window_started_at
      end
    returning attempt_count
  )
  select coalesce((select attempt_count<=20 from attempts),false);
$function$;

revoke all on function public.check_editor_login_rate_limit(text,text,text)
  from public,authenticated;
grant execute on function public.check_editor_login_rate_limit(text,text,text) to anon;
comment on function public.check_editor_login_rate_limit(text,text,text) is
  'Private server-attested, per-IP throttle for CMS login; no arbitrary email/account lockout.';
