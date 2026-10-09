import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("homepage uses separate subtle branding tone for every news section",()=>{
 const page=read("src/app/page.tsx");
 const styles=read("src/app/newsroom.css");
 for(const [title,tone] of [
  ["নির্বাচিত প্রতিবেদন","cream"],
  ["জাতীয়","mint"],
  ["আন্তর্জাতিক","ivory"],
  ["খেলাধুলা","sage"],
  ["অর্থনীতি","sand"]
 ]){
  assert.match(page,new RegExp('title="'+title+'"[^>]*tone="'+tone+'"'),title);
  assert.match(styles,new RegExp("\\.bw-home \\.bw-section--"+tone+"\\{background:#[a-fA-F0-9]{6}"),tone);
 }
 assert.match(page,/bw-section bw-section--feature/);
 assert.match(styles,/\.bw-home \.bw-section--feature\{background:#fcf7e8/);
});
test("section background spans entire viewport while cards stay in original width",()=>{
 const page=read("src/app/page.tsx");
 const styles=read("src/app/newsroom.css");
 assert.match(page,/return <section className=\{"bw-section bw-section--"\+tone\}><div className="bw-wrap">/);
 assert.match(page,/bw-lead-band"><div className="bw-wrap bw-hero"/);
 assert.match(styles,/\.bw-home \.bw-section\{[^}]*border-bottom:1px/);
 assert.match(styles,/@media\(max-width:760px\)[\s\S]*\.bw-home \.bw-section\{padding-block:27px 30px/);
});
test("approved golden feature panel and footer wave are retained",()=>{
 const css=read("src/app/newsroom.css");
 assert.match(css,/\.bw-home \.bw-section--feature \.bw-feature-panel\{background:#F4D36185/);
 assert.match(css,/\.bw-footer::before\{[^}]*top:-29px;height:30px/);
 assert.match(css,/stroke='%23FBB040'/);
});
