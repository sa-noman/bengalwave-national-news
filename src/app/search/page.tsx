import type { Metadata } from "next";
import { NewsCard } from "@/components/news-card";
import { demoNews } from "@/lib/demo-news";
export const metadata: Metadata={title:"সংবাদ খুঁজুন"};
export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
 const {q=""}=await searchParams;const query=q.trim().toLocaleLowerCase("bn");
 const matches=query?demoNews.filter(item=>[item.title,item.summary,item.category].join(" ").toLocaleLowerCase("bn").includes(query)):[];
 return <main className="container listing-page"><div className="section-heading"><h1>সংবাদ খুঁজুন</h1></div><form action="/search" className="search-form"><label htmlFor="q">অনুসন্ধান</label><input id="q" name="q" defaultValue={q} placeholder="বাংলায় লিখুন..." /><button type="submit">খুঁজুন</button></form>{query && <p className="demo-note">“{q}” এর ফলাফল: {matches.length}টি নমুনা সংবাদ</p>}<div className="listing-grid">{matches.map(item=><NewsCard key={item.id} item={item}/>)}</div></main>;
}
