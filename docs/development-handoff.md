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
| 4 | Mobile drawer dialog semantics (`role="dialog"`, `aria-modal`), Tab focus trap & opener focus restore; header search `aria-controls` & Escape; slideshow arrow keys, single `aria-live` & `>=24px` dot touch targets | `75e9b78` |
| 5 | Mobile bottom-nav safe-area padding (`calc(57px + env(safe-area-inset-bottom,0px))`) + `viewportFit: "cover"`; HIBP fail-open warning log; `.env.example` placeholder hygiene | see git log |

## Verified non-issues / intentional architecture (do not alter blindly)
- **Strict nonce CSP is kept (`src/middleware.ts`).** Pages stay dynamically rendered because the nonce is per request. Speed comes from caching the Supabase reads (Data Cache), not from static HTML.
- **Static CSP in `next.config.ts`:** Both `tests/audit-security-hardening.test.mjs` and `tests/remaining-security-hardening.test.mjs` explicitly assert `script-src 'self' 'unsafe-inline'` in `next.config.ts` while `src/middleware.ts` overrides HTML responses with the per-request nonce CSP.
- **CMS & remote image handling (`src/components/news-image.tsx`, `src/lib/news-media.ts`):** Uploaded CMS photos are already re-encoded and resized into `full.webp` (max 2000 px, quality 90) and `thumb.webp` (760 px, quality 78) by `sharp` at upload time, and `tests/aramco-archive-image.test.mjs` explicitly asserts `unoptimized={useOriginal || /^https:/}` so Next.js never proxies arbitrary remote `https://` URLs.
- **Public news images (`public/news/*`):** Both `-fixed.webp` (lightweight card thumbnail) and `-article.webp` (`>=1100x600` article hero) are actively used in `src/lib/news-feed.ts` and verified by `tests/news-image-integrity.test.mjs`.
- **Stylesheets (`newsroom.css`, `newsroom-editor.css`):** Both contain public website and published-article styles (`.bw-newsroom-published-body`, `.bw-story-slider-backdrop`) verified by `tests/newsroom-visual-refinements.test.mjs`.
- **Mobile card `sizes` (`72vw`):** On `<760px` viewports, `.bw-grid-four > .bw-card` uses `flex: 0 0 72%` (`src/app/newsroom.css:331`), so `(max-width: 760px) 72vw` is accurate.
- **Public media RPC (`get_published_news_media`):** Verified in `supabase/migrations/202610100003_public_published_media_resolver.sql` to filter `a.status = 'published' and a.published_at <= now()`.
- **`NewsletterDemo`:** Already excluded from `SiteFooter` (verified by `tests/footer-compact.test.mjs`).

## Reserved for Owner / Claude Opus Review
1. **Supabase Auth dashboard CAPTCHA & rate limits (Owner action):** Direct calls to Supabase Auth `/auth/v1/token` bypass app-side Turnstile; enable Turnstile CAPTCHA in the Supabase dashboard when ready.
2. **Server Action 30 MB body size limit (`next.config.ts`):** Needed because `ArticleForm` can upload 1 hero photo (4 MB) + up to 6 inline/slideshow photos (6 × 4 MB = 24 MB) in one multipart action. Changing this to signed direct-to-storage uploads or adding per-route body limits requires careful architectural coordination so chunked transfer encoding and CMS edit/new routes are not broken.
3. **HSTS `includeSubDomains; preload` (`next.config.ts`):** Only enable after confirming every subdomain of `bengalwave.news` serves valid HTTPS permanently.
