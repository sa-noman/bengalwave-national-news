import "server-only";
import {createSupabasePublicClient} from "@/lib/supabase/public";
import type {NewsItem} from "@/lib/demo-news";

type CategoryRef={slug:string;label_bn:string};
type DatabaseArticle={
 id:string;slug:string;headline:string;summary:string;body:string;
 is_featured:boolean;published_at:string|null;
 categories:CategoryRef|CategoryRef[]|null;
 source_name:string|null;source_url:string|null;
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
function asNewsItem(row:DatabaseArticle):NewsItem {
  const category=normalizeCategory(row.categories);
  return {
    id:row.id,slug:row.slug,title:row.headline,summary:row.summary,
    category:category?.label_bn||"সংবাদ",
    categorySlug:category?.slug||"",
    featured:row.is_featured,
    publishedAt:row.published_at||undefined,
    image:fallbackImages[category?.slug||""]||"/illustrations/river.svg",
  };
}
export async function getPublishedNews(limit=60):Promise<NewsItem[]> {
  const supabase=createSupabasePublicClient();
  if(!supabase) return [];
  const {data,error}=await supabase.from("articles")
    .select("id,slug,headline,summary,is_featured,published_at,categories(slug,label_bn)")
    .eq("status","published").lte("published_at",new Date().toISOString())
    .order("published_at",{ascending:false}).limit(limit);
  if(error){console.error("Bengal Wave: public news fetch failed",error.code);return [];}
  return (data||[]).map(r=>asNewsItem(r as unknown as DatabaseArticle));
}
export async function getPublishedArticle(slug:string) {
  const supabase=createSupabasePublicClient();
  if(!supabase) return null;
  const {data,error}=await supabase.from("articles")
    .select("id,slug,headline,summary,body,source_name,source_url,is_featured,published_at,categories(slug,label_bn)")
    .eq("slug",slug).eq("status","published")
    .lte("published_at",new Date().toISOString()).maybeSingle();
  if(error || !data)return null;
  const row=data as unknown as DatabaseArticle;
  return {...asNewsItem(row),body:row.body,sourceName:row.source_name,sourceUrl:row.source_url};
}
