import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("dashboard displays real aggregated views beside published articles only",()=>{
 const page=read("src/app/admin/page.tsx");
 assert.match(page,/await requireStaff\(\)/);
 assert.match(page,/supabase\.rpc\("get_staff_article_view_counts",\{p_article_ids:articleIds\}\)/);
 assert.match(page,/new Map<string,number>/);
 assert.match(page,/a\.status==="published"&&!viewError/);
 assert.match(page,/bnCount\(viewCounts\.get\(a\.id\)\|\|0\)/);
 assert.match(page,/new Intl\.NumberFormat\("bn-BD"\)/);
 assert.match(page,/পাঠসংখ্যা আনা যাচ্ছে না/);
 assert.match(page,/সংবাদ তালিকা স্বাভাবিক রয়েছে/);
});

test("aggregate view count RPC is restricted to current active CMS staff",()=>{
 const sql=read("supabase/migrations/202610290002_staff_article_view_counts.sql");
 assert.match(sql,/get_staff_article_view_counts\(p_article_ids uuid\[\]\)/);
 assert.match(sql,/security definer/);
 assert.match(sql,/set search_path = ''/);
 assert.match(sql,/auth\.uid\(\)/);
 assert.match(sql,/public\.profiles p/);
 assert.match(sql,/p\.is_active=true/);
 assert.match(sql,/owner','editor','contributor/);
 assert.match(sql,/auth\.jwt\(\)->>'aal'/);
 assert.match(sql,/cardinality\(p_article_ids\)>40/);
 assert.match(sql,/from public\.articles a/);
 assert.match(sql,/left join public\.article_read_totals t/);
 assert.match(sql,/revoke execute on function public\.get_staff_article_view_counts\(uuid\[\]\) from public, anon, authenticated/);
 assert.match(sql,/grant execute on function public\.get_staff_article_view_counts\(uuid\[\]\) to authenticated/);
 assert.doesNotMatch(sql,/grant execute on function .* to anon;/);
});

test("view counter already uses server-side once-per-day deduplication and published-only guard",()=>{
 const api=read("src/app/api/article-read/route.ts");
 const pg=read("supabase/migrations/202610290001_published_article_reads.sql");
 const client=read("src/components/article-read-tracker.tsx");
 assert.match(client,/setTimeout\(record,2500\)/);
 assert.match(api,/createHmac\("sha256",secret\)/);
 assert.match(api,/timeZone:"Asia\/Dhaka"/);
 assert.match(pg,/primary key \(article_id, visit_date, visitor_hash\)/);
 assert.match(pg,/on conflict do nothing/);
 assert.match(pg,/a\.status='published'/);
});
