import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("existing wave curve and footer contents stay unchanged behind replacement scene",()=>{
 const css=read("src/app/newsroom.css");
 const footer=read("src/components/site-footer.tsx");
 const scene=read("src/components/footer-riverscape.tsx");
 assert.match(css,/\.bw-footer\{[^}]*margin-top:0/);
 assert.match(css,/\.bw-footer-wave\{[^}]*top:-29px[^}]*height:30px/);
 assert.match(css,/\.bw-footer-inner\{position:relative;z-index:1/);
 assert.match(scene,/<svg className="bw-footer-wave" viewBox="0 0 1440 30" preserveAspectRatio="none"/);
 assert.match(scene,/M0 16C180 0 360 0 540 14S900 30 1080 14 1320 2 1440 12/);
 assert.match(scene,/stroke="#FBB040" strokeWidth="3" vectorEffect="non-scaling-stroke"/);
 assert.doesNotMatch(scene,/S900 40 1080 24/);
 for(const klass of ["bw-footer-identity","bw-footer-nav","bw-footer-legal","bw-footer-social"]){
  assert.ok(footer.includes(klass),klass);
 }
});
