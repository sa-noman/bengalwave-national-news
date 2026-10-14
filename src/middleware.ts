import type { NextRequest } from "next/server";
import {NextResponse} from "next/server";
import { refreshSupabaseSession } from "./lib/supabase/middleware";

/**
 * Per-request CSP nonce for actual HTML documents.
 *
 * The existing theme initialization and Next.js hydration scripts must carry
 * this nonce. Neither unsafe-inline nor insecure hard-coded hashes are used
 * on these routes. Keep the rest of the site's design entirely unchanged.
 */
function strictContentSecurityPolicy(nonce:string, loginCaptcha=false) {
  const challengeOrigin=loginCaptcha ? " https://challenges.cloudflare.com" : "";
  // Bind all external image/API destinations to this environment's own
  // Supabase project. The same code works in isolated staging later.
  let supabaseOrigin="";
  try {
    const parsed=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL||"");
    if(parsed.protocol==="https:" && parsed.hostname.endsWith(".supabase.co"))
      supabaseOrigin=parsed.origin;
  }catch{/* No external Supabase origin unless configured. */}
  const realtimeOrigin=supabaseOrigin.replace(/^https:/,"wss:");
  const analyticsOrigins="https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://stats.g.doubleclick.net";
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'nonce-"+nonce+"' 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com"+challengeOrigin,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    process.env.VERCEL_ENV==="production"
      ? "img-src 'self' data: blob: https://upload.wikimedia.org "+supabaseOrigin+" "+analyticsOrigins
      : "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    process.env.VERCEL_ENV==="production"
      ? "connect-src 'self' "+supabaseOrigin+" "+realtimeOrigin+" "+analyticsOrigins+challengeOrigin
      : "connect-src 'self' https: wss:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    loginCaptcha ? "frame-src https://challenges.cloudflare.com" : "frame-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function middleware(request:NextRequest) {
  const nonce=crypto.randomUUID().replace(/-/g,"");
  const csp=strictContentSecurityPolicy(nonce,request.nextUrl.pathname==="/admin/login" &&
    !!process.env.BW_LOGIN_CAPTCHA_MODE && process.env.BW_LOGIN_CAPTCHA_MODE!=="off");
  const requestHeaders=new Headers(request.headers);
  requestHeaders.set("x-nonce",nonce);
  requestHeaders.set("Content-Security-Policy",csp);
  const admin=request.nextUrl.pathname.startsWith("/admin");
  const response=admin
    ?await refreshSupabaseSession(request,requestHeaders)
    :NextResponse.next({request:{headers:requestHeaders}});
  response.headers.set("Content-Security-Policy",csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|css|js)$).*)"],
};
