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
 assert.match(scene,/<path d="M0 27 C180 11 360 11 540 24 S900 40 1080 24 S1420 12 1600 22" fill="none" stroke="#FBB040" strokeWidth="3"/);
 for(const klass of ["bw-footer-identity","bw-footer-nav","bw-footer-legal","bw-footer-social"]){
  assert.ok(footer.includes(klass),klass);
 }
});
