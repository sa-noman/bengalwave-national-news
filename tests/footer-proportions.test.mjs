import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("footer river artwork preserves proportions and keeps the decorative layer subtle",()=>{
 const svg=read("src/components/footer-riverscape.tsx");
 const css=read("src/app/newsroom.css");
 const footer=read("src/components/site-footer.tsx");
 assert.match(svg,/viewBox="0 0 1600 220" preserveAspectRatio="xMidYMid slice"/);
 assert.match(svg,/<svg className="bw-footer-wave"[^>]*preserveAspectRatio="none"/);
 assert.match(svg,/<g opacity="\.76">/);
 assert.match(svg,/<g transform="translate\(0 -75\)">/);
 assert.match(svg,/<circle cx="1155" cy="155" r="46"/);
 assert.match(svg,/<svg className="bw-footer-wave"[^>]*>[\s\S]*<path d="M0 27 [^"]*" fill="none" stroke="#FBB040"/);
 assert.match(css,/\.bw-footer-scene\{[^}]*inset:0[^}]*pointer-events:none/);
 assert.match(css,/\.bw-footer-wave\{[^}]*top:-29px/);
 assert.match(footer,/<FooterRiverscape\/>/);
});
