export const dynamic="force-dynamic";
import type {Metadata} from "next";
import {NewsCard} from "@/components/news-card";
import {PreviewNotice} from "@/components/preview-notice";
import {getDisplayNews,isDesignPreview} from "@/lib/news-display";
export const metadata:Metadata={title:"সংবাদ খুঁজুন"};
export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
 const {q=""}=await searchParams;
 const search=q.trim().toLocaleLowerCase("bn").slice(0,120);
 const {items,showingSamples}=await getDisplayNews(100);
 const found=search?items.filter(item=>[item.title,item.summary,item.category].join(" ").toLocaleLowerCase("bn").includes(search)):[];
 return <main className="bw-website">{(isDesignPreview()||showingSamples)&&<PreviewNotice samples={showingSamples}/>}
  <section className="bw-wrap bw-listing">
   <div className="bw-section-heading"><h1>সংবাদ খুঁজুন</h1></div>
   <form action="/search" role="search" className="bw-search-form">
    <label htmlFor="bw-search-input">অনুসন্ধান</label>
    <div><input id="bw-search-input" type="search" name="q" maxLength={120} defaultValue={q} placeholder="বাংলায় সংবাদ খুঁজুন"/><button type="submit">খুঁজুন</button></div>
   </form>
   {search&&<p className="bw-search-count">“{q}” এর ফলাফল: {found.length}টি {showingSamples?"নমুনা সংবাদ":"সংবাদ"}</p>}
   {found.length?<div className="bw-listing-grid">{found.map(item=><NewsCard key={item.id} item={item}/>)}</div>:<p className="bw-empty">{search?"এই শব্দের সঙ্গে মিলে কোনো সংবাদ পাওয়া যায়নি।":"সংবাদ খুঁজতে উপরের ঘরে লিখুন।"}</p>}
  </section>
 </main>;
}
