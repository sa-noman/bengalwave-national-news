import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsCard } from "@/components/news-card";
import { demoNews, categories, getCategory } from "@/lib/demo-news";
export function generateStaticParams(){ return categories.map(x=>({slug:x.slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
 const {slug}=await params;return {title:getCategory(slug)?.label ?? "বিভাগ"};
}
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;const category=getCategory(slug); if(!category)notFound();
 const items=demoNews.filter(item=>item.category===category.label);
 return <main className="container listing-page"><div className="section-heading"><h1>{category.label}</h1></div><p className="demo-note">এটি ডেভেলপমেন্ট ডেমো। প্রকাশিত সংবাদ পরে ডেটাবেজ থেকে আসবে।</p><div className="listing-grid">{items.length?items.map(item=><NewsCard item={item} key={item.id}/>):<p>এই বিভাগে এখনো কোনো নমুনা সংবাদ নেই।</p>}</div></main>;
}
