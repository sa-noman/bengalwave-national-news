"use client";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {usePathname} from "next/navigation";
import {categories} from "@/lib/demo-news";

const topLinks=[
 {label:"প্রচ্ছদ",href:"/"},{label:"সর্বশেষ",href:"/latest"},
 {label:"জাতীয়",href:"/category/national"},{label:"আন্তর্জাতিক",href:"/category/international"},
 {label:"খেলাধুলা",href:"/category/sports"},{label:"অর্থনীতি",href:"/category/economy"},
 {label:"প্রযুক্তি",href:"/category/technology"},{label:"বিনোদন",href:"/category/entertainment"}
];
const allLinks=[...topLinks,{label:"ফিচার",href:"/category/features"},{label:"সংস্কৃতি",href:"/category/culture"},{label:"রাজনীতি",href:"/category/politics"}];
const SearchIcon=()=> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
const MenuIcon=()=> <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>;

export function SiteHeader(){
 const pathname=usePathname();
 const [drawerOpen,setDrawerOpen]=useState(false);
 const [searchOpen,setSearchOpen]=useState(false);
 const [followOpen,setFollowOpen]=useState(false);
 const [today,setToday]=useState("");
 const closeButton=useRef<HTMLButtonElement>(null);
 const menuButton=useRef<HTMLButtonElement>(null);

 useEffect(()=>{setToday(new Intl.DateTimeFormat("bn-BD",{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Dhaka"}).format(new Date()));},[]);
 useEffect(()=>{
   if(!drawerOpen)return;
   const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){setDrawerOpen(false);menuButton.current?.focus();}};
   document.addEventListener("keydown",onKey);
   const old=document.body.style.overflow;
   document.body.style.overflow="hidden";
   closeButton.current?.focus();
   return ()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow=old;};
 },[drawerOpen]);
 useEffect(()=>{setDrawerOpen(false);setSearchOpen(false);setFollowOpen(false);},[pathname]);
 const openMenu=()=>{setSearchOpen(false);setDrawerOpen(true);};
 return <>
   <div className="bw-topbar"><div className="bw-wrap bw-topbar-inner">
     <span>{today||"বাংলাদেশ সময়"}</span><span className="bw-top-motto">বাংলার কণ্ঠ, বিশ্বের খবর</span>
     <Link className="bw-top-latest" href="/latest"><i aria-hidden="true"/> সর্বশেষ</Link>
   </div></div>
   <header className="bw-masthead">
    <div className="bw-wrap bw-masthead-inner">
      <Link href="/" className="bw-brand" aria-label="Bengal Wave প্রচ্ছদ">
        <span className="bw-brand-mark"><img src="/brand/logo-prototype.webp" alt="Bengal Wave-এর মূল লোগো"/></span>
        <span className="bw-brand-words"><strong>Bengal<i>Wave</i></strong><small>ইতিহাস, সংবাদ ও সংস্কৃতির প্রতিচ্ছবি</small></span>
      </Link>
      <div className="bw-brand-actions">
       <div className="bw-follow-shell">
        <button className="bw-follow-button" type="button" aria-expanded={followOpen} onClick={()=>setFollowOpen(!followOpen)}>ফলো করুন</button>
        {followOpen&&<div className="bw-follow-pop" role="status">অফিশিয়াল সোশ্যাল পেজের লিংক যুক্ত হলে এখানে পাওয়া যাবে।</div>}
       </div>
       <button className="bw-head-icon" type="button" aria-label="সংবাদ খুঁজুন" aria-expanded={searchOpen} onClick={()=>{setSearchOpen(!searchOpen);setFollowOpen(false)}}><SearchIcon/></button>
      </div>
    </div>
    {searchOpen&&<form className="bw-search-popup bw-wrap" role="search" action="/search">
       <label htmlFor="bw-header-query">সংবাদ অনুসন্ধান</label>
       <div><input id="bw-header-query" autoFocus name="q" placeholder="বাংলায় সংবাদ খুঁজুন" required maxLength={120}/><button type="submit">খুঁজুন</button></div>
    </form>}
   </header>
   <nav className="bw-navbar" aria-label="মূল মেনু"><div className="bw-wrap bw-nav-inner">
      <div className="bw-nav-scroll">{topLinks.map(l=><Link className={pathname===l.href?"bw-active":""} aria-current={pathname===l.href?"page":undefined} href={l.href} key={l.href}>{l.label}</Link>)}</div>
      <button ref={menuButton} type="button" className="bw-head-icon bw-menu-trigger" aria-expanded={drawerOpen} aria-controls="bw-side-drawer" aria-label="সব বিভাগ খুলুন" onClick={openMenu}><MenuIcon/></button>
   </div></nav>
   {drawerOpen&&<div className="bw-overlay" role="presentation" onClick={()=>setDrawerOpen(false)}/>}
   <aside id="bw-side-drawer" className={"bw-drawer"+(drawerOpen?" bw-drawer-open":"")} aria-label="বেঙ্গল ওয়েভ মেনু" aria-hidden={!drawerOpen} inert={!drawerOpen}>
    <div className="bw-drawer-head">
     <Link href="/" className="bw-drawer-mark" onClick={()=>setDrawerOpen(false)} aria-label="প্রচ্ছদ"><img src="/brand/logo-prototype.webp" alt="Bengal Wave"/></Link>
     <button ref={closeButton} type="button" className="bw-drawer-close" onClick={()=>{setDrawerOpen(false);menuButton.current?.focus()}} aria-label="মেনু বন্ধ করুন">✕</button>
    </div>
    <form className="bw-drawer-search" action="/search" role="search"><input name="q" type="search" placeholder="সংবাদ খুঁজুন..." maxLength={120} aria-label="সংবাদ খুঁজুন"/></form>
    <nav className="bw-drawer-links" aria-label="সব বিভাগ">{allLinks.map(l=><Link key={l.href} href={l.href} onClick={()=>setDrawerOpen(false)}>{l.label}</Link>)}</nav>
    <div className="bw-drawer-foot"><span>বাংলার কণ্ঠ, বিশ্বের খবর</span><span>{today}</span><small>© ২০২৬ বেঙ্গল ওয়েভ</small></div>
   </aside>
   <nav className="bw-bottom-nav" aria-label="মোবাইল নেভিগেশন">
    <Link href="/" aria-current={pathname==="/"?"page":undefined}><span aria-hidden="true">⌂</span>হোম</Link>
    <Link href="/latest" aria-current={pathname==="/latest"?"page":undefined}><span aria-hidden="true">◷</span>সর্বশেষ</Link>
    <button type="button" onClick={openMenu} aria-label="ক্যাটাগরি মেনু"><span aria-hidden="true">☰</span>ক্যাটাগরি</button>
    <Link href="/search"><span aria-hidden="true">⌕</span>সার্চ</Link>
   </nav>
 </>;
}
