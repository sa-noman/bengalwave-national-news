export const dynamic="force-dynamic";
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {getDisplayArticle} from "@/lib/news-display";
import {PreviewNotice} from "@/components/preview-notice";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const item=await getDisplayArticle(slug);
 return item?{title:item.title,description:item.summary,robots:item.isDemo?{index:false,follow:false}:undefined}:{title:"সংবাদ পাওয়া যায়নি",robots:{index:false,follow:false}};
}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const item=await getDisplayArticle(slug);
 if(!item)notFound();
 return <main className="bw-website">{item.isDemo&&<PreviewNotice/>}
  <div className="bw-wrap bw-article">
   <nav className="bw-breadcrumb" aria-label="অবস্থান"><Link href="/">প্রচ্ছদ</Link><span>›</span><Link href="/latest">সংবাদ</Link></nav>
   <article>
    <span className="bw-tag">{item.category}</span>
    <h1>{item.title}</h1>
    <p className="bw-article-deck">{item.summary}</p>
    <div className="bw-article-byline">{item.isDemo?"নমুনা প্রতিবেদন · বাস্তব সংবাদ নয়":
      "Bengal Wave · "+(item.publishedAt?new Date(item.publishedAt).toLocaleString("bn-BD",{timeZone:"Asia/Dhaka",dateStyle:"medium",timeStyle:"short"}):"")}</div>
    <figure><img src={item.image} alt={item.slug==="bobby-hajjaj-drug-control-social-change-oct-2026"?"বিতর্ক প্রতিযোগিতায় পুরস্কার তুলে দিচ্ছেন ববি হাজ্জাজ":item.slug==="charmonai-pir-local-election-shariah-oct-2026"?"জাতীয় শ্রমিক কাউন্সিলে বক্তব্য দিচ্ছেন চরমোনাই পীর":item.slug==="us-sanctions-icc-after-navi-pillay-nobel-2026"?"নেদারল্যান্ডসের হেগে আন্তর্জাতিক অপরাধ আদালতের ভবন":item.isDemo?"নমুনা প্রতিবেদনের প্রতীকী অলংকরণ":"প্রতীকী সংবাদ চিত্র"}/><figcaption>{item.slug==="bobby-hajjaj-drug-control-social-change-oct-2026"?"ছবি: সংগৃহীত":item.slug==="charmonai-pir-local-election-shariah-oct-2026"?"ছবি: ইসলামী আন্দোলনের সৌজন্যে":item.slug==="us-sanctions-icc-after-navi-pillay-nobel-2026"?"আন্তর্জাতিক অপরাধ আদালতের ভবন":"প্রতীকী অলংকরণ"}</figcaption></figure>
    <div className="bw-article-body">{item.body.split(/\n\s*\n/).filter(Boolean).map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div>
    {item.sourceUrl&&!item.isDemo&&<div className="bw-article-source">সূত্র: <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">{item.sourceName||"মূল উৎস"}</a></div>}
   </article>
   <Link href="/latest" className="bw-article-back">← সর্বশেষ সংবাদে ফিরুন</Link>
  </div>
 </main>;
}
