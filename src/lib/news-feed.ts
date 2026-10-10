import "server-only";
import {createSupabasePublicClient} from "@/lib/supabase/public";
import type {NewsItem} from "@/lib/demo-news";
import {publicNewsImageUrl} from "@/lib/news-media-paths";

type CategoryRef={slug:string;label_bn:string};
type DatabaseArticle={
 id:string;slug:string;headline:string;summary:string;body:string;
 is_featured:boolean;published_at:string|null;
 categories:CategoryRef|CategoryRef[]|null;
 source_name:string|null;source_url:string|null;hero_media_id:string|null;
};

const articlePhotos:Record<string,string>={
 "shaheed-jehad-day-student-unity-oct-2026":"/news/shaheed-jehad-2026.png",
 "mithun-cabinet-rank-cultural-adviser-oct-2026":"/news/mithun-cultural-adviser-2026-fixed.webp",
 "nana-patekar-dies-at-75-oct-2026":"/news/nana-patekar-2026.png",
 "us-israel-iran-attack-plan-election-report-oct-2026":"/news/israel-iran-attack-report-2026-fixed.webp",
 "nationwide-postal-service-week-oct-2026":"/news/postal-service-week-2026-fixed.webp",
 "litton-miraz-resistance-afghanistan-test-oct-2026":"/news/litton-miraz-test-2026.png",
 "delhi-cockroach-protest-internet-shutdown-oct-2026":"/news/delhi-protest-security-2026-fixed.webp",
 "pm-mental-health-stigma-awareness-oct-2026":"/news/pm-mental-health-2026.png",
 "bobby-hajjaj-drug-control-social-change-oct-2026":"/news/bobby-hajjaj-drug-control-2026.png",
 "charmonai-pir-local-election-shariah-oct-2026":"/news/charmonai-council-2026.webp",
 "us-sanctions-icc-after-navi-pillay-nobel-2026":"/news/icc-us-sanctions-2026.webp"
};


// Full-resolution article images. The existing image map above serves thumbnails.
const articleFullPhotos:Record<string,string>={
 "mithun-cabinet-rank-cultural-adviser-oct-2026":"/news/mithun-cultural-adviser-2026-article.webp",
 "us-israel-iran-attack-plan-election-report-oct-2026":"/news/israel-iran-attack-report-2026-article.webp",
 "nationwide-postal-service-week-oct-2026":"/news/postal-service-week-2026-article.webp",
 "delhi-cockroach-protest-internet-shutdown-oct-2026":"/news/delhi-protest-security-2026-article.webp",
};
// Display a photo at no more than its actual source resolution.
// A 640px source cannot become sharper by stretching it to 940px.
const fullPhotoNativeWidths:Record<string,number>={
 "shaheed-jehad-day-student-unity-oct-2026":750,
 "mithun-cabinet-rank-cultural-adviser-oct-2026":1200,
 "nana-patekar-dies-at-75-oct-2026":1200,
 "us-israel-iran-attack-plan-election-report-oct-2026":1200,
 "nationwide-postal-service-week-oct-2026":1200,
 "litton-miraz-resistance-afghanistan-test-oct-2026":857,
 "delhi-cockroach-protest-internet-shutdown-oct-2026":1200,
 "pm-mental-health-stigma-awareness-oct-2026":995,
 "bobby-hajjaj-drug-control-social-change-oct-2026":995,
 "charmonai-pir-local-election-shariah-oct-2026":1200,
 "us-sanctions-icc-after-navi-pillay-nobel-2026":640
};

const fallbackImages:Record<string,string>={
 national:"/illustrations/river.svg",international:"/illustrations/world.svg",
 politics:"/illustrations/city.svg",economy:"/illustrations/economy.svg",
 technology:"/illustrations/city.svg",culture:"/illustrations/heritage.svg",
 features:"/illustrations/heritage.svg",sports:"/illustrations/world.svg",
 entertainment:"/illustrations/heritage.svg"
};
function normalizeCategory(value:DatabaseArticle["categories"]):CategoryRef|null {
  return Array.isArray(value) ? value[0]||null : value;
}
type PublicClient=NonNullable<ReturnType<typeof createSupabasePublicClient>>;
type AttachedMedia={
  id:string;storage_path:string;alt_text:string;caption:string|null;credit:string|null;
};

async function loadAttachedMedia(supabase:PublicClient,rows:DatabaseArticle[]){
  const ids=Array.from(new Set(rows.map(r=>r.hero_media_id)
    .filter((id):id is string=>Boolean(id))));
  if(!ids.length)return new Map<string,AttachedMedia>();
  const {data,error}=await supabase.from("media_assets")
    .select("id,storage_path,alt_text,caption,credit").in("id",ids);
  if(error){
    console.error("Bengal Wave: published image metadata unavailable",error.code);
    return new Map<string,AttachedMedia>();
  }
  return new Map((data||[]).map(a=>[a.id,a as AttachedMedia]));
}

function asNewsItem(row:DatabaseArticle,media:AttachedMedia|undefined,supabase:PublicClient):NewsItem {
  const category=normalizeCategory(row.categories);
  // Prefer a securely uploaded and attached CMS image. Legacy static image
  // mappings remain intact until an editor uploads a replacement.
  const thumb=media?publicNewsImageUrl(supabase,media.storage_path,"thumb"):null;
  const full=media?publicNewsImageUrl(supabase,media.storage_path,"full"):null;
  return {
    id:row.id,slug:row.slug,title:row.headline,summary:row.summary,
    category:category?.label_bn||"সংবাদ",
    categorySlug:category?.slug||"",
    featured:row.is_featured,
    publishedAt:row.published_at||undefined,
    image:thumb||articlePhotos[row.slug]||fallbackImages[category?.slug||""]||"/illustrations/river.svg",
    fullImage:full||articleFullPhotos[row.slug],
    fullImageWidth:full?940:fullPhotoNativeWidths[row.slug],
    imageAlt:media?.alt_text||undefined,
    imageCaption:media?.caption||undefined,
    imageCredit:media?.credit||undefined,
  };
}
export async function getPublishedNews(limit=60):Promise<NewsItem[]> {
  const supabase=createSupabasePublicClient();
  if(!supabase) return [];
  const {data,error}=await supabase.from("articles")
    .select("id,slug,headline,summary,is_featured,published_at,hero_media_id,categories(slug,label_bn)")
    .eq("status","published").lte("published_at",new Date().toISOString())
    .order("published_at",{ascending:false}).limit(limit);
  if(error){console.error("Bengal Wave: public news fetch failed",error.code);return [];}
  const rows=(data||[]) as unknown as DatabaseArticle[];
  const media=await loadAttachedMedia(supabase,rows);
  return rows.map(row=>asNewsItem(row,media.get(row.hero_media_id||""),supabase));
}
export async function getPublishedArticle(slug:string) {
  const supabase=createSupabasePublicClient();
  if(!supabase) return null;
  const {data,error}=await supabase.from("articles")
    .select("id,slug,headline,summary,body,source_name,source_url,is_featured,published_at,hero_media_id,categories(slug,label_bn)")
    .eq("slug",slug).eq("status","published")
    .lte("published_at",new Date().toISOString()).maybeSingle();
  if(error || !data)return null;
  const row=data as unknown as DatabaseArticle;
  const media=await loadAttachedMedia(supabase,[row]);
  return {...asNewsItem(row,media.get(row.hero_media_id||""),supabase),body:row.body,sourceName:row.source_name,sourceUrl:row.source_url};
}
