import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const css=readFileSync(new URL("../src/app/heritage-stories.css",import.meta.url),"utf8");

test("heritage compacting applies only to phones, with no changes to desktop markup",()=>{
 const start=css.indexOf("/* Phone-only: tighter heritage cards");
 assert.ok(start>0);
 const block=css.slice(start);
 assert.match(block,/@media\(max-width:760px\)\{/);
 assert.match(block,/\.bw-heritage\{padding-bottom:12px\}/);
 assert.match(block,/\.bw-heritage-intro\{padding-bottom:14px\}/);
 assert.match(block,/\.bw-heritage-topics\{grid-auto-rows:auto;row-gap:14px\}/);
 assert.match(block,/min-height:0;/);
 assert.match(block,/grid-template-rows:46px minmax\(45px,auto\) auto 17px/);
 assert.match(css.slice(0,start),/@media \(min-width:1001px\)\{/);
});

test("compact cards keep narrow phone title space and preserve anchored artwork",()=>{
 assert.match(css,/@media\(max-width:360px\)\{[^}]*grid-template-rows:48px 75px/);
 assert.match(css,/grid-template-rows:46px minmax\(67px,auto\) auto 17px/);
 assert.match(css,/\.bw-heritage-art\{[\s\S]*?bottom:0;/);
 assert.match(css,/\.bw-heritage-art-left\{/);
 assert.match(css,/\.bw-heritage-art-right\{/);
 assert.match(css,/\.bw-heritage-art\{opacity:\.22;height:50%;transform:none\}/);
});
