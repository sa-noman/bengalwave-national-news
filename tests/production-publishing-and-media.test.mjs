import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("production CMS can upload photos and preview cannot publish news",()=>{
  const media=read("src/lib/news-media.ts");
  const actions=read("src/app/admin/actions.ts");
  assert.match(media,/process\.env\.VERCEL_ENV==="production" \|\| isPreviewMediaEnabled\(\)/);
  assert.match(media,/if\(!isMediaUploadEnabled\(\)\)/);
  assert.match(actions,/if\(file&&!isMediaUploadEnabled\(\)\)/);
  assert.match(actions,/if\(isPreviewMediaEnabled\(\)\s*&&/);
  assert.match(actions,/existing\.status==="published" \|\| intent==="publish"/);
});

test("production media store is isolated while old preview attachments remain readable",()=>{
  const paths=read("src/lib/news-media-paths.ts");
  const migration=read("supabase/migrations/202610100002_production_news_media.sql");
  assert.match(paths,/bengalwave-preview-news-images/);
  assert.match(paths,/bengalwave-news-images/);
  assert.match(paths,/process\.env\.VERCEL_ENV==="production"/);
  assert.match(paths,/acceptedBuckets\.has\(bucket\)/);
  assert.match(migration,/storage\.objects for insert to authenticated/);
  assert.match(migration,/public\.has_cms_role/);
  assert.match(migration,/a\.status='published'/);
});

test("editor's private preview remains authenticated on production",()=>{
  const preview=read("src/app/admin/articles/[id]/preview/page.tsx");
  assert.match(preview,/await requireStaff\(\)/);
  assert.match(preview,/robots:\{index:false,follow:false\}/);
  assert.doesNotMatch(preview,/if\(!isDesignPreview\(\)\)notFound\(\)/);
});
