import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("site retains source prototype three-row header and rounded-square logo",()=>{
 const header=read("src/components/site-header.tsx");
 const styles=read("src/app/newsroom.css");
 assert.match(header,/bw-topbar/);
 assert.match(header,/bw-masthead/);
 assert.match(header,/bw-navbar/);
 assert.match(styles,/--bw-green:#053d36/);
 assert.match(styles,/--bw-red:#cf3a2c/);
 assert.match(styles,/--bw-yellow:#FBB040/);
 assert.match(styles,/\.bw-brand-mark\{[^}]*border-radius:14px/);
 assert.doesNotMatch(styles,/\.bw-brand-mark\{[^}]*border-radius:50%/);
});
test("responsive frontend has a working client menu and mobile bottom navigation",()=>{
 const header=read("src/components/site-header.tsx");
 const css=read("src/app/newsroom.css");
 assert.match(header,/setDrawerOpen\(true\)/);
 assert.match(header,/bw-bottom-nav/);
 assert.match(header,/aria-controls="bw-side-drawer"/);
 assert.match(css,/@media\(max-width:760px\)/);
});
test("homepage follows prototype sections and wave heritage banner",()=>{
 const home=read("src/app/page.tsx");
 for(const section of ["bw-hero","bw-grid-four","bw-selected-box","bw-feature-panel"]){
  assert.match(home,new RegExp(section));
 }
 // The standalone HeritageStories component owns the banner markup now.
 assert.match(home,/<HeritageStories\/>/);
 assert.match(read("src/components/heritage-stories.tsx"),/className="bw-heritage"/);
});
test("prototype typography and carousel cards remain present",()=>{
 const css=read("src/app/newsroom.css");
 assert.match(css,/Noto Serif Bengali/);
 assert.match(css,/scroll-snap-type:x mandatory/);
 assert.match(read("src/components/site-footer.tsx"),/bw-footer-nav/);
});
test("news routing and published-only data constraints remain intact",()=>{
 assert.match(read("src/components/news-card.tsx"),/const href="\/news\/"/);
 assert.match(read("src/lib/news-feed.ts"),/\.eq\("status","published"\)/);
 const robots=read("src/app/robots.ts");
 assert.match(robots,/disallow: "\/"/);
 assert.match(robots,/allow: "\/"/);
});
