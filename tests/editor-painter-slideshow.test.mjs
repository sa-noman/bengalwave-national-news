import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("existing article model remains version one, extended only with optional safe slide and color fields",()=>{
 const c=source("src/lib/rich-article.ts");
 assert.match(c,/RICH_BODY_PREFIX="BW_RICH_V1\\n"/);
 assert.match(c,/borderColor\?:string/);
 assert.match(c,/slides\?:StorySlide\[\]/);
 assert.match(c,/v\.type==="slideshow"&&\(!Array\.isArray\(v\.slides\)/);
 assert.match(c,/block\.type==="slideshow"/);
 assert.match(c,/fileCount<=6/);
 assert.match(c,/safeStoryImageUrl\(slide\.src\)/);
});
test("slide uploads use corresponding authenticated media paths and captions, without changing articles",()=>{
 const server=source("src/lib/story-inline-images.ts");
 assert.match(server,/input="inline_image_"\+b\.id\+"_slide_"\+i/);
 assert.match(server,/slide\.caption/);
 assert.match(server,/slide\.src=url/);
 assert.match(server,/await uploadNewsImage/);
 assert.doesNotMatch(server,/update\("articles"\)/);
});
test("document editor inserts at saved caret and retains following paragraph text",()=>{
 const editor=source("src/components/admin/article-body-editor.tsx");
 assert.match(editor,/saved&&root\.contains\(saved\.commonAncestorContainer\)/);
 assert.match(editor,/tail\.setStart\(range\.startContainer,range\.startOffset\)/);
 assert.match(editor,/tail\.extractContents\(\)/);
 assert.match(editor,/root\.insertBefore\(node,block\.nextSibling\)/);
 assert.match(editor,/after\.append\(remainder\)/);
 assert.match(editor,/className="bw-doc-surface" contentEditable/);
});
test("empty photo captions restore their editable placeholder and have a recovery control",()=>{
 const editor=source("src/components/admin/article-body-editor.tsx");
 assert.match(editor,/target\.tagName==="FIGCAPTION"&&!target\.textContent\?\.trim\(\)/);
 assert.match(editor,/target\.replaceChildren\(\)/);
 assert.match(editor,/focusCaption=\(\)=>/);
 assert.match(editor,/caption\.focus\(\)/);
 assert.match(editor,/ক্যাপশন লিখুন \/ ফিরিয়ে আনুন/);
});
test("format painter is one click plus text selection rather than two separate toolbar actions",()=>{
 const editor=source("src/components/admin/article-body-editor.tsx");
 assert.match(editor,/paintActive\?paintSelection\(\):remember\(\)/);
 assert.match(editor,/styleRef\.current=\{/);
 assert.match(editor,/range\.extractContents\(\)/);
 assert.match(editor,/aria-pressed=\{paintActive\}/);
 assert.doesNotMatch(editor,/onClick=\{pasteFormatting\}/);
 assert.match(editor,/bw-doc-copy-menu/);
});
test("slideshow supports per-photo captions, controls and preview",()=>{
 const editor=source("src/components/admin/article-body-editor.tsx");
 const component=source("src/components/article-slideshow.tsx");
 const renderer=source("src/components/rich-article-body.tsx");
 assert.match(editor,/onClick=\{\(\)=>addImage\("slideshow"\)\}/);
 assert.match(editor,/onClick=\{\(\)=>addImage\("slide-add"\)\}/);
 assert.match(editor,/input\.name="inline_image_"\+id\+"_slide_"\+i/);
 assert.match(editor,/slides:figures\.map/);
 assert.match(editor,/next\.slides=/);
 assert.match(component,/aria-roledescription="carousel"/);
 assert.match(component,/aria-label="পরের ছবি"/);
 assert.match(component,/active\.caption/);
 assert.match(renderer,/<ArticleSlideshow/);
});
test("callout left border defaults green, with custom HEX color verified before save and rendering",()=>{
 const css=source("src/app/rich-article.css"),editor=source("src/components/admin/article-body-editor.tsx");
 const renderer=source("src/components/rich-article-body.tsx");
 assert.match(css,/border-left:4px solid var\(--bw-green/);
 assert.match(editor,/changeCalloutBorder=\(hex:string\)/);
 assert.match(editor,/input type="color"/);
 assert.match(editor,/callout\.dataset\.borderColor=hex/);
 assert.match(renderer,/borderLeftColor:b\.borderColor/);
});
