import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("footer and its wave use one uninterrupted riverscape image",()=>{
 const css=read("src/app/newsroom.css");
 const footer=read("src/components/site-footer.tsx");
 assert.match(css,/\.bw-footer\{[^}]*isolation:isolate[^}]*background:#04382f/);
 assert.match(css,/\.bw-footer::before\{[^}]*inset:-29px 0 0[^}]*footer-riverscape\.avif/);
 assert.match(css,/\.bw-footer::before\{[^}]*mask-image:[^}]*linear-gradient\(#000,#000\)/);
 assert.match(css,/\.bw-footer::after\{[^}]*FBB040/);
 assert.match(css,/\.bw-footer-inner\{position:relative;z-index:1/);
 assert.match(css,/@media \(max-width:760px\)\{\.bw-footer::before\{background-position:center,70% center/);
 assert.match(footer,/<footer className="bw-footer">/);
 assert.match(footer,/bw-footer-identity/);
 assert.match(footer,/bw-footer-nav/);
 assert.match(footer,/bw-footer-legal/);
 assert.match(footer,/bw-footer-social/);
});
