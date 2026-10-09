import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("uploaded scenic SVG watermark is a decorative layer behind the original menu",()=>{
 const header=read("src/components/site-header.tsx");
 const svg=read("public/prototype/offcanvas-menu-watermark.svg");
 const css=read("src/app/newsroom.css");
 assert.match(header,/className="bw-menu-background" aria-hidden="true"/);
 assert.match(header,/className="bw-bg-art" src="\/prototype\/offcanvas-menu-watermark\.svg" alt=""/);
 assert.match(css,/\.bw-drawer>\.bw-menu-background\{[^}]*pointer-events:none/);
 assert.match(css,/\.bw-drawer>:not\(\.bw-menu-background\)\{position:relative;z-index:1\}/);
 assert.match(css,/\.bw-menu-background \.bw-bg-art\{[^}]*opacity:\.48/);
 for (const shape of ["bw-sun","bw-water","bw-shore","bw-haze"])assert.ok(svg.includes(shape),shape);
});
test("existing menu content, actions and links stay intact",()=>{
 const header=read("src/components/site-header.tsx");
 for(const fragment of ["bw-drawer-head","bw-drawer-search","bw-drawer-links","bw-drawer-foot","setDrawerOpen(false)","setDrawerOpen(true)","aria-controls=\"bw-side-drawer\"","allLinks.map"])assert.ok(header.includes(fragment),fragment);
 for(const label of ["প্রচ্ছদ","সর্বশেষ","জাতীয়","আন্তর্জাতিক","খেলাধুলা","অর্থনীতি","প্রযুক্তি","বিনোদন","ফিচার","সংস্কৃতি","রাজনীতি"])assert.ok(header.includes(label),label);
});
test("off-canvas drawer follows the provided left-hand scenic example",()=>{
 const css=read("src/app/newsroom.css");
 assert.match(css,/\.bw-drawer\{[^}]*left:0;right:auto/);
 assert.match(css,/\.bw-drawer\{[^}]*transform:translateX\(-100%\)/);
 assert.match(css,/\.bw-drawer\.bw-drawer-open\{transform:translateX\(0\)/);
});
test("header nav, off-canvas links and mobile navigation use footer serif type",()=>{
 const css=read("src/app/newsroom.css");
 assert.match(css,/\.bw-footer-nav a\{[^}]*font:500 15px\/1\.65 var\(--bw-serif\)/);
 assert.match(css,/\.bw-nav-scroll a\{[^}]*font:500 15px\/1\.65 var\(--bw-serif\)/);
 assert.match(css,/\.bw-drawer-links a\{[^}]*font:500 15px\/1\.65 var\(--bw-serif\)/);
 assert.match(css,/\.bw-bottom-nav>a,\.bw-bottom-nav>button\{[^}]*font:500 12px var\(--bw-serif\)/);
});
