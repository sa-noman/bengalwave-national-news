import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("editor quotes have no left border and palette controls the quote glyph only",()=>{
 const nodes=read("src/components/admin/newsroom-nodes.tsx");
 const css=read("src/app/newsroom-editor.css");
 assert.match(nodes,/kind==="quote"\?\{"--bw-quote-accent":accent\}/);
 assert.match(nodes,/kind==="quote"\?"উদ্ধৃতিচিহ্নের রং":"বাম রেখার রং"/);
 assert.match(css,/\.bw-nr-callout-quote\{[^}]*border-left:0!important/);
 assert.match(css,/\.bw-nr-callout-quote:before\{[^}]*color:var\(--bw-quote-accent/);
});
test("published quotes use the selected mark color, while highlights keep colored left border",()=>{
 const renderer=read("src/components/newsroom-article-body.tsx");
 const css=read("src/app/newsroom-editor.css");
 assert.match(renderer,/className="bw-rich-quote bw-newsroom-quote"/);
 assert.match(renderer,/"--bw-quote-accent":border/);
 assert.match(renderer,/style=\{\{borderLeftColor:border\}\}/);
 assert.match(css,/blockquote\.bw-newsroom-quote\{border:0!important;border-left:0!important/);
 assert.match(css,/blockquote\.bw-newsroom-quote:before\{color:var\(--bw-quote-accent/);
});
test("slide fills empty edges with a blurred copy of the same source image",()=>{
 const slider=read("src/components/article-slideshow.tsx");
 const css=read("src/app/newsroom-editor.css");
 assert.match(slider,/bw-story-slider-backdrop/);
 assert.match(slider,/src=\{source\} alt=""/);
 assert.match(slider,/className="bw-story-slider-photo"/);
 assert.match(css,/\.bw-story-slider-backdrop img\{/);
 assert.match(css,/filter:blur\(24px\) brightness\(\.75\)/);
 assert.match(css,/bw-story-slider-stage>img\.bw-story-slider-photo/);
});
test("regular newsroom article text is black in light theme and readable in dark",()=>{
 const css=read("src/app/newsroom-editor.css");
 assert.match(css,/\.bw-article \.bw-newsroom-published-body\{color:#111!important\}/);
 assert.match(css,/\.bw-article \.bw-newsroom-published-body>p\{color:#111!important/);
 assert.match(css,/html\[data-theme="dark"\] \.bw-article \.bw-newsroom-published-body/);
});
