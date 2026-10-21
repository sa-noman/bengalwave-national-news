"use client";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {usePathname} from "next/navigation";
import {categories} from "@/lib/demo-news";
import {getHeaderDates} from "@/lib/header-calendar-dates";

const topLinks=[
 {label:"প্রচ্ছদ",href:"/"},{label:"সর্বশেষ",href:"/latest"},
 {label:"এক্সক্লুসিভ",href:"/category/exclusive"},
 {label:"জাতীয়",href:"/category/national"},{label:"আন্তর্জাতিক",href:"/category/international"},
 {label:"খেলাধুলা",href:"/category/sports"},{label:"অর্থনীতি",href:"/category/economy"},
 {label:"প্রযুক্তি",href:"/category/technology"},{label:"বিনোদন",href:"/category/entertainment"}
];
const allLinks=[...topLinks,{label:"ফিচার",href:"/category/features"},{label:"সংস্কৃতি",href:"/category/culture"},{label:"রাজনীতি",href:"/category/politics"}];
const SearchIcon=()=> <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
const MoonIcon=()=> <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.6 15.1A8.9 8.9 0 0 1 8.9 3.4a9 9 0 1 0 11.7 11.7Z"/></svg>;
const SunIcon=()=> <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>;
const MenuIcon=()=> <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>;

export function SiteHeader(){
 const pathname=usePathname();
 const [drawerOpen,setDrawerOpen]=useState(false);
 const [searchOpen,setSearchOpen]=useState(false);
 const [theme,setTheme]=useState<"light"|"dark">("light");
 const [headerDates,setHeaderDates]=useState({gregorian:"",bengali:"",hijri:""});
 const today=headerDates.gregorian;
 const closeButton=useRef<HTMLButtonElement>(null);
 const menuButton=useRef<HTMLButtonElement>(null);

 useEffect(()=>{
   const refresh=()=>setHeaderDates(getHeaderDates(new Date()));
   refresh();
   const interval=window.setInterval(refresh,60_000);
   return ()=>window.clearInterval(interval);
 },[]);
 useEffect(()=>{
   if(!drawerOpen)return;
   const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){setDrawerOpen(false);menuButton.current?.focus();}};
   document.addEventListener("keydown",onKey);
   const old=document.body.style.overflow;
   document.body.style.overflow="hidden";
   closeButton.current?.focus();
   return ()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow=old;};
 },[drawerOpen]);
 useEffect(()=>{setDrawerOpen(false);setSearchOpen(false);},[pathname]);
 useEffect(()=>{
   const mq=window.matchMedia("(prefers-color-scheme: dark)");
   const saved=()=>{
     try{
       const value=window.localStorage.getItem("bw-theme-preference");
       return value==="dark"||value==="light"?value:null;
     }catch{return null;}
   };
   const sync=()=>{
     const current=saved()||(mq.matches?"dark":"light");
     document.documentElement.dataset.theme=current;
     setTheme(current);
   };
   sync();
   mq.addEventListener("change",sync);
   window.addEventListener("storage",sync);
   return ()=>{mq.removeEventListener("change",sync);window.removeEventListener("storage",sync);};
 },[]);
 const toggleTheme=()=>{
   const next=theme==="dark"?"light":"dark";
   document.documentElement.dataset.theme=next;
   setTheme(next);
   try{window.localStorage.setItem("bw-theme-preference",next);}catch{/* Storage disabled; current tab still switches. */}
 };
 const themeButton=(className:string)=><button
   className={"bw-head-icon "+className}
   type="button"
   aria-label={theme==="dark"?"লাইট মোড চালু করুন":"ডার্ক মোড চালু করুন"}
   aria-pressed={theme==="dark"}
   title={theme==="dark"?"লাইট মোড":"ডার্ক মোড"}
   onClick={toggleTheme}
 >{theme==="dark"?<SunIcon/>:<MoonIcon/>}</button>;
 const openMenu=()=>{setSearchOpen(false);setDrawerOpen(true);};
 return <>
   <div className="bw-topbar"><div className="bw-wrap bw-topbar-inner">
     <span>{today||"বাংলাদেশ সময়"}</span>
     <span className="bw-top-motto">{headerDates.bengali||"বাংলা তারিখ"}</span>
     <span className="bw-top-hijri" title="হিজরি তারিখ আনুমানিক; বাংলাদেশে চাঁদ দেখার ওপর নির্ভর করে এক দিন ভিন্ন হতে পারে">{headerDates.hijri||"হিজরি তারিখ"}</span>
   </div></div>
   <header className="bw-masthead">
    <div className="bw-wrap bw-masthead-inner">
      <Link href="/" className="bw-brand" aria-label="Bengal Wave প্রচ্ছদ">
        <span className="bw-brand-mark"><img src="/brand/logo-prototype.webp" alt="Bengal Wave-এর মূল লোগো"/></span>
        <span className="bw-brand-words"><strong>Bengal<i>Wave</i></strong><small>ইতিহাস, সংবাদ ও সংস্কৃতির প্রতিচ্ছবি</small></span>
      </Link>
      <div className="bw-brand-actions">
       <div className="bw-follow-shell">
        <a className="bw-follow-button" href="https://www.facebook.com/BengalWaveOfficial" target="_blank" rel="noopener noreferrer">ফলো করুন</a>
       </div>
       <button className="bw-head-icon bw-head-search" type="button" aria-label="সংবাদ খুঁজুন" aria-expanded={searchOpen} onClick={()=>setSearchOpen(!searchOpen)}><SearchIcon/></button>
       {themeButton("bw-theme-mobile-toggle")}
      </div>
    </div>
    {searchOpen&&<form className="bw-search-popup bw-wrap" role="search" action="/search">
       <label htmlFor="bw-header-query">সংবাদ অনুসন্ধান</label>
       <div><input id="bw-header-query" autoFocus name="q" placeholder="বাংলায় সংবাদ খুঁজুন" required maxLength={120}/><button type="submit">খুঁজুন</button></div>
    </form>}
   </header>
   <nav className="bw-navbar" aria-label="মূল মেনু"><div className="bw-wrap bw-nav-inner">
      <div className="bw-nav-scroll">{topLinks.map(l=><Link className={pathname===l.href?"bw-active":""} aria-current={pathname===l.href?"page":undefined} href={l.href} key={l.href}>{l.label}</Link>)}</div>
      {themeButton("bw-theme-nav-toggle")}
      <button ref={menuButton} type="button" className="bw-head-icon bw-menu-trigger" aria-expanded={drawerOpen} aria-controls="bw-side-drawer" aria-label="সব বিভাগ খুলুন" onClick={openMenu}><MenuIcon/></button>
   </div></nav>
   {drawerOpen&&<div className="bw-overlay" role="presentation" onClick={()=>setDrawerOpen(false)}/>}
   <aside id="bw-side-drawer" className={"bw-drawer"+(drawerOpen?" bw-drawer-open":"")} aria-label="বেঙ্গল ওয়েভ মেনু" aria-hidden={!drawerOpen} inert={!drawerOpen}>
    <div className="bw-menu-background" aria-hidden="true"><img className="bw-bg-art" src="/prototype/offcanvas-menu-watermark.svg" alt="" draggable={false}/></div>
    <div className="bw-drawer-head">
     <Link href="/" className="bw-drawer-mark" onClick={()=>setDrawerOpen(false)} aria-label="প্রচ্ছদ"><img src="/brand/logo-prototype.webp" alt="Bengal Wave"/></Link>
     <button ref={closeButton} type="button" className="bw-drawer-close" onClick={()=>{setDrawerOpen(false);menuButton.current?.focus()}} aria-label="মেনু বন্ধ করুন">✕</button>
    </div>
    <form className="bw-drawer-search" action="/search" role="search"><input name="q" type="search" placeholder="সংবাদ খুঁজুন..." maxLength={120} aria-label="সংবাদ খুঁজুন"/></form>
    <nav className="bw-drawer-links" aria-label="সব বিভাগ">{allLinks.map(l=><Link key={l.href} href={l.href} onClick={()=>setDrawerOpen(false)}>{l.label}</Link>)}</nav>
    <div className="bw-drawer-foot"><span>ইতিহাস, সংবাদ ও<br/>সংস্কৃতির প্রতিচ্ছবি</span><span>{today}</span><small>© ২০২৬ বেঙ্গল ওয়েভ</small></div>
   </aside>
   <nav className="bw-bottom-nav" aria-label="মোবাইল নেভিগেশন">
    <Link href="/" aria-current={pathname==="/"?"page":undefined}><span aria-hidden="true">⌂</span>হোম</Link>
    <Link href="/latest" aria-current={pathname==="/latest"?"page":undefined}><span aria-hidden="true">◷</span>সর্বশেষ</Link>
    <button type="button" onClick={openMenu} aria-label="ক্যাটাগরি মেনু"><span aria-hidden="true">☰</span>ক্যাটাগরি</button>
    <Link href="/search"><span aria-hidden="true">⌕</span>সার্চ</Link>
   </nav>
 </>;
}
