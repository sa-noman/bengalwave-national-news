# BengalWave editor authentication rollout checks

## Configuration completed

- The current sign-in action requires a server-only Vercel environment variable
  `EDITOR_LOGIN_RATE_LIMIT_SECRET` (Preview / Production / Development).
- A matching **SHA-256 digest** of that value has now been provisioned into
  `private.editor_login_rate_limit_guard` using the Vercel integration and
  Supabase SQL tool. The secret itself was **not** copied to GitHub, chat,
  logs or a client bundle.
- The guard table is private (anonymous and authenticated roles cannot
  SELECT it), and the old unguarded two-argument RPC has been removed.
- The secured three-argument RPC rejects missing or incorrect secrets without
  incrementing the account/IP attempt counters.
- Limits: 8 sign-in attempts per account key or 20 per IP key per 15 minutes.

## Passing checks

- CI TypeScript checks, unit tests, Next.js builds and local HTTP smoke tests
  for both Preview and Production.
- Preview denies crawlers while Production offers public sitemap/robots.
- Security response headers validated locally in the Next.js HTTP runtime.
- Headless Chromium baseline-vs-candidate Desktop/Mobile layout comparisons.
- Supabase function/grant/guard configuration verified.

## Remaining release blockers

1. **Protected Vercel Preview E2E:** The installed integration can list the
   Deployment but receives HTTP 403 on the deployment protection bypass,
   runtime logs and share-link management under the Team scope. A Project
   owner must authorize the integration's Team scope or provide a temporary
   Vercel share link through an approved secure channel.
2. **Real editor login/session renewal:** No password, MFA or active editor
   session is available to the test runner, and it must not guess or reset
   anyone's credentials. The end-to-end test requires an explicitly authorized
   dedicated temporary CMS test user and a secure credential-delivery method.

Never copy an Editor password, share bypass secret or server-side rate-limit
secret into a public GitHub commit or a chat message.

### Safe end-to-end checklist

- With an approved throwaway staff test account on a protected preview, log in
  with valid credentials; expect /admin and a secure session.
- Navigate between protected pages; allow the access token to refresh and
  verify the session persists.
- Log out; /admin must redirect to /admin/login.
- Verify wrong passwords, disabled profiles, invalid roles, and attempt
  throttling; delete the test account and clean up test counters.
- Verify response CSP/HSTS/nosniff at the actual Vercel CDN edge using a
  temporally scoped protected Preview access grant.

## Deployment

The branch is intentionally a **Draft PR**. Do not merge it into main before
the remaining live session and Vercel edge tests have passed.
