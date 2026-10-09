import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("gold wave is separately scaled above an undistorted full-footer scene",()=>{
 const css=read("src/app/newsroom.css");
 const footer=read("src/components/site-footer.tsx");
 const scene=read("src/components/footer-riverscape.tsx");
 assert.match(css,/\.bw-footer\{[^}]*isolation:isolate[^}]*background:#04382f/);
 assert.match(css,/\.bw-footer-scene\{[^}]*inset:0[^}]*z-index:0/);
 assert.match(css,/\.bw-footer-inner\{position:relative;z-index:1/);
 assert.match(scene,/<g opacity="\.76">/);
 assert.doesNotMatch(scene,/<g clipPath="url\(#bw-footer-outline\)"/);
 assert.match(scene,/<svg className="bw-footer-wave" viewBox="0 0 1600 30" preserveAspectRatio="none"/);
 assert.match(css,/\.bw-footer-wave\{[^}]*top:-29px/);
 assert.match(scene,/<path d="M0 27 C180 11/);
 assert.match(scene,/stroke="#FBB040"/);
 for(const classname of ["bw-footer-identity","bw-footer-nav","bw-footer-legal","bw-footer-social"]){
  assert.ok(footer.includes(classname),classname);
 }
});
