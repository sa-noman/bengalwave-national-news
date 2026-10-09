import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(name)=>readFileSync(new URL("../supabase/migrations/"+name,import.meta.url),"utf8");
test("revokes anonymous access to privileged CMS functions",()=>{
  const sql=read("202610090002_harden_admin_auth.sql");
  assert.match(sql,/revoke execute on function public\.has_cms_role\(public\.cms_role\[\]\) from public, anon/);
  assert.match(sql,/revoke execute on function public\.archive_article_revision\(\) from public, anon, authenticated/);
});
test("public role check is invoker and internal definer lives in unexposed schema",()=>{
  const sql=read("202610090003_private_role_lookup.sql");
  assert.match(sql,/create schema if not exists private/);
  assert.match(sql,/security definer/);
  assert.match(sql,/create or replace function public\.has_cms_role[\s\S]*?security invoker/);
  assert.match(sql,/revoke all on function private\.has_cms_role[\s\S]*?from public, anon/);
});
test("database prevents skipping editorial approval",()=>{
  const sql=read("202610090002_harden_admin_auth.sql");
  assert.match(sql,/old\.status = 'approved' and new\.status = 'published'/);
  assert.match(sql,/raise exception 'Editor approval is required'/);
  assert.match(sql,/trg_enforce_article_transitions/);
});
