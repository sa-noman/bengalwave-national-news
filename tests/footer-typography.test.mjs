import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const css=readFileSync(new URL("../src/app/newsroom.css",import.meta.url),"utf8");
test("header and footer navigation share the Noto Serif Bengali font",()=>{
 assert.match(css,/\.bw-nav-scroll a\{[^}]*var\(--bw-serif\)/);
 assert.match(css,/\.bw-footer-nav a\{[^}]*font:500 15px\/1\.65 var\(--bw-serif\)/);
 assert.match(css,/\.bw-footer-inner\{[^}]*font-family:var\(--bw-serif\)/);
});
test("footer labels do not use bold Hind Siliguri and retain smaller readable sizing",()=>{
 assert.match(css,/\.bw-footer-legal\{[^}]*font:500 13px\/1\.7 var\(--bw-serif\)/);
 assert.match(css,/\.bw-footer-social\{[^}]*font:500 13px\/1\.7 var\(--bw-serif\)/);
 assert.doesNotMatch(css,/\.bw-footer-nav a\{[^}]*var\(--bw-sans\)/);
 assert.doesNotMatch(css,/\.bw-footer-nav a\{[^}]*font:700/);
});
test("wave outline, compact rows, logo and footer divider are preserved",()=>{
 const scene=readFileSync(new URL("../src/components/footer-riverscape.tsx",import.meta.url),"utf8");
 assert.match(css,/\.bw-footer-scene\{[^}]*inset:0/);
 assert.match(css,/\.bw-footer-wave\{[^}]*top:-29px/);
 assert.match(scene,/stroke="#FBB040"/);
 assert.match(css,/\.bw-footer-divider\{[^}]*background:#c5a150/);
 assert.match(css,/\.bw-footer-mark\{[^}]*border-radius:13px/);
});
