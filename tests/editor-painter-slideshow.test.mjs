import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("legacy story V1 remains intact alongside versioned newsroom data",()=>{
 const legacy=source("src/lib/rich-article.ts");
 const modern=source("src/lib/newsroom-document.ts");
 assert.match(legacy,/RICH_BODY_PREFIX="BW_RICH_V1\\n"/);
 assert.match(modern,/NEWSROOM_PREFIX="BW_NEWSROOM_V2\\n"/);
 assert.match(modern,/isPhoto/);
 assert.match(modern,/validateNewsroomBody/);
});
test("media nodes are draggable, removable, captioned and reorderable",()=>{
 const nodes=source("src/components/admin/newsroom-nodes.tsx");
 assert.match(nodes,/draggable:true/);
 assert.match(nodes,/onClick=\{deleteNode\}/);
 assert.match(nodes,/caption:e\.target\.value/);
 assert.match(nodes,/mode==="slideshow"/);
 assert.match(nodes,/const move=/);
 assert.match(nodes,/＋ আরও স্লাইড/);
 assert.match(nodes,/newsCallout/);
});
test("Tiptap handles real selection, undo, redo and format painter",()=>{
 const editor=source("src/components/admin/article-body-editor.tsx");
 assert.match(editor,/\.insertContentAt\(position,node\)/);
 assert.match(editor,/\.undo\(\)\.run\(\)/);
 assert.match(editor,/\.redo\(\)\.run\(\)/);
 assert.match(editor,/paintRef\.current/);
 assert.match(editor,/\.unsetAllMarks\(\)\.clearNodes\(\)/);
 assert.match(editor,/\.setFontSize\(/);
 assert.match(editor,/\.setColor\(/);
});
test("publication and preview display slideshow captions and safe text",()=>{
 const component=source("src/components/article-slideshow.tsx");
 const renderer=source("src/components/newsroom-article-body.tsx");
 const editor=source("src/components/admin/article-body-editor.tsx");
 assert.match(component,/aria-roledescription="carousel"/);
 assert.match(component,/active\.caption/);
 assert.match(renderer,/ArticleSlideshow/);
 assert.match(renderer,/safeStoryImageUrl/);
 assert.match(editor,/allowLocalImages/);
 assert.match(editor,/showPreview/);
});
test("quote and callout border color follows BengalWave, validated before publishing",()=>{
 const nodes=source("src/components/admin/newsroom-nodes.tsx");
 const json=source("src/lib/newsroom-document.ts");
 const css=source("src/app/newsroom-editor.css");
 assert.match(nodes,/borderColor:\{default:"#0b4838"\}/);
 assert.match(json,/COLORS/);
 assert.match(css,/bw-nr-callout/);
 assert.match(css,/border-left:4px solid #0b4838/);
});
