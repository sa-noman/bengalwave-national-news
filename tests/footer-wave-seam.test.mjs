import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("top wave and scene share one clipping path, while footer controls remain intact",()=>{
 const css=read("src/app/newsroom.css");
 const footer=read("src/components/site-footer.tsx");
 const scene=read("src/components/footer-riverscape.tsx");
 assert.match(css,/\.bw-footer\{[^}]*isolation:isolate[^}]*background:#04382f/);
 assert.match(css,/\.bw-footer-scene\{[^}]*inset:-29px 0 0[^}]*z-index:0/);
 assert.match(css,/\.bw-footer-inner\{position:relative;z-index:1/);
 assert.match(scene,/<g clipPath="url\(#bw-footer-outline\)" opacity="\.76">/);
 assert.match(scene,/<path d="M0 27 C180 11/);
 assert.match(scene,/stroke="#FBB040"/);
 for(const classname of ["bw-footer-identity","bw-footer-nav","bw-footer-legal","bw-footer-social"]){
  assert.ok(footer.includes(classname),classname);
 }
});
