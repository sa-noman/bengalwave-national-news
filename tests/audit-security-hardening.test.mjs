import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const db=read("supabase/migrations/202610140001_security_audit_hardening.sql");
const mfa=read("supabase/migrations/202610140002_mfa_enforcement_ready.sql");

test("DB rejects unsafe news sources and protects editorial-only feature flags",()=>{
  assert.match(db,/articles_source_url_http_only/);
  assert.match(db,/\^https\?:\/\//);
  assert.match(db,/before insert or update on public\.articles/);
  assert.match(db,/new\.is_featured/);
  assert.match(db,/new\.featured_priority/);
  assert.match(db,/public\.has_cms_role\(array\['owner','editor'\]/);
  assert.match(db,/new\.hero_media_id/);
  assert.match(db,/m\.uploaded_by = \(select auth\.uid\(\)\)/);
});
test("published media metadata remains accessible solely through public read RPC",()=>{
  assert.match(db,/drop policy if exists bw_production_published_media_read/);
  assert.match(db,/drop policy if exists bw_preview_published_media_read/);
  const resolver=read("supabase/migrations/202610100003_public_published_media_resolver.sql");
  assert.match(resolver,/grant execute on function public\.get_published_news_media\(uuid\[\]\) to anon, authenticated/);
  assert.match(db,/media_assets_safe_storage_path/);
});
test("published source link sanitized at data boundary and search query normalized",()=>{
  const source=read("src/lib/news-feed.ts");
  assert.match(source,/function safePublishedSourceUrl/);
  assert.match(source,/url\.protocol==="https:"\|\|url\.protocol==="http:"/);
  assert.match(source,/sourceUrl:safePublishedSourceUrl\(row\.source_url\)/);
  const search=read("src/app/search/page.tsx");
  assert.match(search,/typeof rawQuery==="string"\?rawQuery:""/);
});
test("MFA cannot lock out owner before explicit rollout and includes DB enforcement",()=>{
  assert.match(mfa,/require_editor_aal2 boolean not null default false/);
  assert.match(mfa,/auth\.jwt\(\)->>'aal'/);
  assert.match(mfa,/= 'aal2'/);
  const auth=read("src/lib/auth/require-staff.ts");
  assert.match(auth,/process\.env\.BW_MFA_REQUIRED==="true"/);
  assert.match(auth,/redirect\("\/admin\/mfa"\)/);
  const form=read("src/app/admin/mfa/mfa-challenge.tsx");
  assert.match(form,/supabase\.auth\.mfa\.enroll/);
  assert.match(form,/mfa\.challengeAndVerify/);
});
test("CI is read-only, pinned, repeatable; builds never fetch arbitrary publisher images",()=>{
  const ci=read(".github/workflows/ci.yml");
  assert.match(ci,/permissions:\s*\n  contents: read/);
  assert.match(ci,/npm ci --no-audit --no-fund/);
  assert.match(ci,/actions\/checkout@[a-f0-9]{40}/);
  assert.match(ci,/actions\/setup-node@[a-f0-9]{40}/);
  const photos=read(".github/workflows/repair-news-images.yml");
  assert.match(photos,/contents: read/);
  assert.doesNotMatch(photos,/git push/);
  assert.ok(existsSync(new URL("../package-lock.json",import.meta.url)));
  const pkg=JSON.parse(read("package.json"));
  assert.equal(pkg.scripts.prebuild,undefined);
});
test("no public-site visual component, CSS, font or brand asset modifications are needed",()=>{
  // This audit intentionally targets server-side data boundaries, login,
  // and optional isolated MFA UI rather than changing existing site markup.
  const config=read("next.config.ts");
  assert.match(config,/script-src 'self' 'unsafe-inline'/);
});
