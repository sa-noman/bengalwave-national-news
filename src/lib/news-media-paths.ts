import type {SupabaseClient} from "@supabase/supabase-js";

export const NEWS_MEDIA_BUCKET="bengalwave-preview-news-images";

/** Public URL is only derived from a validated, CMS-owned object path. */
export function publicNewsImageUrl(
  supabase:Pick<SupabaseClient,"storage">,
  storagePath:string,
  size:"full"|"thumb"="full",
):string|null{
  const prefix=NEWS_MEDIA_BUCKET+"/";
  if(!storagePath.startsWith(prefix)||
     !/^[a-f0-9-]{36}\/[a-f0-9-]{36}\/full\.webp$/i.test(storagePath.slice(prefix.length)))
    return null;
  const objectPath=storagePath.slice(prefix.length)
    .replace(/\/full\.webp$/,size==="thumb"?"/thumb.webp":"/full.webp");
  return supabase.storage.from(NEWS_MEDIA_BUCKET).getPublicUrl(objectPath).data.publicUrl;
}
