import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const migration=source("supabase/migrations/202610100001_preview_news_media.sql");

test("image bucket and upload policies are restricted to preview and authenticated editorial staff",()=>{
  assert.match(migration,/bengalwave-preview-news-images/);
  assert.match(migration,/storage\.objects for insert to authenticated/);
  assert.match(migration,/public\.has_cms_role/);
  assert.match(migration,/auth\.uid\(\)/);
  assert.match(migration,/storage\.extension\(name\)/);
  assert.doesNotMatch(migration,/to anon[\s\S]{0,80}for insert/);
  assert.match(migration,/articles a[\s\S]*?a\.status = 'published'/);
});

test("server-side image upload verifies formats, size, dimensions and user session without service keys",()=>{
  const upload=source("src/lib/news-media.ts");
  const actions=source("src/app/admin/actions.ts");
  assert.match(upload,/isPreviewMediaEnabled\(\)/);
  assert.match(upload,/MAX_IMAGE_BYTES/);
  assert.match(upload,/file\.arrayBuffer\(\)/);
  assert.match(upload,/failOn:"error"/);
  assert.match(upload,/quality:90/);
  assert.match(upload,/quality:78/);
  assert.match(upload,/userId\+"\/"\+randomUUID\(\)/);
  assert.match(actions,/requireStaff\(\)/);
  assert.match(actions,/hero_media_id:/);
  assert.doesNotMatch(upload,/service.role|service_role|SUPABASE_SERVICE_ROLE/i);
});

test("article editor previews photo and published views use uploaded full and thumbnail copies",()=>{
  const form=source("src/components/admin/article-form.tsx");
  const picker=source("src/components/admin/article-image-field.tsx");
  const feed=source("src/lib/news-feed.ts");
  const page=source("src/app/news/[slug]/page.tsx");
  assert.match(form,/ArticleImageField/);
  assert.match(picker,/type="file"/);
  assert.match(picker,/URL\.createObjectURL/);
  assert.match(picker,/URL\.revokeObjectURL/);
  assert.match(picker,/name="remove_image"/);
  assert.match(feed,/loadAttachedMedia/);
  assert.match(feed,/publicNewsImageUrl\(supabase,media\.storage_path,"thumb"\)/);
  assert.match(feed,/publicNewsImageUrl\(supabase,media\.storage_path,"full"\)/);
  assert.match(page,/item\.fullImage\|\|item\.image/);
});
