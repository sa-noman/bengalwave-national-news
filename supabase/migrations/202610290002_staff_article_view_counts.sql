-- A narrow staff-only read endpoint for the aggregated public article counts.
-- Does not expose anonymous visitor fingerprints or permit client writes.
create or replace function public.get_staff_article_view_counts(p_article_ids uuid[])
returns table(article_id uuid, view_count bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
 if (select auth.uid()) is null or not exists (
  select 1 from public.profiles p
  where p.id=(select auth.uid()) and p.is_active=true
    and p.role::text in ('owner','editor','contributor')
    and (p.role::text='contributor' or (select auth.jwt()->>'aal')='aal2')
 ) then
  raise exception 'CMS staff authentication required'
    using errcode='42501';
 end if;
 if p_article_ids is null or cardinality(p_article_ids)>40 then
  raise exception 'Expected at most 40 article IDs'
    using errcode='22023';
 end if;
 return query
  select a.id, coalesce(t.view_count,0)::bigint
  from public.articles a
  left join public.article_read_totals t on t.article_id=a.id
  where a.id=any(p_article_ids);
end;
$$;
revoke execute on function public.get_staff_article_view_counts(uuid[]) from public, anon, authenticated;
grant execute on function public.get_staff_article_view_counts(uuid[]) to authenticated;
comment on function public.get_staff_article_view_counts(uuid[]) is
 'Staff-only aggregated view counts for up to 40 selected articles; never returns visitor fingerprint data.';
