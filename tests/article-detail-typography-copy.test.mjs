import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("only published article pages get the requested typography adjustments",()=>{
 const page=read("src/app/news/[slug]/page.tsx");
 const css=read("src/app/rich-article.css");
 const typography=read("src/app/typography.css");
 assert.match(page,/className="bw-wrap bw-article bw-article-page"/);
 assert.match(css,/\.bw-website \.bw-article-page > \.bw-breadcrumb\{font-size:18px\}/);
 assert.match(css,/\.bw-website \.bw-article-page > article > \.bw-tag\{font-size:26px\}/);
 assert.match(css,/\.bw-website \.bw-article-page figure > figcaption\.bw-photo-caption,[\s\S]*?font-size:16px;line-height:1\.65/);
 assert.match(css,/\.bw-website \.bw-article-page \.bw-photo-caption-credit\{[\s\S]*?font-size:13px;font-style:italic;font-weight:400/);
 assert.match(css,/@media\(max-width:760px\)\{\s*\.bw-website \.bw-article-page > \.bw-breadcrumb\{font-size:16px\}/);
 assert.match(css,/\.bw-website \.bw-article-page > article > \.bw-tag\{font-size:22px\}/);
 assert.match(css,/\.bw-website \.bw-article-page \.bw-article-body > p\{font-size:18px\}/);
 assert.match(css,/\.bw-website \.bw-article-page \.bw-photo-caption-credit\{font-size:13px\}/);
 assert.match(typography,/\.bw-article \.bw-article-body\{font:400 20px\/1\.85/);
 assert.doesNotMatch(css,/\.bw-home \.bw-article-page/);
});

test("copy icon stays a check while its persistent green hover state is removed",()=>{
 const share=read("src/components/article-share-bar.tsx");
 const css=read("src/app/rich-article.css");
 assert.match(share,/setCopied\(true\)/);
 assert.match(share,/setTimeout\(\(\)=>setCopied\(false\),2400\)/);
 assert.match(share,/ShareIcon kind=\{copied\?"check":"link"\}/);
 assert.match(css,/\.bw-article-share \.bw-share-icon\.bw-share-copied:hover\{\s*background:transparent;border-color:var\(--bw-line/);
 assert.match(css,/\.bw-article-share \.bw-share-icon:hover,\.bw-article-share \.bw-share-icon:focus-visible\{\s*background:rgba\(11,72,56,\.08\)/);
 assert.match(share,/bw-share-visually-hidden/);
});
