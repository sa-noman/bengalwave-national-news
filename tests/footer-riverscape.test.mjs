import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("footer scene is truly inline vector code without image files",()=>{
 const css=read("src/app/newsroom.css");
 const footer=read("src/components/site-footer.tsx");
 const scene=read("src/components/footer-riverscape.tsx");
 assert.match(footer,/<FooterRiverscape\/>/);
 assert.match(scene,/<svg className="bw-footer-scene" viewBox="0 0 1600 340"/);
 assert.match(scene,/<clipPath id="bw-footer-outline">/);
 assert.match(scene,/<circle cx="1155" cy="115"/);
 assert.match(scene,/stroke="#FBB040"/);
 assert.match(scene,/<path d="M1070 263/);
 assert.doesNotMatch(scene,/<image\b|<img\b|\.png|\.webp|\.avif|https?:\/\//);
 assert.match(css,/\.bw-footer-scene\{[^}]*pointer-events:none/);
 assert.doesNotMatch(css,/footer-(?:riverscape|river-watermark)\.(?:avif|webp)/);
 for(const file of ["public/prototype/footer-riverscape.avif","public/prototype/footer-river-watermark.webp"]) {
  assert.equal(existsSync(new URL("../"+file,import.meta.url)),false,file);
 }
});
