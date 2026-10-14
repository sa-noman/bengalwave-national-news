import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("Nonce CSP is unique per request and carried into Next hydration and theme",()=>{
 const middleware=read("src/middleware.ts");
 const root=read("src/app/layout.tsx");
 const ga=read("src/components/google-analytics.tsx");
 assert.match(middleware,/crypto\.randomUUID\(\)/);
 assert.match(middleware,/requestHeaders\.set\("x-nonce",nonce\)/);
 assert.match(middleware,/strict-dynamic/);
 assert.match(middleware,/script-src-attr 'none'/);
 const cspSource=middleware.match(/"script-src 'self' 'nonce-"\+nonce\+"'.*"/)?.[0]||"";
 assert.ok(cspSource.includes("nonce-"));
 assert.doesNotMatch(cspSource,/unsafe-inline/);
 assert.match(root,/nonce=\{nonce\} dangerouslySetInnerHTML/);
 assert.match(root,/localStorage\.getItem\("bw-theme-preference"\)/);
 assert.match(ga,/Script nonce=\{nonce\}/);
 assert.match(read("src/lib/supabase/middleware.ts"),/forwardedHeaders\.set\("cookie"/);
});

test("Anonymous attackers cannot lock a target CMS account by email",()=>{
 const sql=read("supabase/migrations/202610140004_avoid_account_lockout_dos.sql");
 assert.match(sql,/\x27ip:\x27\|\|p_ip_key/);
 assert.doesNotMatch(sql,/['"]account:['"]\s*\|\|\s*p_account_key/);
 assert.match(sql,/attempt_count<=20/);
 assert.match(sql,/interval '15 minutes'/);
 assert.match(sql,/private\.editor_login_rate_limit_guard/);
 assert.match(sql,/revoke all on function public\.check_editor_login_rate_limit/);
});

test("Free breached-password check sends only k-anonymous hash prefix",()=>{
 const helper=read("src/lib/auth/password-leak-check.ts");
 const action=read("src/app/admin/set-password/actions.ts");
 assert.match(helper,/createHash\("sha1"\)/);
 assert.match(helper,/digest\.slice\(0,5\)/);
 assert.match(helper,/https:\/\/api\.pwnedpasswords\.com\/range\//);
 assert.match(helper,/"Add-Padding":"true"/);
 assert.doesNotMatch(helper,/body:\s*password/);
 assert.match(action,/isKnownCompromisedPassword\(password\)/);
 assert.match(action,/if\(compromised===true\)redirect/);
 assert.match(read("src/app/admin/set-password/page.tsx"),/formError==="compromised"/);
});

test("Production CSP restricts image and API origins to configured Supabase project",()=>{
 const middleware=read("src/middleware.ts");
 assert.match(middleware,/parsed\.hostname\.endsWith\("\.supabase\.co"\)/);
 assert.match(middleware,/realtimeOrigin=supabaseOrigin\.replace/);
 assert.match(middleware,/img-src 'self' data: blob: "\+supabaseOrigin/);
 assert.match(middleware,/connect-src 'self' "\+supabaseOrigin\+" "\+realtimeOrigin/);
 assert.doesNotMatch(middleware,/connect-src 'self' https:\/\/\*\.supabase\.co/);
});
