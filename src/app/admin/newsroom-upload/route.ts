import {NextRequest,NextResponse} from "next/server";
import {requireStaff} from "@/lib/auth/require-staff";
import {uploadNewsImage,MAX_IMAGE_BYTES} from "@/lib/news-media";
import {publicNewsImageUrl} from "@/lib/news-media-paths";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function response(body:Record<string,unknown>,status:number){
 return NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}

/**
 * A single authenticated newsroom photo per request stays below Vercel's
 * 4.5 MB Function payload limit. Multi-photo stories must not submit several
 * raw File objects in one Server Action request.
 */
export async function POST(request:NextRequest){
 // The preview environment shares Production Supabase and must not upload media.
 if(process.env.VERCEL_ENV!=="production")
  return response({ok:false,error:"preview-protected"},403);

 const origin=request.headers.get("origin");
 if(!origin||origin!==new URL(request.url).origin||
    request.headers.get("x-bw-editor-upload")!=="1")
  return response({ok:false,error:"origin"},403);

 // Leave room for multipart fields and the fixed 4 MB file cap.
 const length=Number(request.headers.get("content-length")||"0");
 if(length>4_450_000)return response({ok:false,error:"too_large"},413);

 const {supabase,user}=await requireStaff();
 let fields:FormData;
 try{fields=await request.formData();}
 catch{return response({ok:false,error:"invalid_form"},400);}

 const file=fields.get("image");
 if(!(file instanceof File)||file.size===0)
  return response({ok:false,error:"missing_image"},400);
 if(file.size>MAX_IMAGE_BYTES)return response({ok:false,error:"too_large"},413);

 const alt=String(fields.get("alt")||"সংবাদের ছবি").trim().slice(0,300);
 const caption=String(fields.get("caption")||"").trim().slice(0,500);
 const credit=String(fields.get("credit")||"").trim().slice(0,200);
 const result=await uploadNewsImage(file,{alt,caption,credit},user.id,supabase);
 if(!result.ok)return response({ok:false,error:result.error},422);

 const {data,error}=await supabase.from("media_assets").select("storage_path")
  .eq("id",result.mediaId).maybeSingle();
 const url=!error&&data?publicNewsImageUrl(supabase,data.storage_path,"full"):null;
 if(!url)return response({ok:false,error:"metadata"},500);
 return response({ok:true,url},201);
}
