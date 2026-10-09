import type { Metadata } from "next";
import { NewsCard } from "@/components/news-card";
import { demoNews } from "@/lib/demo-news";
export const metadata: Metadata = { title: "সর্বশেষ সংবাদ" };
export default function Latest() {
 return <main className="container listing-page"><div className="section-heading"><h1>সর্বশেষ সংবাদ</h1></div><p className="demo-note">বর্তমানে শুধু নমুনা সংবাদ দেখানো হচ্ছে।</p><div className="listing-grid">{demoNews.map(item=><NewsCard key={item.id} item={item}/>)}</div></main>;
}
