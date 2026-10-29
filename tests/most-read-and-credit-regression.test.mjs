import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("most-read ranking uses actual deduplicated published article views, not a fabricated popularity sort",()=>{
 const sql=read("supabase/migrations/202610290001_published_article_reads.sql");
 const feed=read("src/lib/news-feed.ts");
 assert.match(sql,/create table if not exists public\.article_read_uniques/);
 assert.match(sql,/primary key \(article_id, visit_date, visitor_hash\)/);
 assert.match(sql,/on conflict do nothing/);
 assert.match(sql,/get diagnostics v_added = row_count/);
 assert.match(sql,/a\.status='published'/);
 assert.match(sql,/a\.published_at<=pg_catalog\.now\(\)/);
 assert.match(sql,/create or replace function public\.get_most_read_article_ids/);
 assert.match(sql,/order by t\.view_count desc/);
 assert.match(sql,/alter table public\.article_read_uniques enable row level security/);
 assert.match(sql,/alter table public\.article_read_totals enable row level security/);
 assert.match(sql,/revoke all on table public\.article_read_uniques from public, anon, authenticated/);
 assert.match(sql,/set search_path = ''/);
 assert.match(feed,/supabase\.rpc\("get_most_read_article_ids",\{p_limit:5\}\)/);
 assert.match(feed,/return ids\.flatMap/);
 assert.doesNotMatch(feed,/popular.*publishedAt/);
});

test("view counter skips preview, bot traffic and duplicate same-day browser refreshes",()=>{
 const api=read("src/app/api/article-read/route.ts");
 const client=read("src/components/article-read-tracker.tsx");
 const article=read("src/app/news/[slug]/page.tsx");
 assert.match(api,/process\.env\.VERCEL_ENV!=="production"/);
 assert.match(api,/origin!==new URL\(request\.url\)\.origin/);
 assert.match(api,/fetchSite!=="same-origin"/);
 assert.match(api,/bot\|crawl\|spider\|headless/);
 assert.match(api,/EDITOR_LOGIN_RATE_LIMIT_SECRET/);
 assert.match(api,/createHmac\("sha256",secret\)/);
 assert.match(api,/timeZone:"Asia\/Dhaka"/);
 assert.match(api,/httpOnly:true,secure:true,sameSite:"lax"/);
 assert.match(api,/record_published_article_read/);
 assert.match(client,/document\.visibilityState!=="visible"/);
 assert.match(client,/setTimeout\(record,2500\)/);
 assert.match(client,/method:"POST",credentials:"same-origin"/);
 assert.match(article,/<ArticleReadTracker slug=\{item\.slug\}/);
});

test("mobile latest and popular share one accessible tab panel; desktop remains stacked",()=>{
 const side=read("src/components/home-news-sidebar.tsx");
 const home=read("src/app/page.tsx");
 const css=read("src/app/newsroom.css");
 assert.match(home,/HomeNewsSidebar latest=\{latest\} popular=\{popular\}/);
 assert.match(home,/await getMostReadNews\(\)/);
 assert.match(side,/role="tablist"/);
 assert.match(side,/role="tabpanel"/);
 assert.match(side,/aria-selected=\{tab==="latest"\}/);
 assert.match(side,/aria-selected=\{tab==="popular"\}/);
 assert.match(side,/bengaliNumber\(i\+1\)/);
 assert.match(side,/\.slice\(0,5\)/);
 assert.match(side,/latest\.slice\(0,4\)/);
 assert.match(side,/ResizeObserver/);
 assert.match(css,/\.bw-home-sidebar-mobile\{display:none\}/);
 assert.match(css,/@media\(max-width:760px\)\{/);
 assert.match(css,/\.bw-home-sidebar-desktop\{display:none\}/);
 assert.match(css,/\.bw-home-news-tabs/);
});

test("photo credit is exactly the editor-entered text and not automatically prefixed",()=>{
 const source=read("src/components/photo-caption.tsx");
 const slider=read("src/components/article-slideshow.tsx");
 assert.ok(source.includes('let creditText=(credit||"").trim();'));
 assert.ok(source.includes('>{creditText}</span>'));
 assert.ok(!source.includes('>ছবি: {creditText}'));
 assert.ok(slider.includes(" | {activeCaption.creditText}"));
 assert.ok(!slider.includes(" | ছবি: {activeCaption.creditText}"));
});

test("copy button uses one-second green flash but retains the longer checkmark",()=>{
 const share=read("src/components/article-share-bar.tsx");
 const css=read("src/app/rich-article.css");
 assert.match(share,/setTimeout\(\(\)=>setCopyFlash\(false\),1000\)/);
 assert.match(share,/setTimeout\(\(\)=>setCopied\(false\),2400\)/);
 assert.match(share,/bw-share-copy-flash/);
 assert.match(share,/ShareIcon kind=\{copied\?"check":"link"\}/);
 assert.match(css,/\.bw-article-share \.bw-share-icon\.bw-share-copy-flash:hover/);
});
