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
 "us-sanctions-icc-after-navi-pillay-nobel-2026":"/news/icc-us-sanctions-2026.webp",
 "cumilla-jamaat-factional-clash-office-car-vandalism-oct-2026":"/news/cumilla-jamaat-2026.webp",
 "houthi-missile-strike-saudi-aramco-hq-dhahran-oct-2026":"https://upload.wikimedia.org/wikipedia/commons/7/7e/AramcoCoreArea.jpg"
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
 "us-sanctions-icc-after-navi-pillay-nobel-2026":640,
 "cumilla-jamaat-factional-clash-office-car-vandalism-oct-2026":300
};

// Public-domain archive photograph. NOT a photograph of the 2026 strike.
const aramcoArchivePhotoSlug="houthi-missile-strike-saudi-aramco-hq-dhahran-oct-2026";

const fallbackImages:Record<string,string>={
 national:"/illustrations/river.svg",international:"/illustrations/world.svg",
 politics:"/illustrations/city.svg",economy:"/illustrations/economy.svg",
 technology:"/illustrations/city.svg",culture:"/illustrations/heritage.svg",
 features:"/illustrations/heritage.svg",sports:"/illustrations/world.svg",
 entertainment:"/illustrations/heritage.svg"
};
/** Always re-validate database-provided href values before public rendering. */
function safePublishedSourceUrl(value:string|null):string|null {
  if(!value)return null;
  try {
    const url=new URL(value);
    return url.protocol==="https:"||url.protocol==="http:" ? url.href : null;
  } catch {
    return null;
  }
}
function normalizeCategory(value:DatabaseArticle["categories"]):CategoryRef|null {
  return Array.isArray(value) ? value[0]||null : value;
}
type PublicClient=NonNullable<ReturnType<typeof createSupabasePublicClient>>;
type AttachedMedia={
  storage_path:string;alt_text:string;caption:string|null;credit:string|null;
};
type PublishedMediaRow=AttachedMedia & {article_id:string};

/**
 * Resolve CMS images using a published-only, read-only database function.
 * The anon client can retrieve this metadata even when joining multiple
 * media_assets RLS policies would otherwise omit it.
 * Keys are article IDs, NEVER media IDs, to prevent a mismatched thumbnail.
 */
async function loadAttachedMedia(supabase:PublicClient,rows:DatabaseArticle[]){
  const withHero=rows.filter(row=>Boolean(row.hero_media_id));
  if(!withHero.length)return new Map<string,AttachedMedia>();

  const articleIds=withHero.map(row=>row.id);
  const {data,error}=await supabase.rpc("get_published_news_media",{
    p_article_ids:articleIds,
  });
  if(!error){
    return new Map<string,AttachedMedia>(((data||[]) as PublishedMediaRow[]).map(m=>[m.article_id,{
      storage_path:m.storage_path,
      alt_text:m.alt_text,
      caption:m.caption,
      credit:m.credit,
    }]));
  }

  // This compatibility path avoids blank images if a staging database
  // has not yet received the published-only function migration.
  console.warn("Bengal Wave: image resolver unavailable",error.code);
  const mediaIds=withHero.map(row=>row.hero_media_id as string);
  const {data:legacy,error:legacyError}=await supabase.from("media_assets")
    .select("id,storage_path,alt_text,caption,credit").in("id",mediaIds);
  if(legacyError){
    console.error("Bengal Wave: published image metadata unavailable",legacyError.code);
    return new Map<string,AttachedMedia>();
  }
  const byMediaId=new Map<string,AttachedMedia>((legacy||[]).map(m=>[m.id,m]));
  return new Map<string,AttachedMedia>(withHero.flatMap(row=>{
    const media=byMediaId.get(row.hero_media_id as string);
    return media?[[row.id,media as AttachedMedia] as const]:[];
  }));
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
    imageAlt:media?.alt_text||(row.slug===aramcoArchivePhotoSlug?"ধাহরানে সৌদি আরামকোর সদর দপ্তর কমপ্লেক্সের পুরোনো ছবি":row.slug==="cumilla-jamaat-factional-clash-office-car-vandalism-oct-2026"?"কুমিল্লা মহানগর জামায়াতের কার্যালয়ের সামনে জড়ো হওয়া লোকজন":undefined),
    imageCaption:media?.caption||(row.slug===aramcoArchivePhotoSlug?"ধাহরানে সৌদি আরামকোর সদর দপ্তর কমপ্লেক্স। ফাইল ছবি, হামলার দৃশ্য নয়।":row.slug==="cumilla-jamaat-factional-clash-office-car-vandalism-oct-2026"?"কুমিল্লা মহানগর জামায়াতের কার্যালয়ের সামনে জড়ো হওয়া লোকজন":undefined),
    imageCredit:media?.credit||(row.slug===aramcoArchivePhotoSlug?"Eagleamn / Wikimedia Commons (পাবলিক ডোমেইন)":row.slug==="cumilla-jamaat-factional-clash-office-car-vandalism-oct-2026"?"সংগৃহীত":undefined),
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
  return rows.map(row=>asNewsItem(row,media.get(row.id),supabase));
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
  return {...asNewsItem(row,media.get(row.id),supabase),body:row.body,sourceName:row.source_name,sourceUrl:safePublishedSourceUrl(row.source_url)};
}
