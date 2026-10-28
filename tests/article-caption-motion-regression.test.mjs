import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("source divider and share toolbar fit the same 780px reading column",()=>{
 const css=read("src/app/rich-article.css");
 assert.match(css,/\.bw-article \.bw-article-source\{width:100%;max-width:780px;box-sizing:border-box/);
 assert.match(css,/\.bw-article \.bw-article-share\{width:100%;box-sizing:border-box/);
});

test("hero, draft, saved and inline photos all use one caption component",()=>{
 const paths=[
 "src/app/news/[slug]/page.tsx",
 "src/app/admin/articles/[id]/preview/page.tsx",
 "src/components/admin/article-body-editor.tsx",
 "src/components/newsroom-article-body.tsx",
 "src/components/rich-article-body.tsx"
 ];
 for(const path of paths)assert.match(read(path),/PhotoCaption/,path);
 const code=read("src/components/photo-caption.tsx");
 assert.match(code,/getPhotoCaptionParts/);
 assert.match(code,/normalizeCredit/);
 assert.match(code,/standalone=/);
 assert.match(code,/embedded=/);
 assert.match(code,/className="bw-photo-caption"/);
 assert.match(code,/bw-photo-caption-credit/);
 const css=read("src/app/rich-article.css");
 assert.match(css,/font:400 12px\/1\.6/);
 assert.match(css,/border-inline-start:1px solid var\(--bw-green/);
 assert.match(css,/color:#858b87/);
});

test("arrows drive opposite directional translations of photo and its blurred background",()=>{
 const code=read("src/components/article-slideshow.tsx");
 const css=read("src/app/rich-article.css");
 assert.match(code,/go\(index-1,"backward"\)/);
 assert.match(code,/go\(index\+1,"forward"\)/);
 assert.match(code,/setDirection\(move\);setOutgoing\(index\);setIndex\(target\)/);
 assert.match(code,/bw-story-slider-layer/);
 assert.match(code,/className="bw-story-slider-backdrop"/);
 assert.match(css,/@keyframes bw-slide-forward-in/);
 assert.match(css,/@keyframes bw-slide-forward-out/);
 assert.match(css,/@keyframes bw-slide-backward-in/);
 assert.match(css,/@keyframes bw-slide-backward-out/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});

test("article and CMS hyperlinks are green, blue on hover and red after visiting",()=>{
 const css=read("src/app/rich-article.css");
 const editor=read("src/app/newsroom-editor.css");
 assert.match(css,/\.bw-article \.bw-rich-article-body a:link\{color:#087e60\}/);
 assert.match(css,/\.bw-article \.bw-rich-article-body a:visited\{color:#bb2b2b\}/);
 assert.match(css,/a:visited:hover\{\s*color:#1261a5/);
 assert.match(editor,/\.bw-nr-editable a:link,\.bw-article \.bw-newsroom-published-body a:link\{color:#087e60\}/);
 assert.match(editor,/\.bw-nr-editable a:visited,\.bw-article \.bw-newsroom-published-body a:visited\{color:#bb2b2b\}/);
});

test("copy link switches its own icon to a checkmark without a visible status message",()=>{
 const share=read("src/components/article-share-bar.tsx");
 const css=read("src/app/rich-article.css");
 assert.match(share,/const \[copied,setCopied\]=useState\(false\)/);
 assert.match(share,/navigator\.clipboard\.writeText\(url\);setCopied\(true\)/);
 assert.match(share,/<ShareIcon kind=\{copied\?"check":"link"\}/);
 assert.match(share,/bw-share-copied/);
 assert.match(share,/bw-share-visually-hidden" role="status"/);
 assert.doesNotMatch(share,/className="bw-share-status"/);
 assert.match(css,/\.bw-article-share \.bw-share-icon\.bw-share-copied/);
 assert.match(css,/\.bw-share-visually-hidden\{position:absolute/);
});
