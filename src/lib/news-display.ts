import "server-only";
import { getPublishedNews, getPublishedArticle } from "@/lib/news-feed";
import { previewNews, previewArticleBody } from "@/lib/preview-news";

// Local and Vercel Preview only. Never display fixtures on Vercel production.
export function isDesignPreview() {
  return process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development";
}
export async function getDisplayNews(limit=60) {
  const published=await getPublishedNews(limit);
  if(published.length) return {items:published,showingSamples:false};
  if(isDesignPreview()) return {items:previewNews.slice(0,limit),showingSamples:true};
  return {items:[],showingSamples:false};
}
export async function getDisplayArticle(slug:string) {
  const published=await getPublishedArticle(slug);
  if(published) return {...published,isDemo:false};
  if(!isDesignPreview()) return null;
  const example=previewNews.find(item=>item.slug===slug);
  if(!example) return null;
  return {...example,body:previewArticleBody,sourceName:null,sourceUrl:null};
}
