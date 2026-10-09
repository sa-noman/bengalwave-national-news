import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path, import.meta.url),"utf8");
test("no breaking news / LIVE badges in the public components",()=>{
 const home=read("src/app/page.tsx"),header=read("src/components/site-header.tsx");
 assert.doesNotMatch(home,/Breaking News|LIVE/);
 assert.doesNotMatch(header,/Breaking News|LIVE/);
});
test("right-hand drawer and gold header rule are in styles",()=>{
 const css=read("src/app/globals.css");
 assert.match(css,/inset:0 0 0 auto/);
 assert.match(css,/border-bottom:3px solid var\(--gold\)/);
});
test("admin route is disabled until secure auth exists",()=>{
 assert.match(read("src/app/admin/page.tsx"),/notFound\(\)/);
});
test("indexing remains disabled before launch",()=>{
 assert.match(read("src/app/robots.ts"),/disallow:"\/"/);
});
test("future database imports require unique source ids",()=>{
 assert.match(read("supabase/migrations/001_blueprint.sql"),/unique\(source_id,external_post_id\)/);
});
