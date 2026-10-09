export const dynamic="force-dynamic";
import type {Metadata} from "next";
import {NewsCard} from "@/components/news-card";
import {PreviewNotice} from "@/components/preview-notice";
import {getDisplayNews} from "@/lib/news-display";
export const metadata:Metadata={title:"সংবাদ খুঁজুন"};
export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
  const {q=""}=await searchParams;const query=q.trim().toLocaleLowerCase("bn");
  const {items,showingSamples}=await getDisplayNews(100);
  const news=query?items.filter(item=>[item.title,item.summary,item.category].join(" ").toLocaleLowerCase("bn").includes(query)):[];
  return <main>{showingSamples&&<PreviewNotice/>}<div className="container listing-page">
    <div className="section-heading"><h1>সংবাদ খুঁজুন</h1></div>
    <form action="/search" className="search-form" role="search">
      <label htmlFor="q">অনুসন্ধান</label><input id="q" name="q" defaultValue={q} placeholder="বাংলায় লিখুন..." maxLength={120}/>
      <button type="submit">খুঁজুন</button>
    </form>
    {query&&<p className="demo-note">“{q}” এর ফলাফল: {news.length}টি {showingSamples?"নমুনা সংবাদ":"সংবাদ"}</p>}
    {news.length>0&&<div className="listing-grid">{news.map(item=><NewsCard item={item} key={item.id}/>)}</div>}
  </div></main>;
}
