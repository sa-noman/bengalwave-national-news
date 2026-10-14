import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");

test("Direct Storage API upload must use an owner UUID and standard image pair",()=>{
  const sql=read("supabase/migrations/202610140003_strict_storage_upload_policy.sql");
  assert.match(sql,/create policy bw_production_media_upload/);
  assert.match(sql,/create policy bw_preview_media_upload/);
  assert.match(sql,/\(full\|thumb\)\[.\]webp/);
  assert.match(sql,/storage\.foldername\(name\)/);
  assert.match(sql,/public\.has_cms_role/);
});
test("Staff cannot delete an image still attached to published news",()=>{
  const sql=read("supabase/migrations/202610140003_strict_storage_upload_policy.sql");
  assert.match(sql,/bw_production_media_owner_cleanup/);
  assert.match(sql,/bw_preview_media_owner_cleanup/);
  assert.match(sql,/not exists \(/);
  assert.match(sql,/a\.status='published'/);
});
test("Production network CSP narrowed but hydrated theme scripts preserved",()=>{
  const next=read("next.config.ts");
  assert.match(next,/script-src-attr 'none'/);
  assert.match(next,/https:\/\/\*\.supabase\.co/);
  assert.match(next,/wss:\/\/\*\.supabase\.co/);
  assert.match(next,/manifest-src 'self'/);
  assert.match(next,/script-src 'self' 'unsafe-inline'/);
  assert.match(next,/source: "\/auth\/recovery"/);
  assert.match(next,/Cache-Control", value: "no-store, max-age=0"/);
});
test("Password recovery credentials removed from browser URL before first API request",()=>{
  const recovery=read("src/app/auth/recovery/page.tsx");
  const clear=recovery.indexOf('window.history.replaceState(null,"",window.location.pathname)');
  const network=recovery.indexOf("exchangeCodeForSession(code)");
  assert.ok(clear!==-1&&network!==-1&&clear<network);
  assert.match(read("src/app/auth/recovery/layout.tsx"),/index:false,follow:false/);
});
test("Security probes exclude password brute force and publication changes",()=>{
  const script=read("scripts/security-boundary-probe.mjs");
  assert.match(script,/anonymous cannot access/);
  assert.match(script,/Repeated query/);
  assert.doesNotMatch(script,/signInWithPassword|updateUser|\/auth\/v1\/token|INSERT INTO|fetch\([^)]*method:\s*"POST"/);
});
