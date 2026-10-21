export const dynamic="force-dynamic";
import Link from "next/link";
import {NewsCard} from "@/components/news-card";
import {PreviewNotice} from "@/components/preview-notice";
import {getDisplayNews,isDesignPreview} from "@/lib/news-display";
import type {NewsItem} from "@/lib/demo-news";
import {HeritageStories} from "@/components/heritage-stories";

function SectionHeading({title,href="/latest",linkText="আরও"}:{title:string;href?:string;linkText?:string}){
 return <div className="bw-section-heading"><h2><Link href={href}>{title}</Link></h2><Link href={href}>{linkText} <span aria-hidden="true">›</span></Link></div>;
}
function FourColumn({items,hideCategory=false}:{items:NewsItem[];hideCategory?:boolean}){
 if(!items.length)return <p className="bw-empty">এই বিভাগে এখনো সংবাদ প্রকাশিত হয়নি।</p>;
 return <div className="bw-grid-four">{items.map(item=><NewsCard item={item} key={item.id} hideCategory={hideCategory}/>)}</div>;
}
function NewsSection({title,items,href,boxed=false,hideCategory=false}:{title:string;items:NewsItem[];href:string;boxed?:boolean;hideCategory?:boolean}){
 if(!items.length&&!boxed)return null;
 return <section className="bw-section"><div className="bw-wrap">
   <div className={boxed?"bw-selected-box":""}>
    <SectionHeading title={title} href={href} linkText={boxed?"সব প্রতিবেদন":"আরও"}/>
    {items.length?<FourColumn items={items} hideCategory={hideCategory}/>:<p className="bw-empty">এখনো কোনো এক্সক্লুসিভ প্রতিবেদন প্রকাশিত হয়নি।</p>}
   </div>
 </div></section>;
}
function choose(items:NewsItem[],slugs:string[],exclude:Set<string>,limit=4) {
 return items.filter(item=>slugs.includes(item.categorySlug||"")&&!exclude.has(item.id)).slice(0,limit);
}
export default async function Home(){
 const {items:articles,showingSamples}=await getDisplayNews(100);
 const lead=articles[0];
 const rest=articles.slice(1);
 const latest=articles.slice(3,8);
 const select=articles.filter(a=>a.categorySlug==="exclusive").slice(0,4);
 const national=choose(articles,["national","politics"],new Set<string>(),4);
 const world=choose(articles,["international"],new Set<string>(),4);
 const sports=choose(articles,["sports"],new Set<string>(),4);
 const economy=choose(articles,["economy"],new Set<string>(),4);
 const feature=choose(articles,["features","culture","entertainment"],new Set<string>(),2);
 return <main className="bw-website bw-home">
  {(isDesignPreview()||showingSamples) && <PreviewNotice samples={showingSamples}/>}
  {!lead ? <section className="bw-wrap bw-empty-home">
    <div className="bw-empty-symbol">BW</div>
    <span className="bw-small-label">BENGAL WAVE · NEWSROOM</span>
    <h1>খবর আসবে, গল্প চলবে</h1>
    <p>প্রথম যাচাইকৃত সংবাদ প্রকাশিত হলে এখানে দেশের ও বিশ্বের খবর দেখতে পাবেন।</p>
  </section>:
  <>
   <section className="bw-lead-band"><div className="bw-wrap bw-hero">
    <div className="bw-hero-lead">
      <NewsCard item={lead} variant="lead"/>
      <div className="bw-lead-short">{rest.slice(0,2).map(item=><NewsCard key={item.id} item={item} variant="text"/>)}</div>
    </div>
    <div className="bw-hero-middle">
      <div className="bw-hero-label">দেশ ও বিশ্ব</div>
      {rest.slice(2,4).map(item=><NewsCard key={item.id} item={item} variant="middle"/>)}
    </div>
    <aside className="bw-hero-latest" id="latest-news">
      <SectionHeading title="সর্বশেষ সংবাদ" href="/latest"/>
      <div className="bw-latest-list">{latest.map(item=><NewsCard key={item.id} item={item} variant="latest"/>)}</div>
    </aside>
   </div></section>
   <NewsSection title="এক্সক্লুসিভ" href="/category/exclusive" boxed hideCategory items={select}/>
   <NewsSection title="জাতীয়" href="/category/national" items={national}/>
   <NewsSection title="আন্তর্জাতিক" href="/category/international" items={world}/>
   <NewsSection title="খেলাধুলা" href="/category/sports" items={sports}/>
   <NewsSection title="অর্থনীতি" href="/category/economy" items={economy}/>
   <section className="bw-section bw-section--feature"><div className="bw-wrap"><div className="bw-feature-panel">
      <SectionHeading title="ফিচার ও সংস্কৃতি" href="/category/features" linkText="আরও পড়ুন"/>
      {feature.length?<div className="bw-feature-grid">{feature.map(item=><NewsCard key={item.id} item={item} variant="feature"/>)}</div>:<p className="bw-empty">এখনো কোনো ফিচার প্রকাশিত হয়নি।</p>}
   </div></div></section>
  </>}
  <HeritageStories/>
 </main>;
}
