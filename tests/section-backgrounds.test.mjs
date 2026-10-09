import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("news sections alternate deep-blue tint and soft red, starting blue",()=>{
 const page=read("src/app/page.tsx");
 const expected=[
  ["নির্বাচিত প্রতিবেদন","blue"],
  ["জাতীয়","red"],
  ["আন্তর্জাতিক","blue"],
  ["খেলাধুলা","red"],
  ["অর্থনীতি","blue"]
 ];
 for(const [title,tone] of expected){
  assert.match(page,new RegExp('title="'+title+'"[^>]*tone="'+tone+'"'),title);
 }
 assert.match(page,/className="bw-section bw-section--red bw-section--feature"/);
 assert.match(page,/tone\?:"blue"\|"red"/);
});
test("blue and red section backgrounds are distinct and not cream or header colored",()=>{
 const css=read("src/app/newsroom.css");
 assert.match(css,/\.bw-home \.bw-section--blue\{background:#e6edf8;border-bottom-color:#cbd7e9\}/);
 assert.match(css,/\.bw-home \.bw-section--red\{background:#fce9e9;border-bottom-color:#edcbca\}/);
 assert.match(css,/\.bw-home \.bw-lead-band\{background:#f8fafc/);
 assert.match(css,/\.bw-home \.bw-section \.bw-selected-box\{background:#f0f4fc/);
 assert.doesNotMatch(css,/\.bw-home \.bw-section--(?:cream|mint|ivory|sage|sand)\{/);
});
test("section backgrounds remain full width, with original content grid and mobile spacing",()=>{
 const page=read("src/app/page.tsx");
 const css=read("src/app/newsroom.css");
 assert.match(page,/return <section className=\{"bw-section bw-section--"\+tone\}><div className="bw-wrap">/);
 assert.match(page,/bw-lead-band"><div className="bw-wrap bw-hero"/);
 assert.match(css,/\.bw-home \.bw-section\{[^}]*border-bottom:1px/);
 assert.match(css,/@media\(max-width:760px\)[\s\S]*\.bw-home \.bw-section\{padding-block:27px 30px/);
});
test("gold feature panel and original footer wave are not changed",()=>{
 const css=read("src/app/newsroom.css");
 assert.match(css,/\.bw-home \.bw-section--feature \.bw-feature-panel\{background:#F4D36185/);
 assert.match(css,/\.bw-footer::before\{[^}]*top:-29px;height:30px/);
 assert.match(css,/stroke='%23FBB040'/);
});
