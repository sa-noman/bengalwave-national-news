export const dynamic="force-dynamic";
import type {Metadata} from "next";
import {NewsCard} from "@/components/news-card";
import {PreviewNotice} from "@/components/preview-notice";
import {getDisplayNews} from "@/lib/news-display";
export const metadata:Metadata={title:"সর্বশেষ সংবাদ"};
export default async function Latest(){
  const {items,showingSamples}=await getDisplayNews(100);
  return <main>{showingSamples&&<PreviewNotice/>}<div className="container listing-page">
    <div className="section-heading"><h1>সর্বশেষ সংবাদ</h1></div>
    {items.length?<div className="listing-grid">{items.map(item=><NewsCard key={item.id} item={item}/>)}</div>:<p className="empty-news">এখনো কোনো সংবাদ প্রকাশিত হয়নি।</p>}
  </div></main>;
}
