// News must be server-rendered after editorial publication; never bake drafts or empty feeds into a static build.
export const dynamic = "force-dynamic";
import type {Metadata} from "next";
import {NewsCard} from "@/components/news-card";
import {getPublishedNews} from "@/lib/news-feed";
export const metadata:Metadata={title:"সর্বশেষ সংবাদ"};
export default async function Latest(){
 const list=await getPublishedNews(100);
 return <main className="container listing-page">
 <div className="section-heading"><h1>সর্বশেষ সংবাদ</h1></div>
 {list.length?<div className="listing-grid">{list.map(item=><NewsCard key={item.id} item={item}/>)}</div>:<p className="empty-news">এখনো কোনো সংবাদ প্রকাশিত হয়নি।</p>}
 </main>;
}
