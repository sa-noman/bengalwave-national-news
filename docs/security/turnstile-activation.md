# Turnstile: implemented but inactive

Default `BW_LOGIN_CAPTCHA_MODE=off` renders the existing login unchanged, loads no Cloudflare script and does not relax CSP. No widget or account has been created and no production settings have been changed. Live legitimate-user, password login and MFA tests remain blocked by access and the absence of isolated staging.

## Configuration

- `TURNSTILE_SITE_KEY`: public widget identifier, passed by the server to the login component. It is not a secret.
- `TURNSTILE_SECRET_KEY`: server-only secret, required only for gateway mode. Never prefix with NEXT_PUBLIC or commit.
- `TURNSTILE_ALLOWED_HOSTNAMES`: exact comma-separated hostname allowlist, required in gateway mode.
- `BW_LOGIN_CAPTCHA_MODE`: `off` (default), `gateway`, or `supabase`. Unknown modes fail closed.

Create a free **Invisible** widget in Cloudflare with an explicit hostname allowlist. Do not use a Managed widget hidden with CSS: managed challenges can require visible interaction. Invisible widgets have disclosure/privacy requirements; confirm that the site's privacy notice satisfies Cloudflare's terms before activation. The existing interface is unchanged while disabled. Enabled browser visual and accessibility verification remains required.

### Gateway mode (limited protection)

The server action validates tokens with a 5-second timeout before submitting passwords, checks action `admin_login` and an exact hostname, and fails closed on errors. Siteverify enforces expiry and one-time use. Existing distributed login rate limiting and mandatory MFA are retained. Gateway-only protection **does not protect direct requests to the public Supabase Auth API**. Do not describe it as provider-wide CAPTCHA protection.

### Supabase mode (provider-wide protection)

Configure the Supabase Auth CAPTCHA provider with the Invisible Turnstile widget secret, then select `supabase` mode. The application forwards the fresh token using `signInWithPassword({options:{captchaToken}})`; Supabase alone consumes it via Siteverify. The app must not also call Siteverify for this token. Hostname restrictions must be set in the Cloudflare widget dashboard. Unlike gateway mode, the application cannot independently inspect the provider's hostname/action claims in this mode.

Provider CAPTCHA settings affect other supported Auth operations, including password recovery; the existing recovery request client does not yet acquire a CAPTCHA token. **Do not enable provider-wide CAPTCHA until all affected flows have been integrated and tested in isolation.** Keep off on production until then. There is no safe claim that login-only integration completes provider-wide activation.

## Isolated acceptance gate

1. Use isolated Supabase credentials and Preview-only variables. Configure the widget hostname to match that preview.
2. Verify valid staff login, rejected invalid/expired/replayed tokens, Cloudflare failure and timeout, and legitimate users with script blockers receiving the generic retry error.
3. Verify owner/editor mandatory MFA, failed passwords and successful login on desktop/mobile. Compare screenshots with off mode.
4. In provider mode verify direct Auth calls without tokens are rejected and every affected recovery/signup flow continues working.
5. Obtain approval for coordinated production activation. For rollback, restore app mode to off AND disable the Supabase provider CAPTCHA setting together, otherwise login fails.

References checked: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ and https://supabase.com/docs/guides/auth/auth-captcha .
