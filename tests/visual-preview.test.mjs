import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("demo fixtures cannot reach a Vercel production deployment",()=>{
 const impl=read("src/lib/news-display.ts");
 assert.match(impl,/process\.env\.VERCEL_ENV === "preview"/);
 assert.match(impl,/process\.env\.NODE_ENV === "development"/);
 assert.match(impl,/if\(!isDesignPreview\(\)\) return null/);
 assert.match(impl,/if\(isDesignPreview\(\)\) return \{items:previewNews/);
});
test("visual preview labels sample articles unmistakably",()=>{
 const home=read("src/app/page.tsx");
 const notice=read("src/components/preview-notice.tsx");
 assert.match(home,/isDesignPreview\(\)\|\|showingSamples/);
 assert.match(home,/<PreviewNotice samples=\{showingSamples\}/);
 assert.match(notice,/বাস্তব সংবাদ নয়/);
 assert.match(read("src/components/news-card.tsx"),/নমুনা প্রতিবেদন · প্রকাশিত নয়/);
});
test("missing heritage cover is not requested by CSS",()=>{
 assert.doesNotMatch(read("src/app/globals.css"),/heritage-cover\.webp/);
});
test("no unowned domain is advertised in the footer",()=>{
 assert.doesNotMatch(read("src/components/site-footer.tsx"),/bengalwavenews\.com/);
});
test("prototype editorial sections are present",()=>{
 const home=read("src/app/page.tsx");
 for(const label of ["সর্বশেষ সংবাদ","জাতীয়","আন্তর্জাতিক","খেলাধুলা","অর্থনীতি","ফিচার ও সংস্কৃতি"]){
  assert.ok(home.includes(label),label);
 }
});
