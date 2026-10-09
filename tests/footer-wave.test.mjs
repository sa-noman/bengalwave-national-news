import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const css=readFileSync(new URL("../src/app/newsroom.css",import.meta.url),"utf8");
test("heritage artwork touches the footer with no empty strip",()=>{
 assert.match(css,/\.bw-footer\{position:relative;margin-top:0;background:/);
 assert.match(css,/\.bw-footer\{[^}]*#04382f/);
 assert.doesNotMatch(css,/\.bw-footer\{[^}]*margin-top:29px/);
});
test("the existing gold-outlined wave overlays the heritage artwork",()=>{
 assert.match(css,/\.bw-footer::before\{[^}]*top:-29px;height:30px/);
 assert.match(css,/stroke='%23FBB040'/);
});
