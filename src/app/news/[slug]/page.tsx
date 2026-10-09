import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {getPublishedArticle} from "@/lib/news-feed";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params, item=await getPublishedArticle(slug);
 return item?{title:item.title,description:item.summary}:{title:"সংবাদ পাওয়া যায়নি",robots:{index:false,follow:false}};
}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params, item=await getPublishedArticle(slug);
 if(!item)notFound();
 return <main className="container article-page">
   <nav className="breadcrumbs"><Link href="/">প্রচ্ছদ</Link> / <Link href="/latest">সংবাদ</Link></nav>
   <article>
    <span className="category">{item.category}</span>
    <h1>{item.title}</h1><p className="article-deck">{item.summary}</p>
    <div className="article-byline">Bengal Wave · {item.publishedAt?new Date(item.publishedAt).toLocaleString("bn-BD",{timeZone:"Asia/Dhaka",dateStyle:"medium",timeStyle:"short"}):""}</div>
    <img className="article-cover" src={item.image} alt="প্রতীকী সংবাদ চিত্র"/>
    <div className="article-text">{item.body.split(/\n\s*\n/).filter(Boolean).map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div>
    {item.sourceUrl && <p className="article-source">সূত্র: <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">{item.sourceName||"মূল উৎস"}</a></p>}
   </article>
   <Link className="back-link" href="/latest">← সর্বশেষ সংবাদে ফিরুন</Link>
 </main>;
}
