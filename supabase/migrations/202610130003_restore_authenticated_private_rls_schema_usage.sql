-- Restore schema access needed by CMS Row Level Security.
-- public.has_cms_role() invokes private.has_cms_role(); without USAGE on
-- private, authenticated queries against articles raise SQLSTATE 42501.
grant usage on schema private to authenticated;

-- Do not expose the private login secret guard to browser-issued requests.
revoke all on private.editor_login_rate_limit_guard from public, anon, authenticated;
revoke usage on schema private from anon;
