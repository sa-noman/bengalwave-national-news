import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(file)=>readFileSync(new URL("../"+file,import.meta.url),"utf8");

test("authenticated CMS RLS helper can execute without opening secret tables",()=>{
  const sql=read("supabase/migrations/202610130003_restore_authenticated_private_rls_schema_usage.sql");
  assert.match(sql,/grant usage on schema private to authenticated;/i);
  assert.match(sql,/revoke all on private\.editor_login_rate_limit_guard from public, anon, authenticated;/i);
  assert.match(sql,/revoke usage on schema private from anon;/i);
  assert.doesNotMatch(sql,/grant\s+select\s+on\s+private\./i);
});

test("article RLS depends on the protected CMS role helper",()=>{
  const sql=read("supabase/migrations/202610090001_initial_cms.sql");
  assert.match(sql,/has_cms_role/);
});
