import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("homepage heritage banner keeps its existing wrapper and uses reference text/icons",()=>{
  const page=read("src/app/page.tsx");
  const content=read("src/components/heritage-stories.tsx");
  assert.match(page,/<HeritageStories\/>/);
  assert.match(content,/<section className="bw-heritage"/);
  assert.match(content,/হাজার<br\/>বছরের বাংলা/);
  for(const title of ["বাংলার গল্প","ইতিহাসের পদচিহ্ন","নদীর দেশ","মাটির মানুষ","সংস্কৃতির মেলবন্ধন"]){
    assert.ok(content.includes(title),title);
  }
  assert.equal((content.match(/icon:<svg viewBox="0 0 120 80"/g)||[]).length,4);
  assert.match(content,/bw-heritage-read/);
  assert.match(content,/bw-heritage-arrow/);
  assert.doesNotMatch(content,/href:"#"/);
});

test("reference topic links use real existing search/category pages",()=>{
  const component=read("src/components/heritage-stories.tsx");
  for(const url of ["/search?q=ইতিহাস","/search?q=নদী","/search?q=লোকজ","/category/culture"]){
    assert.ok(component.includes('href:"'+url+'"'),url);
  }
});

test("reference gradient and both decorative sides override only the heritage background",()=>{
  const original=read("src/app/newsroom.css");
  const css=read("src/app/heritage-stories.css");
  const section=read("src/components/heritage-stories.tsx");
  const artwork=read("src/components/heritage-background.tsx");
  assert.match(original,/\.bw-heritage\{[^}]*url\("\/prototype\/heritage-banner\.webp"\) center 58%\/cover/);
  for(const exact of [
    "radial-gradient(60% 70% at 8% 30%,#e3e9d6,#0000)",
    "radial-gradient(40% 80% at 96% 40%,#fbe3b8,#0000)",
    "linear-gradient(90deg,#eef0e2,#f8f2e3 30%,#f8f1e0 60%,#f8ecd4)",
    "width:29%",
    "width:25%",
  ])assert.ok(css.includes(exact),exact);
  assert.match(section,/<HeritageBackground\/>/);
  assert.match(artwork,/viewBox="0 0 640 540"/);
  assert.match(artwork,/viewBox="0 0 560 540"/);
  assert.match(artwork,/M130 250H250L268 330H112Z/);
  assert.match(artwork,/M110 452Q240 486 400 436/);
  assert.doesNotMatch(css,/clip-path|background-image|bw-footer-wave|bw-masthead/);
  assert.doesNotMatch(artwork,/<clipPath|className="edge"|className="bw-footer-wave"/);
  assert.match(read("src/app/layout.tsx"),/import "\.\/heritage-stories\.css";/);
});

test("the existing gold wave silhouette, stroke and footer background remain unchanged",()=>{
  const original=read("src/app/newsroom.css");
  const footer=read("src/components/footer-riverscape.tsx");
  assert.match(original,/\.bw-footer-wave\{[^}]*top:-29px[^}]*height:30px/);
  assert.match(footer,/<svg className="bw-footer-wave" viewBox="0 0 1440 30"/);
  assert.match(footer,/M0 16C180 0 360 0 540 14S900 30 1080 14 1320 2 1440 12/);
  assert.match(footer,/stroke="#FBB040" strokeWidth="3"/);
  assert.match(original,/\.bw-footer\{[^}]*#04382f/);
});

test("heritage topics use 4-column desktop and 2-column mobile without horizontal overflow",()=>{
  const css=read("src/app/heritage-stories.css");
  assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:700px\)/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/min-width:0/);
  assert.match(css,/\.bw-heritage-topic:focus-visible/);
});
