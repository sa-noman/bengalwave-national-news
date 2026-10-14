-- MFA readiness only: starts DISABLED to avoid locking out the site owner.
-- Enable ONLY after the owner has enrolled and verified a TOTP factor and the
-- application has been deployed with BW_MFA_REQUIRED=true.

create table if not exists private.cms_mfa_policy (
  singleton boolean primary key default true check (singleton),
  require_editor_aal2 boolean not null default false
);
insert into private.cms_mfa_policy (singleton,require_editor_aal2)
values (true,false) on conflict (singleton) do nothing;
revoke all on private.cms_mfa_policy from public,anon,authenticated;

-- This single existing helper is already used by CMS RLS, so when opted in
-- it also protects DIRECT Supabase REST updates (not just Next.js actions).
create or replace function private.has_cms_role(allowed public.cms_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.profiles p
    join private.cms_mfa_policy m on m.singleton = true
    where p.id = (select auth.uid())
      and p.is_active
      and p.role = any(allowed)
      and (
        not m.require_editor_aal2
        or p.role = 'contributor'::public.cms_role
        or coalesce((auth.jwt()->>'aal'),'aal1') = 'aal2'
      )
  );
$function$;
revoke all on function private.has_cms_role(public.cms_role[]) from public,anon;
-- Preserve access required for existing public helper/RLS role delegation.
grant execute on function private.has_cms_role(public.cms_role[]) to authenticated;
