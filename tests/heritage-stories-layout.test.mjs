import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("heritage section exactly follows the provided Bengali banner structure",()=>{
 const home=read("src/app/page.tsx");
 const section=read("src/components/heritage-stories.tsx");
 assert.match(home,/<HeritageStories\/>/);
 assert.match(section,/<section className="bw-heritage"/);
 assert.match(section,/<HeritageBackground\/>/);
 assert.match(section,/হাজার বছরের<br\/>বাংলা/);
 for(const term of [
   "বাংলার গল্প","ইতিহাসের পদচিহ্ন","নদীর দেশ",
   "মাটির মানুষ","সংস্কৃতির মেলবন্ধন",
   "নদী, মাটি, মানুষ আর সংস্কৃতির অসীম যাত্রায়",
   "কৃষি, কারিগরী আর লোকজ জীবনে বাংলার শক্তি।",
 ]){
   assert.ok(section.includes(term),term);
 }
 assert.equal((section.match(/icon:<svg viewBox="0 0 120 80"/g)||[]).length,4);
 assert.equal((section.match(/className="bw-heritage-topic"/g)||[]).length,1);
 assert.doesNotMatch(section,/href:"#"/);
});

test("reference banner's actual boat and village SVG paths, strokes, and patterns are present",()=>{
 const artwork=read("src/components/heritage-background.tsx");
 for(const token of [
  'viewBox="0 0 640 540"',
  'viewBox="0 0 560 540"',
  'id="bwh"','id="bwvh"','id="bwbt"',
  'id="bwh2"','id="bwpl"','id="bwht"',
  'M0 -262Q86 -160 112 -20H-4Z',
  'translate(236 440) scale(.9)',
  'translate(540 372) scale(.34)',
  'M0 440Q280 420 560 436',
  'translate(470 424) scale(1.25)',
  'stroke="#77746b"',
 ]){
  assert.ok(artwork.includes(token),token);
 }
 assert.doesNotMatch(artwork,/clipPath|className="bw-footer-wave"|stroke="#FBB040"/);
});

test("exact source HTML gradient, font scaling, positioning, mask and desktop proportions",()=>{
 const css=read("src/app/heritage-stories.css");
 for(const piece of [
  "radial-gradient(60% 70% at 8% 30%,#e3e9d6,#0000)",
  "radial-gradient(40% 80% at 96% 40%,#fbe3b8,#0000)",
 ]){
  if(!piece.includes("f8f3e2"))assert.ok(css.includes(piece),piece);
 }
 for(const piece of [
  "linear-gradient(90deg,#eef0e2,#f8f2e3 30%,#f8f1e0 60%,#f8ecd4)",
  "font:400 max(12px,calc(100vw * 26 / 2244))/1.55",
  "height:24.2em",
  "grid-template-columns:17em repeat(4,8.4em)",
  "margin-left:20.8%",
  "padding-top:5.2em",
  "height:13.6em",
  "mask-composite:intersect",
  "width:29%","width:25%",
  "font:700 3em/1.12",
  "font:700 1.04em/1.35",
 ]){
  assert.ok(css.includes(piece),piece);
 }
 assert.doesNotMatch(css,/clip-path\s*:|url\(#bwv\)|url\(#bwm\)/);
});

test("mobile retains original two column banner and content links work",()=>{
 const css=read("src/app/heritage-stories.css");
 const section=read("src/components/heritage-stories.tsx");
 assert.match(css,/@media\(max-width:1000px\)/);
 assert.match(css,/grid-template-columns:1fr 1fr/);
 assert.match(css,/padding:36px 18px 70px/);
 assert.match(css,/min-height:17em/);
 for(const url of ["/search?q=ইতিহাস","/search?q=নদী","/search?q=লোকজ","/category/culture"]){
  assert.ok(section.includes('href:"'+url+'"'),url);
 }
});

test("Bengal Wave footer shape and golden wave remain EXACTLY unchanged",()=>{
 const footer=read("src/components/footer-riverscape.tsx");
 const original=read("src/app/newsroom.css");
 const css=read("src/app/heritage-stories.css");
 assert.match(original,/\.bw-footer-wave\{[^}]*top:-29px[^}]*height:30px/);
 assert.match(footer,/<svg className="bw-footer-wave" viewBox="0 0 1440 30"/);
 assert.match(footer,/M0 16C180 0 360 0 540 14S900 30 1080 14 1320 2 1440 12/);
 assert.match(footer,/stroke="#FBB040" strokeWidth="3"/);
 assert.match(original,/\.bw-footer\{[^}]*#04382f/);
 assert.doesNotMatch(css,/\.bw-footer-wave|\.bw-footer-scene|\.bw-masthead/);
 assert.match(read("src/app/layout.tsx"),/import "\.\/heritage-stories\.css";/);
});
