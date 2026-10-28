# BengalWave development handoff

Branch: `feature/site-improvements-20261028` (never merge to `main` without explicit "লাইভ করো").
Production Supabase: read-only. Preview database isolation is **unverified**, so preview testing is read-only.

## Verification commands
Run all three before every push (Node 22+):
- `npm run typecheck`
- `npm test`
- `npm run build` (then `VERCEL_ENV=preview npm run start -- -p 3100` + `node scripts/http-smoke.mjs`)

## Completed
| # | Task | Commit |
|---|------|--------|
| 1 | Phase 1 SEO: NewsArticle JSON-LD, OpenGraph/Twitter, canonical, `bn_BD`; Gemini SEO test fixed | `00c658e` |
| 2 | Public news Data Cache (`unstable_cache`, tag `bw-public-news`, 60 s) + per-request `React.cache` dedupe; CMS actions call `revalidateTag` | `a7a7641` |
| 3 | Set-password requires AAL2 when MFA is enrolled (invite flow unaffected); all admin server actions confirmed to call `requireStaff` | `5ffb74a` |
| 4 | Mobile drawer dialog semantics, focus trap & opener focus restore; header search `aria-controls` & Escape; slideshow arrow keys, single `aria-live` & >=24px dot touch targets | see git log |

## Design decisions
- **Strict nonce CSP is kept.** Pages stay dynamically rendered because the nonce is per request. Speed comes from caching the Supabase reads (Data Cache), not from static HTML. Do not add `'unsafe-inline'` or remove the nonce to enable ISR.
- Cached readers **throw** on Supabase errors so failures are never cached; public wrappers catch and return `[]`/`null` as before.
- Scheduled stories appear within 60 s of `published_at`; any CMS save/publish/unpublish invalidates immediately.
- Edit Bangla source files with exact-byte replacements (scripts or CRLF-aware edits). Full rewrites have changed Unicode bytes and broken regex tests.

## Remaining (priority order)
1. **Security (Opus):** login rate limit bypass via direct Supabase Auth (needs Supabase dashboard CAPTCHA, a settings change requiring owner approval); 30 MB server action body limit (`next.config.ts`); static CSP in `next.config.ts` weaker than middleware CSP; set-password lacks reauth/AAL2 for MFA staff; HSTS `includeSubDomains`.
2. **CMS image pipeline (Opus):** `news-image.tsx` forces `unoptimized` for Supabase images; add `images.remotePatterns` for the configured project only; per-card `sizes`.
3. **Accessibility (Opus):** mobile drawer focus trap and `role="dialog"`; focus restore on all close paths; slideshow dot targets (8 px), arrow keys, double `aria-live`.
4. **Simpler (Gemini Argon):** compress `public/news/*.png`; move admin CSS out of root layout; `NewsItem` type and categories out of `demo-news.ts`; sitemap `updated_at`; meta text contrast/size; safe-area padding for bottom nav; newsletter demo form.
