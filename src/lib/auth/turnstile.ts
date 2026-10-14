import 'server-only';

export function loginCaptchaMode(): 'off' | 'gateway' | 'supabase' | 'invalid' {
  const mode = process.env.BW_LOGIN_CAPTCHA_MODE ?? 'off';
  return mode === 'off' || mode === 'gateway' || mode === 'supabase' ? mode : 'invalid';
}

/** Never verify a token here and then pass it to Supabase: tokens are single-use. */
export async function loginCaptcha(token: FormDataEntryValue | null): Promise<{ok: boolean; captchaToken?: string}> {
  const mode = loginCaptchaMode();
  if (mode === 'off') return {ok: true};
  if (mode === 'invalid' || !process.env.TURNSTILE_SITE_KEY || typeof token !== 'string' || !token || token.length > 2048)
    return {ok: false};
  // Supabase Auth owns Siteverify in provider mode, including direct Auth requests.
  if (mode === 'supabase') return {ok: true, captchaToken: token};
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const hosts = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || '').split(',').map(host => host.trim()).filter(Boolean);
  if (!secret || !hosts.length) return {ok: false};
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, cache: 'no-store',
      body: JSON.stringify({secret, response: token}), signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return {ok: false};
    const result = await response.json();
    return {ok: result?.success === true && result.action === 'admin_login' && hosts.includes(result.hostname)};
  } catch { return {ok: false}; }
}
