import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("all homepage news sections use white background without alternating tones",()=>{
 const page=read("src/app/page.tsx");
 const css=read("src/app/newsroom.css");
 assert.match(css,/\.bw-home,\.bw-website\.bw-home\{background:#fff/);
 assert.match(css,/\.bw-home \.bw-lead-band\{background:#fff/);
 assert.match(css,/\.bw-home \.bw-section\{[^}]*background:#fff/);
 assert.match(css,/\.bw-home \.bw-section \.bw-selected-box\{background:#fff/);
 assert.match(css,/\.bw-home \.bw-section--feature \.bw-feature-panel\{background:#fff/);
 assert.doesNotMatch(page,/bw-section--(?:blue|red)|tone="(?:blue|red)"/);
 assert.doesNotMatch(css,/\.bw-home \.bw-section--(?:blue|red)\{/);
 assert.doesNotMatch(css,/\.bw-home \.bw-section--feature \.bw-feature-panel\{background:#F4D36185/);
});
test("sections remain visually separated by hairlines and stay responsive",()=>{
 const page=read("src/app/page.tsx");
 const css=read("src/app/newsroom.css");
 assert.match(page,/return <section className="bw-section"><div className="bw-wrap">/);
 assert.match(page,/bw-lead-band"><div className="bw-wrap bw-hero"/);
 assert.match(css,/\.bw-home \.bw-section\{[^}]*border-bottom:1px solid #e6e6e6/);
 assert.match(css,/\.bw-home \.bw-section \.bw-selected-box\{[^}]*border:1px solid #e6e6e6/);
 assert.match(css,/\.bw-home \.bw-section--feature \.bw-feature-panel\{[^}]*border:1px solid #e6e6e6/);
 assert.match(css,/\.bw-home \.bw-section\{padding-block:27px 30px/);
});
test("existing branding, heritage banner and footer wave remain intact",()=>{
 const css=read("src/app/newsroom.css");
 assert.match(css,/\.bw-heritage\{[^}]*heritage-banner.webp/);
 assert.match(css,/\.bw-footer::before\{[^}]*top:-29px;height:30px/);
 assert.match(css,/stroke='%23FBB040'/);
});
