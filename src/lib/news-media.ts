import "server-only";
import sharp from "sharp";
import {randomUUID} from "node:crypto";
import {createSupabaseServerClient} from "@/lib/supabase/server";

import {NEWS_MEDIA_BUCKET} from "@/lib/news-media-paths";
export const MAX_IMAGE_BYTES=4*1024*1024;

/** The storage bucket is intentionally preview-only until production is approved. */
/** Preview editing is isolated from shared production publishing. */
export function isPreviewMediaEnabled(){
  return process.env.VERCEL_ENV==="preview" ||
    process.env.NODE_ENV==="development";
}
/** Both official production and preview deployments allow editor uploads. */
export function isMediaUploadEnabled(){
  return process.env.VERCEL_ENV==="production" || isPreviewMediaEnabled();
}

type NewsMediaResult=
  |{ok:true;mediaId:string}
  |{ok:false;error:"missing_bucket"|"invalid_file"|"invalid_image"|"too_large"|"storage"|"metadata"|"not_ready"};

export async function uploadNewsImage(
  file:File,
  fields:{alt:string;caption:string;credit:string},
  userId:string,
  supabase:Awaited<ReturnType<typeof createSupabaseServerClient>>
):Promise<NewsMediaResult>{
  if(!isMediaUploadEnabled())return {ok:false,error:"not_ready"};
  if(file.size>MAX_IMAGE_BYTES)return {ok:false,error:"too_large"};
  if(file.size<100 || !["image/jpeg","image/png","image/webp","image/avif"].includes(file.type))
    return {ok:false,error:"invalid_file"};

  let full:Buffer;
  let thumb:Buffer;
  try{
    const bytes=Buffer.from(await file.arrayBuffer());
    const image=sharp(bytes,{failOn:"error",limitInputPixels:25000000});
    const info=await image.metadata();
    const expectedFormats:Record<string,string>={
      "image/jpeg":"jpeg","image/png":"png","image/webp":"webp","image/avif":"heif"
    };
    if((file.type==="image/avif"? !["heif","avif"].includes(info.format):info.format!==expectedFormats[file.type]) || (info.pages||1)!==1 ||
       Math.max(info.width||0,info.height||0)<640 || Math.min(info.width||0,info.height||0)<360 ||
       (info.width||0)*(info.height||0)>25000000)
      return {ok:false,error:"invalid_image"};
    // Two COMPLETE WebP files, stripping EXIF and never enlarging the source.
    full=await sharp(bytes,{failOn:"error",limitInputPixels:25000000})
      .rotate().resize({width:2000,height:2000,fit:"inside",withoutEnlargement:true})
      .webp({quality:90,effort:5,smartSubsample:true}).toBuffer();
    thumb=await sharp(bytes,{failOn:"error",limitInputPixels:25000000})
      .rotate().resize({width:760,withoutEnlargement:true})
      .webp({quality:78,effort:4,smartSubsample:true}).toBuffer();
    // Verify that both re-encoded files are readable and structurally intact.
    const [largeInfo,smallInfo]=await Promise.all([
      sharp(full,{failOn:"error"}).metadata(),
      sharp(thumb,{failOn:"error"}).metadata(),
    ]);
    if(largeInfo.format!=="webp" || smallInfo.format!=="webp" ||
       !largeInfo.width || !smallInfo.width || !largeInfo.height)
      return {ok:false,error:"invalid_image"};
  }catch{
    return {ok:false,error:"invalid_image"};
  }

  const base=userId+"/"+randomUUID();
  const fullPath=base+"/full.webp";
  const thumbPath=base+"/thumb.webp";
  const bucket=supabase.storage.from(NEWS_MEDIA_BUCKET);

  const fullUpload=await bucket.upload(fullPath,full,{
    contentType:"image/webp",cacheControl:"31536000",upsert:false,
  });
  if(fullUpload.error){
    // A missing bucket has a distinct UI message so setup isn't mistaken
    // for a corrupt photograph.
    const message=String(fullUpload.error.message||"");
    return {ok:false,error:/bucket.*not found|not found/i.test(message)?"missing_bucket":"storage"};
  }
  const thumbUpload=await bucket.upload(thumbPath,thumb,{
    contentType:"image/webp",cacheControl:"31536000",upsert:false,
  });
  if(thumbUpload.error){
    await bucket.remove([fullPath]).catch(()=>{});
    return {ok:false,error:"storage"};
  }

  const storagePath=NEWS_MEDIA_BUCKET+"/"+fullPath;
  const {data,error}=await supabase.from("media_assets")
    .insert({
      storage_path:storagePath,
      alt_text:fields.alt.slice(0,300),
      caption:fields.caption.slice(0,500)||null,
      credit:fields.credit.slice(0,200)||null,
      uploaded_by:userId,
    })
    .select("id").single();
  if(error||!data){
    await bucket.remove([fullPath,thumbPath]).catch(()=>{});
    return {ok:false,error:"metadata"};
  }
  return {ok:true,mediaId:data.id};
}
