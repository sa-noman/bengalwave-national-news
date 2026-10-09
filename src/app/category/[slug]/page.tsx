export const dynamic="force-dynamic";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {NewsCard} from "@/components/news-card";
import {PreviewNotice} from "@/components/preview-notice";
import {categories,getCategory} from "@/lib/demo-news";
import {getDisplayNews} from "@/lib/news-display";
export function generateStaticParams(){return categories.map(c=>({slug:c.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;return {title:getCategory(slug)?.label||"বিভাগ"};
}
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const category=getCategory(slug);
  if(!category)notFound();
  const {items,showingSamples}=await getDisplayNews(100);
  const list=items.filter(item=>item.categorySlug===slug);
  return <main>{showingSamples&&<PreviewNotice/>}<div className="container listing-page">
    <div className="section-heading"><h1>{category.label}</h1></div>
    {list.length?<div className="listing-grid">{list.map(item=><NewsCard key={item.id} item={item}/>)}</div>:<p className="empty-news">এই বিভাগে এখনো সংবাদ প্রকাশিত হয়নি।</p>}
  </div></main>;
}
