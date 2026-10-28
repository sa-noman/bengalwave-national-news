import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("mobile off-canvas drawer exposes dialog semantics, traps focus, and restores opener focus",()=>{
 const header=read("src/components/site-header.tsx");
 assert.match(header,/role="dialog" aria-modal=\{drawerOpen\?"true":undefined\}/);
 assert.match(header,/e\.key==="Tab"&&drawerRef\.current/);
 assert.match(header,/drawerTriggerRef\.current=document\.activeElement instanceof HTMLElement/);
 assert.match(header,/const closeMenu=\(\)=>\{setDrawerOpen\(false\);\(drawerTriggerRef\.current\|\|menuButton\.current\)\?\.focus\(\);\}/);
 assert.match(header,/aria-controls="bw-header-search-form"/);
 assert.match(header,/id="bw-header-search-form"/);
});

test("article slideshow supports arrow keys, single live counter, and >=24px dot touch targets",()=>{
 const slider=read("src/components/article-slideshow.tsx");
 const css=read("src/app/rich-article.css");
 assert.match(slider,/e\.key==="ArrowLeft"/);
 assert.match(slider,/e\.key==="ArrowRight"/);
 assert.match(slider,/className="bw-story-slider-counter" aria-live="polite" aria-atomic="true"/);
 assert.match(slider,/const banglaNumber=\(value:number\)=>String\(value\)\.replace/);
 assert.match(slider,/\{banglaNumber\(index\+1\)\} \/ \{banglaNumber\(slides\.length\)\}/);
 assert.match(css,/\.bw-story-slider-counter\{position:absolute;left:12px;top:12px;z-index:3/);
 assert.match(css,/\.bw-story-slider-controls\{position:absolute;right:12px;top:12px/);
 assert.doesNotMatch(slider,/className="bw-story-slider-caption" aria-live/);
 assert.match(slider,/className="bw-story-slider-dots" role="group"/);
 assert.match(css,/\.bw-story-slider-dots button\{[^}]*min-width:24px;min-height:24px/);
 assert.match(css,/\.bw-story-slider-dots button::before\{[^}]*width:8px;height:8px/);
 assert.match(css,/\.bw-story-slider-dots button\[aria-current="true"\]::before\{width:24px/);
});

test("mobile safe-area bottom inset, fail-open leak-check logging, and env template hygiene",()=>{
 const css=read("src/app/newsroom.css");
 const layout=read("src/app/layout.tsx");
 const setPass=read("src/app/admin/set-password/actions.ts");
 const envExample=read(".env.example");
 assert.match(css,/body\{padding-bottom:calc\(57px \+ env\(safe-area-inset-bottom,0px\)\)\}/);
 assert.match(layout,/viewportFit:"cover"/);
 assert.match(setPass,/if\(compromised===null\)console\.warn\(/);
 assert.doesNotMatch(envExample,/lkleykmjphmliqybmwff/);
});
