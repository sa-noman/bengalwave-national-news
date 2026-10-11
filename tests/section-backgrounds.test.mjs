import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("only full-width news section bands are white, without alternating blue/red",()=>{
 const page=read("src/app/page.tsx");
 const css=read("src/app/newsroom.css");
 assert.match(css,/\.bw-home,\.bw-website\.bw-home\{background:#fff/);
 assert.match(css,/\.bw-home \.bw-lead-band\{background:#fff/);
 assert.match(css,/\.bw-home \.bw-section\{[^}]*background:#fff/);
 assert.doesNotMatch(page,/bw-section--(?:blue|red)|tone="(?:blue|red)"/);
 assert.doesNotMatch(css,/\.bw-home \.bw-section--(?:blue|red)\{/);
});
test("selected reports and feature & culture preserve their original colors",()=>{
 const css=read("src/app/newsroom.css");
 assert.match(css,/\.bw-home \.bw-section \.bw-selected-box\{background:#fcf0da;border:1px solid #f0dcb4\}/);
 assert.match(css,/\.bw-home \.bw-section--feature \.bw-feature-panel\{background:#F4D36185;border:1px solid #e2b93c88;color:#16231e\}/);
 assert.match(css,/\.bw-home \.bw-section--feature \.bw-card-summary,\s*\.bw-home \.bw-section--feature \.bw-card-meta\{color:#5b4a14\}/);
});
test("section hairlines and responsive content width remain unchanged",()=>{
 const page=read("src/app/page.tsx");
 const css=read("src/app/newsroom.css");
 assert.match(page,/return <section className="bw-section"><div className="bw-wrap">/);
 assert.match(page,/bw-lead-band"><div className="bw-wrap bw-hero"/);
 assert.match(css,/\.bw-home \.bw-section\{[^}]*border-bottom:1px solid #e6e6e6/);
 assert.match(css,/\.bw-home \.bw-section\{padding-block:27px 30px/);
});
test("original header, heritage art and gold footer wave are preserved",()=>{
 const css=read("src/app/newsroom.css");
 // The old site art remains in the masthead only. Heritage has the
 // user-approved replacement gradients and SVG artwork without the old watermark.
 assert.match(css,/\.bw-masthead\{[^}]*heritage-banner.webp/);
 assert.doesNotMatch(css,/\.bw-heritage\{[^}]*heritage-banner.webp/);
 const heritage=read("src/app/heritage-stories.css");
 const svg=read("src/components/heritage-background.tsx");
 assert.match(heritage,/height:260px/);
 assert.match(heritage,/linear-gradient\(90deg,#eef0e2,#f8f2e3 30%,#f8f1e0 60%,#f8ecd4\)/);
 assert.match(svg,/className="bw-heritage-art bw-heritage-art-left"/);
 assert.match(svg,/className="bw-heritage-art bw-heritage-art-right"/);
 const scene=read("src/components/footer-riverscape.tsx");
 assert.match(css,/\.bw-footer-wave\{[^}]*top:-29px/);
 assert.match(scene,/stroke="#FBB040"/);
});
