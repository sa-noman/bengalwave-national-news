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

test("original heritage background image, gradient and footer wave stay untouched",()=>{
  const css=read("src/app/newsroom.css");
  const footer=read("src/components/footer-riverscape.tsx");
  const newCss=read("src/app/heritage-stories.css");
  assert.match(css,/\.bw-heritage\{[^}]*url\("\/prototype\/heritage-banner\.webp"\) center 58%\/cover/);
  assert.match(css,/\.bw-footer-wave\{[^}]*top:-29px/);
  assert.match(footer,/stroke="#FBB040"/);
  assert.match(footer,/M0 16C180 0 360 0 540 14S900 30 1080 14 1320 2 1440 12/);
  assert.doesNotMatch(newCss,/url\(|clip-path|background-image|bw-footer|bw-masthead/);
  assert.match(read("src/app/layout.tsx"),/import "\.\/heritage-stories\.css";/);
});

test("heritage topics use 4-column desktop and 2-column mobile without horizontal overflow",()=>{
  const css=read("src/app/heritage-stories.css");
  assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:700px\)/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/min-width:0/);
  assert.match(css,/\.bw-heritage-topic:focus-visible/);
});
