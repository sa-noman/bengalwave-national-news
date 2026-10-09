import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("user-supplied code-only footer artwork replaces the former SVG background",()=>{
 const scene=read("src/components/footer-riverscape.tsx");
 const css=read("src/app/newsroom.css");
 const footer=read("src/components/site-footer.tsx");
 assert.match(footer,/<FooterRiverscape\/>/);
 assert.match(scene,/<svg className="bw-footer-scene" viewBox="0 0 1600 360" preserveAspectRatio="xMidYMid meet"/);
 assert.match(scene,/<circle cx="1490" cy="150" r="46"/);
 assert.match(scene,/translate\(190 238\) scale\(1\.15\)/);
 assert.match(scene,/M1180 262Q1330 296 1570 252/);
 assert.match(css,/\.bw-footer-artwork\{[^}]*overflow:hidden/);
 assert.match(css,/\.bw-footer-scene\{[^}]*width:max\(100%,900px\);height:auto/);
 assert.doesNotMatch(scene,/<image\b|<img\b|\.webp|\.png|\.avif|href="https?:\/\//);
 for(const file of ["public/prototype/footer-riverscape.avif","public/prototype/footer-river-watermark.webp"]){
  assert.equal(existsSync(new URL("../"+file,import.meta.url)),false);
 }
});
