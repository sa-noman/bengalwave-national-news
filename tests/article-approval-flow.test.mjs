import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("editorial submit buttons use dedicated Server Actions, never fragile submit intent fields",()=>{
  const controls=read("src/components/admin/article-submit-controls.tsx");
  assert.match(controls,/formAction=\{approveArticle\}/);
  assert.match(controls,/formAction=\{submitArticleForReview\}/);
  assert.match(controls,/formAction=\{publishArticle\}/);
  assert.match(controls,/formAction=\{unpublishArticle\}/);
  assert.doesNotMatch(controls,/name="intent"/);
});

test("admin server validates role, transition and actual saved database status",()=>{
  const actions=read("src/app/admin/actions.ts");
  assert.match(actions,/export async function approveArticle\(formData:FormData\)/);
  assert.match(actions,/changeArticle\(formData,"approve"\)/);
  assert.match(actions,/export async function publishArticle\(formData:FormData\)/);
  assert.match(actions,/changeArticle\(formData,"publish"\)/);
  assert.match(actions,/const canEdit=editor\(role\)/);
  assert.match(actions,/intent==="approve" && canEdit/);
  assert.match(actions,/intent==="publish" && canEdit/);
  assert.match(actions,/\.update\(payload\)\.eq\("id",id\)\.select\("id,status"\)/);
  assert.match(actions,/if\(error \|\| !stored\)/);
  assert.match(actions,/stored\.status!==status/);
});

test("UI differentiates draft saving, editor approval and publication",()=>{
  const page=read("src/app/admin/articles/[id]/edit/page.tsx");
  assert.match(page,/query\.success==="approve"/);
  assert.match(page,/query\.success==="publish"/);
  assert.match(page,/সংক্ষিপ্ত বিবরণে অন্তত ১০ অক্ষর/);
});
