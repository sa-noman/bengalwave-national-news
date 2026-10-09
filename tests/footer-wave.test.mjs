import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const css=readFileSync(new URL("../src/app/newsroom.css",import.meta.url),"utf8");
test("heritage artwork touches the footer with no empty strip",()=>{
 assert.match(css,/\.bw-footer\{position:relative;isolation:isolate;margin-top:0;background:/);
 assert.match(css,/\.bw-footer\{[^}]*#04382f/);
 assert.doesNotMatch(css,/\.bw-footer\{[^}]*margin-top:29px/);
});
test("the existing gold-outlined wave overlays the heritage artwork",()=>{
 const scene=readFileSync(new URL("../src/components/footer-riverscape.tsx",import.meta.url),"utf8");
 assert.match(css,/\.bw-footer-scene\{[^}]*inset:-29px 0 0/);
 assert.match(scene,/stroke="#FBB040"/);
});
