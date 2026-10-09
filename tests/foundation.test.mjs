import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path, import.meta.url),"utf8");
test("no LIVE badges or breaking news ticker",()=>{
 assert.doesNotMatch(read("src/app/page.tsx"),/Breaking News|LIVE/);
 assert.doesNotMatch(read("src/components/site-header.tsx"),/Breaking News|LIVE/);
});
test("right-side menu and golden border",()=>{
 const css=read("src/app/globals.css");
 assert.match(css,/inset:0 0 0 auto/);
 assert.match(css,/border-bottom:3px solid var\(--gold\)/);
});
test("server-verified authentication protects the admin dashboard",()=>{
 assert.match(read("src/app/admin/page.tsx"),/requireStaff\(\)/);
 assert.match(read("src/lib/auth/require-staff.ts"),/supabase\.auth\.getUser\(\)/);
 assert.match(read("src/app/admin/login/actions.ts"),/signInWithPassword/);
});
test("draft creation enforces author and cannot directly publish",()=>{
 const a=read("src/app/admin/actions.ts");
 assert.match(a,/author_id:user\.id,status:"draft"/);
 assert.match(a,/existing\.status==="approved"/);
 assert.match(a,/revalidatePath\("\/"\)/);
});
test("published-only query and indexing disabled until launch",()=>{
 const publicCode=read("src/lib/news-feed.ts");
 assert.match(publicCode,/\.eq\("status","published"\)/);
 assert.match(publicCode,/\.lte\("published_at"/);
 assert.match(read("src/app/robots.ts"),/disallow:"\/"/);
});
test("Supabase config uses a publishable key and no service-role key",()=>{
 const config=read("src/lib/supabase/config.ts");
 assert.match(config,/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
 assert.doesNotMatch(config,/SERVICE_ROLE/);
});
