-- Restricted CMS RPC execution and database-level editorial transitions.
-- Supabase Security Advisor observed anonymous execution grants on two SECURITY DEFINER functions.

revoke execute on function public.has_cms_role(public.cms_role[]) from public, anon;
grant execute on function public.has_cms_role(public.cms_role[]) to authenticated;

revoke execute on function public.archive_article_revision() from public, anon, authenticated;
revoke execute on function public.set_article_updated_at() from public, anon, authenticated;

-- A browser client must not be able to skip review by sending direct REST updates.
-- This trigger enforces editorial transitions regardless of application UI.
create function public.enforce_article_transitions()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  editor_ok boolean;
begin
  -- Migrations/admin jobs with no end-user JWT are separately controlled.
  if (select auth.uid()) is null then
    return new;
  end if;

  if new.author_id is distinct from old.author_id then
    raise exception 'Article author cannot be reassigned' using errcode = '42501';
  end if;

  editor_ok := public.has_cms_role(array['owner', 'editor']::public.cms_role[]);

  if old.status is distinct from new.status then
    if old.status = 'draft' and new.status = 'in_review' then
      null; -- contributors can submit their own drafts (RLS restricts ownership)
    elsif not editor_ok then
      raise exception 'Editor approval is required' using errcode = '42501';
    elsif old.status in ('draft', 'in_review') and new.status = 'approved' then
      null;
    elsif old.status = 'in_review' and new.status = 'draft' then
      null;
    elsif old.status = 'approved' and new.status = 'published' then
      if char_length(btrim(new.body)) < 30 or
         char_length(btrim(new.summary)) < 10 or
         new.category_id is null then
        raise exception 'Article is incomplete for publication' using errcode = '23514';
      end if;
      new.published_at := now();
    elsif old.status = 'published' and new.status = 'unpublished' then
      null;
    elsif old.status = 'unpublished' and new.status = 'approved' then
      null;
    else
      raise exception 'Editorial status transition is not permitted' using errcode = '23514';
    end if;
  end if;

  -- Do not allow manually modifying publication timestamps or scheduled posts.
  if not (old.status = 'approved' and new.status = 'published') and
      new.published_at is distinct from old.published_at then
    raise exception 'Publication time cannot be overridden' using errcode = '42501';
  end if;
  if new.scheduled_at is distinct from old.scheduled_at then
    raise exception 'Scheduled publishing is not enabled' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke execute on function public.enforce_article_transitions() from public, anon, authenticated;
create trigger trg_enforce_article_transitions
before update on public.articles
for each row execute function public.enforce_article_transitions();
