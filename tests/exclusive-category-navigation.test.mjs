import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("exclusive homepage section never falls back to featured or normal stories",()=>{
 const home=read("src/app/page.tsx");
 assert.match(home,/const select=articles\.filter\(a=>a\.categorySlug==="exclusive"\)/);
 assert.doesNotMatch(home,/selected\.length\s*\?/);
 assert.doesNotMatch(home,/articles\.slice\(0,4\)/);
 assert.match(home,/href="\/category\/exclusive" boxed hideCategory items=\{select\}/);
 assert.match(home,/!items\.length&&!boxed/);
 assert.match(home,/এখনো কোনো এক্সক্লুসিভ প্রতিবেদন প্রকাশিত হয়নি/);
});

test("exclusive has a standalone navigation destination and matching category page",()=>{
 const header=read("src/components/site-header.tsx");
 const cats=read("src/lib/demo-news.ts");
 const page=read("src/app/category/[slug]/page.tsx");
 assert.match(header,/label:"এক্সক্লুসিভ",href:"\/category\/exclusive"/);
 assert.match(header,/const allLinks=\[\.\.\.topLinks,/);
 assert.match(cats,/slug:"exclusive",label:"এক্সক্লুসিভ"/);
 assert.match(page,/getPublishedNewsByCategory\(slug,100\)/);
 assert.match(page,/hideCategory=\{slug==="exclusive"\}/);
 assert.match(page,/items\.filter\(item=>item\.categorySlug===slug\)/);
 const feed=read("src/lib/news-feed.ts");
 assert.match(feed,/\.select\("id,slug,headline,summary,is_featured,published_at,hero_media_id,categories!inner\(slug,label_bn\)"\)/);
 assert.match(feed,/\.eq\("categories.slug",slug\)/);
 assert.match(feed,/\.eq\("status","published"\)/);
});

test("exclusive is opt-in via CMS category without reassigning existing articles",()=>{
 const migration=read("supabase/migrations/202610210001_exclusive_category.sql");
 const form=read("src/components/admin/article-form.tsx");
 const card=read("src/components/news-card.tsx");
 assert.match(migration,/insert into public\.categories/);
 assert.match(migration,/values \('exclusive','এক্সক্লুসিভ',5,true\)/);
 assert.doesNotMatch(migration,/update\s+public\.articles/i);
 assert.match(form,/categories\.map\(c=>/);
 assert.match(card,/!hideCategory&&<span className="bw-tag">/);
});
