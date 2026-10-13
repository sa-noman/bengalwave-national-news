import type { MetadataRoute } from "next";
import { getPublishedNews } from "@/lib/news-feed";
import { categories } from "@/lib/demo-news";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // No sample stories should ever be included in production sitemaps.
  if (process.env.VERCEL_ENV !== "production") return [];
  const base="https://bengalwave.news";
  const pages: MetadataRoute.Sitemap = [
    { url:base, changeFrequency:"hourly",priority:1 },
    { url:base+"/latest", changeFrequency:"hourly",priority:0.9 },
    ...categories.map(category=>({url:base+"/category/"+category.slug,changeFrequency:"daily" as const,priority:0.7})),
  ];
  const stories=await getPublishedNews(1000);
  return [...pages,...stories.map(story=>({
    url:base+"/news/"+encodeURIComponent(story.slug),
    lastModified:story.publishedAt?new Date(story.publishedAt):undefined,
    changeFrequency:"daily" as const,
    priority:0.8,
  }))];
}
