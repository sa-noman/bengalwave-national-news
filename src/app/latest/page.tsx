export const dynamic="force-dynamic";
import type {Metadata} from "next";
import {NewsCard} from "@/components/news-card";
import {PreviewNotice} from "@/components/preview-notice";
import {getDisplayNews,isDesignPreview} from "@/lib/news-display";
export const metadata:Metadata={title:"সর্বশেষ সংবাদ"};
export default async function Latest(){
 const {items,showingSamples}=await getDisplayNews(100);
 return <main className="bw-website">{(isDesignPreview()||showingSamples)&&<PreviewNotice samples={showingSamples}/>}
  <section className="bw-wrap bw-listing">
   <div className="bw-section-heading"><h1>সর্বশেষ সংবাদ</h1></div>
   {items.length?<div className="bw-listing-grid">{items.map(item=><NewsCard key={item.id} item={item}/>)}</div>:<p className="bw-empty">এখনো কোনো সংবাদ প্রকাশিত হয়নি।</p>}
  </section>
 </main>;
}
