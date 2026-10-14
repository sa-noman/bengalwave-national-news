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
