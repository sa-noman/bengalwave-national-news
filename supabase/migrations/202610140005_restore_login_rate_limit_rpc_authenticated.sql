-- Authenticated staff can arrive at /admin/login with refreshed Supabase cookies.
-- The login server action then performs the secret-gated RPC under the
-- authenticated role, even before password sign-in.
-- Restore the intended privilege; the private guard remains unreadable,
-- and attempts still require the server-only secret.
grant execute on function public.check_editor_login_rate_limit(text,text,text)
  to authenticated;
