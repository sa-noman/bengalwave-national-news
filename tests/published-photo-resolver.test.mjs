import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("published articles use a read-only, published-only photo resolver",()=>{
  const feed=read("src/lib/news-feed.ts");
  const migration=read("supabase/migrations/202610100003_public_published_media_resolver.sql");
  assert.match(feed,/supabase\.rpc\("get_published_news_media"/);
  assert.match(feed,/p_article_ids:articleIds/);
  assert.match(feed,/media\.get\(row\.id\)/);
  assert.match(migration,/a\.status = 'published'::public\.article_status/);
  assert.match(migration,/a\.published_at <= now\(\)/);
  assert.match(migration,/m\.id = a\.hero_media_id/);
  assert.match(migration,/security definer/);
  assert.match(migration,/set search_path = ''/);
  assert.match(migration,/grant execute on function .* to anon, authenticated/);
  assert.doesNotMatch(feed,/media\.get\(row\.hero_media_id\|\|""\)/);
});

test("public article and home card use the actual uploaded image rather than fallback illustration",()=>{
  const feed=read("src/lib/news-feed.ts");
  assert.match(feed,/const thumb=media\?publicNewsImageUrl\(supabase,media\.storage_path,"thumb"\)/);
  assert.match(feed,/const full=media\?publicNewsImageUrl\(supabase,media\.storage_path,"full"\)/);
  assert.match(feed,/image:thumb\|\|articlePhotos\[row\.slug\]/);
  assert.match(feed,/fullImage:full\|\|articleFullPhotos\[row\.slug\]/);
  assert.match(feed,/loadAttachedMedia\(supabase,\[row\]\)/);
  const paths=read("src/lib/news-media-paths.ts");
  assert.match(paths,/bengalwave-news-images/);
  assert.match(paths,/bengalwave-preview-news-images/);
});
