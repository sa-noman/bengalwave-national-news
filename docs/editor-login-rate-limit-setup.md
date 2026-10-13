# Editorial login throttling deployment checklist

This is security-sensitive configuration, not a UI change.

## Current architecture

- POST/Next Server Action for editor sign-in calls the three-argument
  `public.check_editor_login_rate_limit(ip_hash, account_hash, secret)` RPC.
- The RPC performs an atomic 15-minute count: 8 requests per account key or
  20 per IP key. Invalid or missing capability secrets receive `false`.
- The previous unguarded two-argument RPC was removed from Supabase.
- The secret is stored **only** as Vercel encrypted server environment variable
  `EDITOR_LOGIN_RATE_LIMIT_SECRET` and its SHA-256 digest in
  `private.editor_login_rate_limit_guard`. Never commit the value to GitHub.

## REQUIRED before releasing PR #20

The private guard must be provisioned so that the Vercel capability and
the digest in Supabase are the same. If the guard has no row (or the values
do not match), all editor login attempts return the existing limited error
and sign-in cannot succeed. This is intentional fail-closed behavior.

One-time setup by a trusted project administrator (do not send the secret
through ChatGPT or store it in GitHub):

1. Open Vercel Project > Settings > Environment Variables. Confirm
   `EDITOR_LOGIN_RATE_LIMIT_SECRET` exists for Production and Preview.
2. Safely retrieve the secret through an approved secrets-management method.
3. In a controlled privileged Supabase SQL session, provision ONLY the digest.
   The following SQL is a TEMPLATE; replace the placeholder locally and do
   not save its plaintext version in public logs or the repository:

   ```sql
   insert into private.editor_login_rate_limit_guard(id, secret_digest)
   values (1, encode(sha256(convert_to('<private secret>', 'UTF8')), 'hex'))
   on conflict(id) do update set secret_digest=excluded.secret_digest;
   ```

4. Redeploy the Preview (so the server runtime inherits the new variable).
5. Use an approved temporary editor account to test successful login, session
   renewal, denied access for unauthorized roles, logout, and 429/limited
   behavior. Remove the temporary account after tests.
6. Do not merge until the full authenticated smoke test and Vercel-hosted
   security header verification have succeeded.

## Verified automatically

The GitHub CI builds Preview and Production mode, checks SEO and headers via
locally started Next.js HTTP server, and runs browser comparisons against main.
The SQL RPC rejects untrusted secrets, and old unguarded signature is absent.

## Remaining safeguards

- The public RPC still costs a small amount of database work per invalid
  attempt. Consider additional edge-level abuse controls for excessive calls.
- The Vercel Preview is behind Vercel Authentication. If the connector lacks
  protected-deployment scope, project owners can grant suitable read access
  or use a time-limited Vercel Share link without disabling protection.
