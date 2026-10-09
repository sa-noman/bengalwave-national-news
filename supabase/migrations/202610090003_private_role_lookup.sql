-- Keep the privileged profile lookup behind a non-exposed schema.
-- The public wrapper is SECURITY INVOKER and only answers about the current user.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create function private.has_cms_role(allowed public.cms_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_active and p.role = any(allowed)
  );
$$;

revoke all on function private.has_cms_role(public.cms_role[]) from public, anon;
grant execute on function private.has_cms_role(public.cms_role[]) to authenticated;

create or replace function public.has_cms_role(allowed public.cms_role[])
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.has_cms_role(allowed);
$$;

revoke all on function public.has_cms_role(public.cms_role[]) from public, anon;
grant execute on function public.has_cms_role(public.cms_role[]) to authenticated;
