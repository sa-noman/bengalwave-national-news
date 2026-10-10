import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("only published rows appear in public news feeds",()=>{
  const feed=read("src/lib/news-feed.ts");
  assert.match(feed,/\.eq\("status","published"\)/);
  assert.match(feed,/\.lte\("published_at",new Date\(\)\.toISOString\(\)\)/);
  assert.doesNotMatch(feed,/\.in\("status",\["approved","published"\]\)/);
});

test("approved and draft articles get an authenticated preview, never automatic publication",()=>{
  const page=read("src/app/admin/articles/[id]/preview/page.tsx");
  const actions=read("src/app/admin/actions.ts");
  assert.doesNotMatch(page,/if\(!isDesignPreview\(\)\)notFound\(\)/);
  assert.match(page,/await requireStaff\(\)/);
  assert.match(page,/\.eq\("id",id\)\.maybeSingle\(\)/);
  assert.match(page,/robots:\{index:false,follow:false\}/);
  assert.match(page,/publicNewsImageUrl/);
  assert.match(actions,/intent==="approve"[\s\S]*?status="approved"/);
  assert.match(actions,/intent==="publish"[\s\S]*?status="published"/);
  assert.doesNotMatch(page,/\.update\(\{|\.insert\(\{/);
});

test("preview banner is visible even when showing real already-published articles",()=>{
  const notice=read("src/components/preview-notice.tsx");
  assert.match(notice,/GitHub Preview · লাইভ নয়/);
  for(const path of [
    "src/app/page.tsx",
    "src/app/latest/page.tsx",
    "src/app/search/page.tsx",
    "src/app/category/[slug]/page.tsx",
    "src/app/news/[slug]/page.tsx",
  ]){
    const code=read(path);
    assert.match(code,/isDesignPreview\(\)/);
    assert.match(code,/<PreviewNotice/);
  }
});

test("broken live PNGs are not linked in image-repaired GitHub preview",()=>{
  const feed=read("src/lib/news-feed.ts");
  for(const name of ["israel-iran-attack-report-2026","postal-service-week-2026"]){
    assert.doesNotMatch(feed,new RegExp(name+"\\.png"));
    assert.match(feed,new RegExp(name+"-fixed\\.webp"));
  }
});


test("preview cannot publish or mutate shared live articles",()=>{
  const actions=read("src/app/admin/actions.ts");
  const buttons=read("src/components/admin/article-submit-controls.tsx");
  assert.match(actions,/isPreviewMediaEnabled\(\)\s*&&/);
  assert.match(actions,/existing\.status==="published" \|\| intent==="publish" \|\| intent==="unpublish"/);
  assert.match(actions,/error=preview-protected/);
  assert.match(buttons,/previewOnly/);
  assert.match(buttons,/disabled=\{pending\|\|previewOnly\}/);
});
