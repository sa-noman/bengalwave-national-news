# Security scan triage (14 October 2026)

The publicly accessible OWASP ZAP **baseline/passive** scan completed without FAIL-level findings; it reported 12 warning categories. This does **not** certify the website as penetration-tested or vulnerability-free.

Findings requiring extra care:
- **Reflected element attribute on /search?q=... (10031):** React escapes input attributes by default. Added an actual Chromium regression test with a harmless simulated HTML/event payload, requiring the injected text to remain plain input text without event execution.
- **CSP wildcard (10055):** Replaced broad production `https:` image origins and wildcard API hosts with exact Supabase project origin and known existing Google Analytics endpoints; Chromium, font, theme and news-photo tests gate deployment. Arbitrary future third-party media origins are intentionally not permitted by production CSP.
- **Lack of anti-CSRF token (10202):** Next.js Server Actions have Origin verification. This generic scanner warning alone does not establish a vulnerability.
- **Cross-origin misconfiguration (10098):** Appeared on publicly readable static assets (JavaScript/CSS/images/robots), not evidence of credentialed cross-origin access to the CMS. Re-evaluate if any private endpoint exposes permissive CORS.
- **Subresource integrity (90003):** Self-hosted versioned Next.js chunks use HTTPS and strict nonce CSP. SRI requirements differ for dynamic local build artifacts; adding incorrect hashes would break scripts.
- **COEP missing (90004):** Turning on restrictive COEP without testing Supabase images and analytics could block legitimate resources; do not enable blindly.
- **Caching (10015,10049,10050):** Includes public robots/sitemap content and dynamic pages. Password recovery routes have no-store, noindex and no-referrer.
- **Suspicious SVG comment (10027):** Public prototype art SVG; not proof of data leakage.
- **Other low-information items:** Scanner classified generic modern web apps and the normal CMS login form as warnings.

User-visible frontend and published data must remain unchanged.

Integration prerequisites that cannot be supplied by a code commit alone:
- **Staging database:** Supabase estimated a second project at $0/month in the existing organization; creating it requires an explicit organization selection and confirmation. Supabase Database Branch was quoted at $0.01344/hour and is not free.
- **Cloudflare Turnstile:** Free tier can be used, but production widget site key, secret key, and account/domain provisioning are required; fake/test keys are not production security. Avoid changing existing visual login UI without authorization.
- **Full server-validated Storage gateway:** Existing normal upload goes through Sharp on the server. Direct Supabase Storage API writes still need a privileged server-only gateway before they can be disabled safely. Without a tested server secret and upload endpoint, denying direct writes could break editorial images.
- **PKCE-only password recovery:** Existing token-hash verification already supported; replacing the fragment fallback requires the actual Supabase email recovery template update and a verified test-email flow. The current flow scrubs tokens before networking and uses no-store/no-referrer.
- **Leaked-password protection:** Supabase's native feature is Pro and above. The free HIBP k-anonymous check is integrated when a password is set through the CMS; this does not change Supabase's own Auth provider setting.
- **Destructive/authenticated pentest:** Requires a disposable staging target and authorized testing credentials. The passive/public probes are not a substitute.
