import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import sharp from "sharp";

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


test("small and portrait news photos are accepted and resized only for delivery",async()=>{
  const upload=source("src/lib/news-media.ts");
  const picker=source("src/components/admin/article-image-field.tsx");
  const edit=source("src/app/admin/articles/[id]/edit/page.tsx");
  const css=source("src/app/newsroom.css");

  // Keep format validation, decoding, one-frame and pixel-count safeguards.
  // Only the arbitrary minimum source width/height is removed.
  assert.match(upload,/!info\.width \|\| !info\.height/);
  assert.match(upload,/info\.width\*info\.height>25000000/);
  assert.match(upload,/\(info\.pages\|\|1\)!==1/);
  assert.match(upload,/file\.size===0/);
  assert.doesNotMatch(upload,/Math\.max\(info\.width\|\|0,info\.height\|\|0\)<640/);
  assert.doesNotMatch(picker,/ন্যূনতম 640/);
  assert.doesNotMatch(edit,/রেজোলিউশন কম|অন্তত 640/);
  assert.match(css,/\.bw-img-frame\{[^}]*aspect-ratio:3\/2/s);
  assert.match(css,/\.bw-article \.bw-article-image-frame\{[^}]*aspect-ratio:3\/2/s);

  // Real Sharp encoding of source photos far below the former 640x360
  // threshold, including portrait and an extremely small valid PNG.
  for(const [width,height] of [[320,180],[180,320],[1,1]]){
    const bytes=await sharp({
      create:{width,height,channels:3,background:"#276747"},
    }).png().toBuffer();
    const info=await sharp(bytes,{failOn:"error",limitInputPixels:25000000}).metadata();
    assert.equal(info.width,width);
    assert.equal(info.height,height);
    const full=await sharp(bytes,{failOn:"error",limitInputPixels:25000000})
      .rotate().resize({width:2000,height:2000,fit:"inside",withoutEnlargement:true})
      .webp({quality:90,effort:2,smartSubsample:true}).toBuffer();
    const thumb=await sharp(bytes,{failOn:"error",limitInputPixels:25000000})
      .rotate().resize({width:760,withoutEnlargement:true})
      .webp({quality:78,effort:2,smartSubsample:true}).toBuffer();
    const [large,small]=await Promise.all([sharp(full).metadata(),sharp(thumb).metadata()]);
    assert.equal(large.format,"webp");
    assert.equal(small.format,"webp");
    assert.equal(large.width,width);
    assert.equal(large.height,height);
    assert.equal(small.width,width);
    assert.equal(small.height,height);
  }
});
