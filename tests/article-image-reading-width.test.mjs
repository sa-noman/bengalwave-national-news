import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync("src/app/news/[slug]/page.tsx","utf8");
const css=readFileSync("src/app/newsroom.css","utf8");

test("every article hero uses the same 780px responsive width as its text",()=>{
 assert.match(css,/\.bw-article-body\{[^}]*max-width:780px/);
 assert.match(css,/\.bw-article figure\{[^}]*width:100%;max-width:780px/);
 assert.match(page,/className="bw-img-frame bw-article-image-frame"/);
 assert.doesNotMatch(page,/maxWidth:item\.fullImageWidth/);
 assert.match(page,/sizes="\(max-width: 812px\) calc\(100vw - 32px\), 780px"/);
});
test("article hero frames stay uniform while displaying the uncropped image",()=>{
 assert.match(css,/\.bw-article \.bw-article-image-frame\{[^}]*width:100%;aspect-ratio:3\/2/);
 assert.match(css,/\.bw-article \.bw-article-image-frame > img\{[^}]*object-fit:contain/);
});
