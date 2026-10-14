# BengalWave security hardening: safe activation checklist

This work deliberately **does not change any existing public website layout, color, font, theme, image or copy**.
The database migrations are additive and preserve current articles.

## Immediately applied code and schema (after passing CI and explicit rollout)
- Published-source URLs: HTTP(S) only, checked in the database and at the render boundary.
- Direct authenticated PostgREST writes: Contributors cannot set `is_featured`, `featured_priority`, or link other users' media assets, including during initial INSERT.
- Asset metadata paths: UUID user folder and UUID image folder enforced for stored WebP.
- Anonymous public media metadata cannot leak `uploaded_by` auth UUIDs; published images continue to resolve via `get_published_news_media` RPC. Verify existing images after migration.
- Search now handles repeated `q` query parameters without throwing.
- Login rate limiter trusts deployment-provided Vercel IP headers rather than arbitrary third-party forwarded headers.
- Build uses already committed article photos; it no longer downloads images from unrelated external publishers.
- `package-lock.json` is checked in; CI uses `npm ci`. Actions are SHA-pinned and read-only. The old image-repair write job is replaced by read-only verification.

## MFA (M4): safe two-stage rollout
1. Merge and deploy the MFA enrollment route `/admin/mfa` without enabling enforcement.
2. Owner signs in, manually opens `https://bengalwave.news/admin/mfa`, scans a QR code in an authenticator app (e.g. Microsoft or Google Authenticator) and successfully verifies a six-digit code.
3. Create a second backup TOTP factor when supported, or verify a secure account-recovery procedure.
4. Owner TOTP was verified on 2026-10-14. A separate code release now enforces `aal2` for all Owner/Editor CMS pages and login flow without a Vercel environment variable (Vercel env-management API is currently 403). After that deployment is READY, switch `private.cms_mfa_policy.require_editor_aal2 = true` to enforce the same rule at the direct Supabase REST/RLS boundary. Keep test scripts and preview accounts separate.
5. DB enforcement is essential: application-level MFA alone cannot prevent direct Supabase REST calls.

**Mandatory Owner/Editor MFA is enabled only after verified owner enrollment.** Keep the /admin/mfa challenge route reachable with an aal1 session, so ordinary password login can complete MFA before accessing any privileged CMS view or Supabase REST write.

## Separate staging (M3): requires explicit user cost confirmation
The Preview environment is already Vercel SSO-protected, but Preview currently connects to the production database.
Do not provision extra paid Supabase resources without the owner's cost approval.
After approval: create separate Supabase staging project/branch, apply the same migrations to empty staging, and set **Preview-only** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel. Keep Production variables unchanged. Re-deploy previews and verify draft/photo workflows on staging. Do not import live accounts or personal news data unnecessarily.

## Remaining defense-in-depth (requires careful rollout)
- **L1**: Account-based failed-login lockout can be abused to create a short editor lockout. CAPTCHA integration needs provider configuration and an authentication flow change; Supabase Auth built-in abuse limits should also be checked. Do not remove the current account/IP rate limits without an alternative.
- **L3**: Current Next.js hydration uses inline scripts. Removing `unsafe-inline` from CSP requires nonce or verified script hashes across all layouts; apply only after independent desktop/mobile light/dark visual verification. HSTS `includeSubDomains` requires an inventory of other subdomains.
- **L4**: Supabase Storage allows staff to call the REST upload API directly; bucket MIME, extension and 8 MB limits exist, but server-side Sharp re-encoding is not guaranteed for directly uploaded objects. Require a server-side upload proxy with service-role key held **only on the server** if stronger enforcement is needed, and audit Storage access policies before removing direct write access.
- **L8**: The existing `/auth/confirm?token_hash=...&type=recovery` server flow already supports Supabase's hashed token verification. To eliminate legacy URL-fragment token recovery, first update the Supabase Recovery Email template and verify test-account reset; then remove fragment fallback from `/auth/recovery`. Do not remove it before the template update or password recovery may stop working.

## Post-deployment verification
Run the ordinary 119+ tests, Next.js typecheck/build, automated browser security and screenshots, check published images, check authenticated login after cache invalidation, and compare old/new desktop/mobile light/dark visuals before production merge.
