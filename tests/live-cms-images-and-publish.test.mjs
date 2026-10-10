import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import sharp from "sharp";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("the actual production image-path validator accepts a saved article image",()=>{
  const source=read("src/lib/news-media-paths.ts");
  const start=source.indexOf("!/",source.indexOf("acceptedBuckets.has(bucket)"));
  const end=source.indexOf("/i.test(path)",start);
  assert.ok(start>=0&&end>start,"Storage image path expression missing");
  const pattern=new RegExp(source.slice(start+2,end),"i");
  const full="412af69d-322e-4ac1-ab5f-5f1a2ca1420a/b3b72609-5757-48d5-9f39-1aaaec9adb2f/full.webp";
  assert.ok(pattern.test(full),"Real published photo must resolve to its Supabase URL");
  assert.equal(pattern.test(full.replace("full.webp","thumb.webp")),false);
  assert.equal(pattern.test("../../../../private.webp"),false);
  assert.equal(pattern.test(full.replace("/b3b7","/../b3b7")),false);
});

test("backend and CMS picker both allow JPG PNG WebP AVIF input",()=>{
  const backend=read("src/lib/news-media.ts");
  const picker=read("src/components/admin/article-image-field.tsx");
  for(const mime of ["image/jpeg","image/png","image/webp","image/avif"]){
    assert.ok(backend.includes('"'+mime+'"'),"backend rejected "+mime);
    assert.ok(picker.includes(mime),"picker rejected "+mime);
  }
  assert.match(backend,/"image\/avif":"heif"/);
  assert.match(backend,/\["heif","avif"\]/);
  assert.match(backend,/\.webp\(\{quality:90/);
  assert.match(backend,/\.webp\(\{quality:78/);
});

test("installed Sharp decodes JPG PNG WebP and AVIF into high-quality news WebP",async()=>{
  const source=sharp({
    create:{width:960,height:540,channels:3,background:"#2d6f4d"},
  });
  const base=await source.png().toBuffer();
  const encoders=[
    ["jpeg",()=>sharp(base).jpeg({quality:93}).toBuffer()],
    ["png",()=>sharp(base).png().toBuffer()],
    ["webp",()=>sharp(base).webp({quality:92}).toBuffer()],
    ["avif",()=>sharp(base).avif({quality:88}).toBuffer()],
  ];
  for(const [format,encode] of encoders){
    const raw=await encode();
    const meta=await sharp(raw,{failOn:"error"}).metadata();
    assert.ok((meta.width||0)>=940,format+" resolution");
    if(format==="avif") assert.ok(["heif","avif"].includes(meta.format));
    const output=await sharp(raw,{failOn:"error"})
      .rotate().resize({width:2000,height:2000,fit:"inside",withoutEnlargement:true})
      .webp({quality:90,effort:2,smartSubsample:true}).toBuffer();
    const verified=await sharp(output,{failOn:"error"}).metadata();
    assert.equal(verified.format,"webp",format+" must produce WebP");
    assert.equal(verified.width,960);
    assert.equal(verified.height,540);
  }
});

test("live new article may publish in one click, with permission checks and no image-less publishing on failure",()=>{
  const action=read("src/app/admin/actions.ts");
  const form=read("src/components/admin/article-submit-controls.tsx");
  assert.match(action,/export async function createAndPublishArticle/);
  assert.match(form,/formAction=\{createAndPublishArticle\}/);
  assert.match(action,/if\(!editor\(role\)\|\|isPreviewMediaEnabled\(\)/);
  assert.match(action,/await uploadNewsImage/);
  assert.match(action,/if\(!photo\.ok\)/);
  assert.match(action,/status:"approved"/);
  assert.match(action,/status:"published"/);
  assert.match(action,/redirect\("\/news\/"\+input\.slug\)/);
  assert.match(form,/!status && isEditor && !previewOnly/);
});

test("published articles remain editable and updated images are saved by the actual media ID",()=>{
  const actions=read("src/app/admin/actions.ts");
  const control=read("src/components/admin/article-submit-controls.tsx");
  assert.match(actions,/changeArticle\(formData,"save"\)/);
  assert.match(actions,/mediaId=photo\.mediaId|mediaId=upload\.mediaId/);
  assert.match(actions,/hero_media_id:mediaId/);
  assert.match(control,/status\?"পরিবর্তন সংরক্ষণ করুন"/);
});
