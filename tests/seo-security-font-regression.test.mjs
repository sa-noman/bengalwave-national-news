import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("preview remains noindex while production robots allow public URLs",()=>{
 const robots=read("src/app/robots.ts");
 assert.match(robots,/VERCEL_ENV !== "production"/);
 assert.match(robots,/disallow: "\/"/);
 assert.match(robots,/allow: "\/"/);
 assert.match(robots,/sitemap: "https:\/\/bengalwave.news\/sitemap.xml"/);
 const root=read("src/app/layout.tsx");
 assert.match(root,/robots:\{index:process\.env\.VERCEL_ENV==="production"/);
});
test("sitemap contains published stories and excludes unpublished sample data",()=>{
 const s=read("src/app/sitemap.ts");
 assert.match(s,/VERCEL_ENV !== "production"/);
 assert.match(s,/getPublishedNews\(1000\)/);
 assert.match(s,/publishedAt/);
 assert.doesNotMatch(s,/previewNews/);
 const feed=read("src/lib/news-feed.ts");
 assert.match(feed,/\.eq\("status","published"\)/);
 assert.match(feed,/\.lte\("published_at"/);
});
test("security headers are applied to all routes",()=>{
 const c=read("next.config.ts");
 for(const h of ["Content-Security-Policy","Strict-Transport-Security","X-Content-Type-Options","Referrer-Policy","X-Frame-Options","Permissions-Policy"]){
  assert.ok(c.includes(h),h);
 }
 for(const d of ["frame-ancestors 'none'","object-src 'none'","font-src 'self'","form-action 'self'"]){
  assert.ok(c.includes(d),d);
 }
 assert.match(c,/source: "\/:path\*"/);
});
test("editorial authentication uses a shared database-backed throttle",()=>{
 const auth=read("src/app/admin/login/actions.ts");
 assert.match(auth,/check_editor_login_rate_limit/);
 assert.match(auth,/limitError \|\| allowed!==true/);
 assert.match(auth,/signInWithPassword/);
 assert.doesNotMatch(auth,/console\.log\(password\)/);
 const sql=read("supabase/migrations/202610130001_editor_login_rate_limit.sql");
 assert.match(sql,/on conflict\(bucket_key\) do update/);
 assert.match(sql,/interval '15 minutes'/);
 assert.match(sql,/enable row level security/);
});
test("self-hosted Bengali font is used without runtime Google CSS import",()=>{
 const css=read("src/app/globals.css");
 const layout=read("src/app/layout.tsx");
 assert.doesNotMatch(css,/@import\s+url\(["']?https:\/\/fonts\.googleapis\.com/);
 assert.ok(layout.includes("@fontsource/noto-serif-bengali/400.css"));
 assert.ok(layout.includes("@fontsource/noto-serif-bengali/700.css"));
 assert.ok(read("src/app/font-local.css").includes("--bw-local-font"));
 assert.match(css,/var\(--bw-local-font\)/);
 assert.match(read("src/app/newsroom.css"),/--bw-serif:var\(--bw-local-font\)/);
});
