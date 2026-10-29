import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("all homepage section titles link to their existing destinations",()=>{
  const page=read("src/app/page.tsx");
  assert.match(page,/<h2><Link href=\{href\}>\{title\}<\/Link><\/h2>/);
  for(const [label,route] of [
    ["জাতীয়","national"],
    ["আন্তর্জাতিক","international"],
    ["খেলাধুলা","sports"],
    ["অর্থনীতি","economy"],
  ]){
    assert.ok(page.includes('title="'+label+'" href="/category/'+route+'"'),label+" category target missing");
  }
  const sidebar=read("src/components/home-news-sidebar.tsx");
  assert.ok(sidebar.includes('<Link href="/latest">সর্বশেষ সংবাদ</Link>'));
  assert.ok(sidebar.includes('সর্বাধিক পঠিত'));
  assert.ok(page.includes('title="ফিচার ও সংস্কৃতি" href="/category/features"'));
});

test("section title links preserve typography and turn brand red on hover or focus",()=>{
  const css=read("src/app/typography.css");
  assert.match(css,/\.bw-section-heading h2 > a\s*\{\s*color:inherit;\s*font:inherit;/);
  assert.match(css,/\.bw-section-heading h2 > a:hover/);
  assert.match(css,/\.bw-section-heading h2 > a:focus-visible/);
  assert.match(css,/color:var\(--bw-red\)/);
});
