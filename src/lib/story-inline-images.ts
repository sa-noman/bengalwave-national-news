import "server-only";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {publicNewsImageUrl} from "@/lib/news-media-paths";
import {uploadNewsImage} from "@/lib/news-media";
import {parseRichBody,safeStoryImageUrl,serializeRichBody} from "@/lib/rich-article";
import type {StoryBlock} from "@/lib/rich-article";

type Supabase=Awaited<ReturnType<typeof createSupabaseServerClient>>;
export type InlineImagesResult={ok:true;body:string}|{ok:false;error:string};

/** Upload only images referenced by the authenticated editor's article form.
 * A failed upload stops the article save rather than publishing broken media.
 * Existing published images and article records are never deleted or altered here.
 */
export async function resolveStoryInlineImages(
 body:string,form:FormData,userId:string,supabase:Supabase
):Promise<InlineImagesResult>{
 const blocks=parseRichBody(body);
 if(!blocks)return {ok:true,body};
 let newImages=0;
 const updated:StoryBlock[]=[];
 for(const b of blocks){
  const entry:StoryBlock={...b};
  if(b.type==="slideshow"){
   if(!b.slides||b.slides.length<2||b.slides.length>12)return {ok:false,error:"invalid_slides"};
   const newSlides=[];
   for(let i=0;i<b.slides.length;i++){
    const slide={...b.slides[i]};
    const input="inline_image_"+b.id+"_slide_"+i;
    const file=form.get(input);
    if(file instanceof File&&file.size>0){
     if(++newImages>6)return {ok:false,error:"limit"};
     const uploaded=await uploadNewsImage(file,{alt:slide.alt||"সংবাদের স্লাইড",caption:slide.caption,credit:slide.credit},userId,supabase);
     if(!uploaded.ok)return {ok:false,error:uploaded.error};
     const {data,error}=await supabase.from("media_assets").select("storage_path")
       .eq("id",uploaded.mediaId).maybeSingle();
     const url=!error&&data?publicNewsImageUrl(supabase,data.storage_path,"full"):null;
     if(!url)return {ok:false,error:"metadata"};
     slide.src=url;
    }else if(!safeStoryImageUrl(slide.src))return {ok:false,error:"missing"};
    newSlides.push(slide);
   }
   entry.slides=newSlides;
  }
  const slots:(("src"|"src2"))[]=b.type==="gallery"?["src","src2"]:
    (b.type==="image"||b.type==="split")?["src"]:[];
  for(const field of slots){
   const input="inline_image_"+b.id+(field==="src2"?"_second":"");
   const file=form.get(input);
   if(file instanceof File&&file.size>0){
    newImages++;
    if(newImages>6)return {ok:false,error:"limit"};
    const alt=field==="src2"?b.alt2:b.alt;
    const caption=field==="src2"?b.caption2:b.caption;
    const uploaded=await uploadNewsImage(file,{alt:alt||"প্রতিবেদনের ছবি",caption,credit:b.credit},userId,supabase);
    if(!uploaded.ok)return {ok:false,error:uploaded.error};
    const {data,error}=await supabase.from("media_assets").select("storage_path")
      .eq("id",uploaded.mediaId).maybeSingle();
    const url=!error&&data?publicNewsImageUrl(supabase,data.storage_path,"full"):null;
    if(!url)return {ok:false,error:"metadata"};
    entry[field]=url;
   }else if(!safeStoryImageUrl(entry[field])){
    return {ok:false,error:"missing"};
   }
  }
  updated.push(entry);
 }
 const result=serializeRichBody(updated);
 if(result.length>80000)return {ok:false,error:"too_long"};
 return {ok:true,body:result};
}
