import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const css=readFileSync(new URL("../src/app/globals.css",import.meta.url),"utf8");
test("header logo is rounded square, not a full circular crop",()=>{
  assert.match(css,/\.brand-symbol\{border:1px solid #efd7a4;background:#fffaf0;border-radius:13px;/);
  assert.doesNotMatch(css,/\.brand-symbol\{[^}]*border-radius:50%/);
  assert.match(css,/\.brand-symbol img\{display:block;width:100%;height:100%;object-fit:contain\}/);
});
test("mobile header uses its own rounded-square mark",()=>{
  assert.match(css,/\.brand-symbol\{flex-basis:40px;width:40px;height:40px;border-radius:11px\}/);
});
