"use client";

import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {NewsCard} from "@/components/news-card";
import type {NewsItem} from "@/lib/demo-news";

type Tab="latest"|"popular";
const bengaliNumber=(value:number)=>String(value).replace(/[0-9]/g,digit=>"০১২৩৪৫৬৭৮৯"[Number(digit)]);

function PopularList({items}:{items:NewsItem[]}){
 if(!items.length)return <p className="bw-popular-empty">সংবাদ পড়ার তথ্য জমা হলে এখানে সর্বাধিক পঠিত সংবাদ দেখা যাবে।</p>;
 return <ol className="bw-popular-list">
  {items.slice(0,5).map((item,i)=><li className="bw-popular-item" key={item.id}>
    <span className="bw-popular-rank" aria-hidden="true">{bengaliNumber(i+1)}</span>
    <Link href={"/news/"+encodeURIComponent(item.slug)} className="bw-popular-link" aria-label={bengaliNumber(i+1)+" নম্বর সর্বাধিক পঠিত সংবাদ: "+item.title}>
      <span className="bw-title-underline">{item.title}</span>
    </Link>
   </li>)}
 </ol>;
}
function LatestList({items}:{items:NewsItem[]}){
 return <div className="bw-latest-list">{items.length?
  items.slice(0,5).map(item=><NewsCard key={item.id} item={item} variant="latest"/>):
  <p className="bw-popular-empty">এখনো কোনো সংবাদ প্রকাশিত হয়নি।</p>}</div>;
}

export function HomeNewsSidebar({latest,popular}:{latest:NewsItem[];popular:NewsItem[]}){
 const [tab,setTab]=useState<Tab>("latest");
 const [compact,setCompact]=useState(false);
 const sidebar=useRef<HTMLDivElement>(null);

 // Preserve desktop three-column alignment. Show five latest when space fits;
 // otherwise reduce only the latest list by one, never the top-five ranking.
 useEffect(()=>{
  const root=sidebar.current?.closest(".bw-hero");
  const main=root?.querySelector<HTMLElement>(".bw-hero-lead");
  const middle=root?.querySelector<HTMLElement>(".bw-hero-middle");
  if(!root||!main||!middle||!sidebar.current)return;
  const measure=()=>{
   if(window.matchMedia("(max-width: 760px)").matches){setCompact(false);return;}
   const available=Math.max(main.scrollHeight,middle.scrollHeight);
   const required=sidebar.current?.scrollHeight||0;
   if(required>available+8)setCompact(true);
   else if(compact&&required+135<available)setCompact(false);
  };
  const observer=new ResizeObserver(measure);
  observer.observe(main);observer.observe(middle);
  window.addEventListener("resize",measure,{passive:true});
  const raf=window.requestAnimationFrame(measure);
  return ()=>{window.cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener("resize",measure);};
 },[compact,latest,popular]);

 const desktopLatest=compact&&latest.length>=5?latest.slice(0,4):latest.slice(0,5);
 return <>
  <div className="bw-home-sidebar-desktop" ref={sidebar}>
   <section aria-label="সর্বশেষ সংবাদ" className="bw-home-sidebar-section bw-home-sidebar-latest">
    <div className="bw-section-heading">
      <h2><Link href="/latest">সর্বশেষ সংবাদ</Link></h2>
      <Link href="/latest">আরও <span aria-hidden="true">›</span></Link>
    </div>
    <div className="bw-latest-list">{desktopLatest.map(item=><NewsCard key={item.id} item={item} variant="latest"/>)}</div>
   </section>
   <section aria-label="সর্বাধিক পঠিত সংবাদ" className="bw-home-sidebar-section bw-home-sidebar-popular">
    <div className="bw-section-heading"><h2>সর্বাধিক পঠিত</h2></div>
    <PopularList items={popular}/>
   </section>
  </div>
  <div className="bw-home-sidebar-mobile">
   <div className="bw-home-news-tabs" role="tablist" aria-label="সংবাদের তালিকা">
    <button type="button" role="tab" id="bw-news-tab-latest" aria-controls="bw-news-tab-panel"
      aria-selected={tab==="latest"} tabIndex={tab==="latest"?0:-1}
      onClick={()=>setTab("latest")}
      onKeyDown={e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();setTab("popular");document.getElementById("bw-news-tab-popular")?.focus();}}}>
       সর্বশেষ সংবাদ
    </button>
    <button type="button" role="tab" id="bw-news-tab-popular" aria-controls="bw-news-tab-panel"
      aria-selected={tab==="popular"} tabIndex={tab==="popular"?0:-1}
      onClick={()=>setTab("popular")}
      onKeyDown={e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();setTab("latest");document.getElementById("bw-news-tab-latest")?.focus();}}}>
       সর্বাধিক পঠিত
    </button>
   </div>
   <div role="tabpanel" id="bw-news-tab-panel" aria-labelledby={tab==="latest"?"bw-news-tab-latest":"bw-news-tab-popular"}>
    {tab==="latest"?<LatestList items={latest}/>:<PopularList items={popular}/>}
   </div>
  </div>
 </>;
}
