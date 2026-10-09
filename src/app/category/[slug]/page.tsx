// News must be server-rendered after editorial publication; never bake drafts or empty feeds into a static build.
export const dynamic = "force-dynamic";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {NewsCard} from "@/components/news-card";
import {categories,getCategory} from "@/lib/demo-news";
import {getPublishedNews} from "@/lib/news-feed";
export function generateStaticParams(){return categories.map(c=>({slug:c.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;return {title:getCategory(slug)?.label||"বিভাগ"};
}
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params, category=getCategory(slug);
 if(!category)notFound();
 const list=(await getPublishedNews(100)).filter(item=>item.categorySlug===slug);
 return <main className="container listing-page">
   <div className="section-heading"><h1>{category.label}</h1></div>
   {list.length?<div className="listing-grid">{list.map(item=><NewsCard key={item.id} item={item}/>)}</div>:<p className="empty-news">এই বিভাগে এখনো সংবাদ প্রকাশিত হয়নি।</p>}
 </main>;
}
