import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const css=readFileSync(new URL("../src/app/newsroom.css",import.meta.url),"utf8");
const avif=readFileSync(new URL("../public/prototype/footer-riverscape.avif",import.meta.url));
test("footer uses the high-resolution sunset photo without changing its content structure",()=>{
 assert.match(css,/\.bw-footer::before\{[^}]*footer-riverscape\.avif/);
 assert.doesNotMatch(css,/\.bw-footer::before\{[^}]*footer-river-watermark\.webp/);
 assert.match(css,/@media \(max-width:760px\)\{\.bw-footer::before\{background-position:center,70% center;background-size:cover,auto 100%\}\}/);
 assert.ok(avif.length>7000);
 assert.equal(avif.toString("ascii",4,12),"ftypavif");
});
