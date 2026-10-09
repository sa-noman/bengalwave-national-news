import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { demoNews, getArticle } from "@/lib/demo-news";
export function generateStaticParams(){return demoNews.map(item=>({slug:item.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const item=getArticle((await params).slug);return {title:item?.title||"সংবাদ",description:item?.summary};
}
export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
 const item=getArticle((await params).slug);if(!item)notFound();
 return <main className="container article-page"><nav className="breadcrumbs"><Link href="/">প্রচ্ছদ</Link> / <Link href="/latest">সংবাদ</Link></nav><article><span className="category">{item.category}</span><h1>{item.title}</h1><p className="article-deck">{item.summary}</p><div className="article-byline">Bengal Wave · ডেভেলপমেন্ট নমুনা</div><img className="article-cover" src={item.image} alt="" /><div className="article-text"><p>এটি Bengal Wave-এর নিউজ আর্টিকেল পেজের একটি নমুনা। এখানে প্রদর্শিত তথ্য কোনো বাস্তব সংবাদ প্রতিবেদন নয়।</p><p>প্রকাশনার জন্য প্রস্তুত হলে যাচাইকৃত সংবাদ, নির্ভরযোগ্য সূত্র, ছবির কৃতিত্ব, প্রকাশের সময় এবং সম্পাদনার ইতিহাস এই জায়গায় দেখানো হবে।</p></div></article><Link className="back-link" href="/latest">← সর্বশেষ সংবাদে ফিরুন</Link></main>;
}
