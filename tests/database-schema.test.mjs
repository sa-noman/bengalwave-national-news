import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const sql=readFileSync(new URL("../supabase/migrations/202610090001_initial_cms.sql", import.meta.url),"utf8");
test("all ten editorial tables enable row-level security",()=>{
  const tables=["profiles","categories","tags","media_assets","articles","article_tags","article_revisions","sources","imported_items","audit_logs"];
  for (const table of tables) assert.match(sql,new RegExp("alter table public\\."+table+" enable row level security;"));
});
test("no automation source can auto publish by default",()=>{
  assert.match(sql,/auto_publish_enabled boolean not null default false/);
  assert.match(sql,/and not auto_publish_enabled/);
});
test("unpublished stories cannot be publicly read",()=>{
  assert.match(sql,/article_public_read[\s\S]*?using\(status='published' and published_at <= now\(\)\)/);
});
test("source imports deduplicate their external post IDs",()=>{
  assert.match(sql,/unique\(source_id, external_post_id\)/);
});
test("owner privileges are not granted on sign-up",()=>{
  assert.match(sql,/role public\.cms_role not null default 'contributor'/);
  assert.doesNotMatch(sql,/create policy .*profiles.* for insert/);
});
