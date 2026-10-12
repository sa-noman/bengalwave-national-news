import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const header=load("src/components/site-header.tsx");
const layout=load("src/app/layout.tsx");
const palette=load("src/app/dark-theme.css");

test("dark preference defaults to device setting, but saved manual preference wins before hydration",()=>{
 assert.match(layout,/localStorage\.getItem\("bw-theme-preference"\)/);
 assert.match(layout,/saved==="dark"\|\|\(saved!=="light"&&window\.matchMedia/);
 assert.match(layout,/document\.documentElement\.dataset\.theme=isDark\?"dark":"light"/);
 assert.match(layout,/<head><script dangerouslySetInnerHTML=\{\{__html:themeInitScript\}\}\/>/);
 assert.match(layout,/suppressHydrationWarning/);
 assert.match(layout,/import "\.\/dark-theme\.css"/);
});

test("theme button uses accessible moon/sun icons and remembers manual choice across pages",()=>{
 assert.match(header,/const MoonIcon=/);
 assert.match(header,/const SunIcon=/);
 assert.match(header,/aria-label=\{theme==="dark"\?"লাইট মোড চালু করুন":"ডার্ক মোড চালু করুন"\}/);
 assert.match(header,/aria-pressed=\{theme==="dark"\}/);
 assert.match(header,/document\.documentElement\.dataset\.theme=next/);
 assert.match(header,/window\.localStorage\.setItem\("bw-theme-preference",next\)/);
 assert.match(header,/mq\.addEventListener\("change",sync\)/);
 assert.match(header,/window\.addEventListener\("storage",sync\)/);
});

test("desktop theme icon precedes menu; mobile theme replaces top search only",()=>{
 assert.match(header,/\{themeButton\("bw-theme-nav-toggle"\)\}\s*<button ref=\{menuButton\}/);
 assert.match(header,/onClick=\{\(\)=>setSearchOpen\(!searchOpen\)\}><SearchIcon\/><\/button>\s*\{themeButton\("bw-theme-mobile-toggle"\)\}/);
 assert.match(header,/<Link href="\/search"><span aria-hidden="true">⌕<\/span>সার্চ<\/Link>/);
 assert.match(header,/className="bw-drawer-search"/);
 assert.match(palette,/\.bw-brand-actions>\.bw-head-search\{display:none\}/);
 assert.match(palette,/\.bw-theme-mobile-toggle\{display:grid/);
 assert.match(palette,/\.bw-theme-nav-toggle\{display:none\}/);
 assert.match(palette,/\.bw-theme-nav-toggle\{display:grid;flex:none\}/);
});

test("dark text contrast overrides all explicitly light homepage panels, article pages, and heritage",()=>{
 assert.match(palette,/html\[data-theme="dark"\]\{[\s\S]*?color-scheme:dark;/);
 for(const selector of [".bw-home .bw-lead-band",".bw-home .bw-section",".bw-home .bw-section .bw-card-title",".bw-home .bw-section .bw-selected-box",".bw-home .bw-section--feature .bw-feature-panel",".bw-article-body",".bw-heritage",".bw-heritage .bw-heritage-topic p",".bw-search-popup input",".admin-panel"]){
  assert.ok(palette.includes(selector),"Missing dark override: "+selector);
 }
 assert.match(palette,/--bw-mobile-lead-title-color:#edf2eb/);
 assert.match(palette,/\.bw-footer\{background:linear-gradient/);
});

test("published content/layout unchanged, with no edits to actual news",()=>{
 const main=load("src/app/page.tsx");
 assert.doesNotMatch(main,/প্রধান প্রতিবেদন \/ ০১/);
 assert.match(main,/<HeritageStories\/>/);
 assert.match(header,/className="bw-bottom-nav"/);
});
