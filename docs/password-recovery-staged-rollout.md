# Password recovery: staged rollout, not activated

Audit date: 2026-10-14. This change supplies a reviewable email template; it does **not** change hosted Auth settings, the website UI, or existing recovery behavior.

## Current implementation inspected

- `src/app/auth/confirm/route.ts` already verifies `token_hash` with `verifyOtp`, permits only `invite` and `recovery`, and redirects to a fixed local password form. No new callback is required.
- `src/app/auth/recovery/page.tsx` already supports PKCE code exchange and legacy fragment recovery. It clears credentials from the URL before network requests and checks the authenticated user afterward.
- `src/app/admin/set-password/actions.ts` checks the confirmed account, password length/confirmation and known compromised passwords. It calls `updateUser({password})`; it does not remove MFA factors or grant roles.
- Staff authorization separately requires AAL2 when MFA enforcement is enabled. Static inspection is **not** proof that live Owner recovery preserves usable MFA; that still requires an isolated end-to-end test.
- Existing callback headers use no-store and no-referrer. Token hashes are nevertheless sensitive one-time credentials; never paste them into tickets, screenshots, logs or analytics.

## Exact activation sequence

1. Obtain access to Supabase **Authentication → Email Templates → Reset password** and **URL Configuration**. The connected tools in this session do not expose Auth configuration or templates. Do not request that passwords or management tokens be pasted into chat.
2. Create an isolated free test project or local Supabase environment first. Use a disposable account and mailbox, not the Production Owner. Do not point a modifying test at `lkleykmjphmliqybmwff`.
3. Privately back up the current template, subject, Site URL, allowed redirect URLs and MFA enforcement settings. Do not change the Production Site URL merely to test Preview.
4. In the isolated project's URL Configuration, set Site URL to its trusted app **origin**, with no `/auth/recovery` suffix or trailing slash. This template appends `/auth/confirm`. For eventual Production activation, the intended origin is `https://bengalwave.news`; inspect the existing value and all affected invitation flows before changing it.
5. Paste `supabase/templates/recovery-token-hash.html` into that project's Reset password template. Suggested subject: `BengalWave: Reset your password`. This uses the existing server callback and does not depend on a browser PKCE verifier. Do not replace the invitation template or disable MFA.
6. Send recovery only to the disposable test account and complete the matrix below. Preserve the currently working fragment fallback throughout testing.
7. After isolated tests pass and Production configuration changes receive approval, apply the reviewed template to Production. Keep the previous template ready for rollback. Removing the legacy callback is a separate follow-up after old links expire and the replacement is verified.

## Required test matrix and evidence

Record only pass/fail, timestamp, environment and sanitized errors. Never record passwords, cookies, recovery links or TOTP secrets.

| Test | Required result |
| --- | --- |
| Fresh recovery email in a clean browser | Existing password form opens; final URL contains no token |
| Valid new password | New password works; old password fails |
| Missing, altered, expired, reused hash | No authenticated admin access |
| Unexpected `type` or external redirect parameter | Rejected or fixed local destination; no external redirect |
| Existing verified TOTP factor | Factor remains enrolled after reset; admin requires valid TOTP/AAL2 |
| AAL1 session after recovery | Cannot publish, edit, upload or access protected data directly |
| No-role account | Cannot gain CMS privileges through recovery |
| Legacy recovery email issued before template change | Existing supported method still works |
| Desktop/mobile reset form | Same screenshots and interaction as baseline |
| Mail delivery/link scanner | Link remains usable for recipient; no automatic prefetch consumes it |

The current GET callback consumes a one-time token. Some email scanners prefetch links; test the actual mailbox/provider. If this causes consumption, a separately reviewed confirmation step is needed rather than claiming reliable delivery.

## Rollback and blockers

Restore the saved Reset password template (and any separately changed URL configuration) if delivery or reset fails. No application rollback should be needed because both existing callbacks remain intact. Do not unenroll Owner MFA to make a test pass.

Blocked in this session: hosted template inspection/update, mailbox access, isolated Auth service and dedicated MFA test account. No live reset, email send or Owner-account modification was attempted. This task does not inherently require a paid Supabase upgrade; hosted free capacity and mail-delivery eligibility must be checked separately.

## Official references

- https://supabase.com/docs/guides/auth/auth-email-templates (template variables and dashboard location)
- https://supabase.com/docs/guides/auth/server-side/creating-a-client (server token-hash verification)

These references support the template syntax; the audit and test requirements above derive from this repository and its security requirements. The changelog markdown endpoint could not be retrieved by the web tool in this session; no runtime API change was introduced.
