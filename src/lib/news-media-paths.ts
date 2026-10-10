import type {SupabaseClient} from "@supabase/supabase-js";

export const PREVIEW_NEWS_MEDIA_BUCKET="bengalwave-preview-news-images";
export const PRODUCTION_NEWS_MEDIA_BUCKET="bengalwave-news-images";

export const NEWS_MEDIA_BUCKET=process.env.VERCEL_ENV==="production"
  ?PRODUCTION_NEWS_MEDIA_BUCKET:PREVIEW_NEWS_MEDIA_BUCKET;

const acceptedBuckets=new Set([PREVIEW_NEWS_MEDIA_BUCKET,PRODUCTION_NEWS_MEDIA_BUCKET]);

/** Public URL is derived only from valid editor-owned Supabase storage paths. */
export function publicNewsImageUrl(
  supabase:Pick<SupabaseClient,"storage">,
  storagePath:string,
  size:"full"|"thumb"="full",
):string|null{
  const slash=storagePath.indexOf("/");
  if(slash<0)return null;
  const bucket=storagePath.slice(0,slash);
  const path=storagePath.slice(slash+1);
  if(!acceptedBuckets.has(bucket) ||
     !/^[a-f0-9-]{36}\/^[a-f0-9-]{36}\/full\.webp$/i.test(path))
     return null;
  const objectPath=path.replace(/\/full\.webp$/,size==="thumb"?"/thumb.webp":"/full.webp");
  return supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
}
