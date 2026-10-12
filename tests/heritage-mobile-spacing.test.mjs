import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const css=read("src/app/heritage-stories.css");
const mobileMarker="/* Phone-only: compact, evenly aligned two-column heritage grid.";
const phone=css.slice(css.indexOf(mobileMarker));

test("four story cards align in two columns using compact content-height rows",()=>{
 assert.ok(css.includes(mobileMarker));
 assert.match(phone,/@media\(max-width:760px\)\{/);
 assert.match(phone,/grid-auto-rows:auto;/);
 assert.match(phone,/row-gap:14px;/);
 assert.match(phone,/display:flex;\s*flex-direction:column;/);
 assert.match(phone,/min-height:0;/);
 assert.match(phone,/\.bw-heritage-icon\{\s*flex:0 0 44px/);
 assert.match(phone,/\.bw-heritage-read\{\s*flex:none;/);
 assert.match(phone,/align-self:flex-start;/);
 assert.doesNotMatch(phone,/grid-template-rows:46px/);
});

test("footer's 29px wave has sufficient clearance below every read link",()=>{
 assert.match(phone,/\.bw-heritage\{padding:27px 18px 48px\}/);
 assert.match(phone,/\.bw-heritage-read\{[\s\S]*?min-height:18px;/);
 const newsroom=read("src/app/newsroom.css");
 assert.match(newsroom,/\.bw-footer-wave\{position:absolute;top:-29px/);
 const bg=read("src/components/heritage-background.tsx");
 assert.match(bg,/bw-heritage-art-left/);
 assert.match(bg,/bw-heritage-art-right/);
});

test("desktop layout is untouched and narrow phone titles are accommodated",()=>{
 const prefix=css.slice(0,css.indexOf(mobileMarker));
 assert.match(prefix,/@media \(min-width:1001px\)\{/);
 assert.match(phone,/@media\(max-width:360px\)\{/);
 assert.match(phone,/min-height:45px;/);
 assert.match(phone,/font-size:2\.04em/);
 assert.match(phone,/font-size:2\.12em/);
});
