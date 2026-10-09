"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { categories } from "@/lib/demo-news";

export function SiteHeader() {
  const [menuOpen,setMenuOpen] = useState(false);
  const [searchOpen,setSearchOpen] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") {setMenuOpen(false);setSearchOpen(false);} };
    document.addEventListener("keydown",onKey);
    return () => document.removeEventListener("keydown",onKey);
  },[]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {document.body.style.overflow = "";};
  },[menuOpen]);
  return <>
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="site-brand" aria-label="Bengal Wave: প্রচ্ছদ" onClick={() => setMenuOpen(false)}>
          <span className="brand-symbol"><img src="/brand/logo.webp" alt="Bengal Wave-এর মূল লোগো" /></span>
          <span className="brand-text"><strong><span>Bengal</span><em>Wave</em></strong><small>বাংলার কণ্ঠ, বিশ্বের খবর</small></span>
        </Link>
        <nav aria-label="প্রধান নেভিগেশন" className="primary-nav">
          <Link href="/">প্রচ্ছদ</Link><Link href="/latest">সর্বশেষ</Link>
          <Link href="/category/national">বাংলাদেশ</Link><Link href="/category/international">বিশ্ব</Link>
          <Link href="/category/features">ফিচার</Link>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="সংবাদ খুঁজুন" aria-expanded={searchOpen} onClick={() => setSearchOpen(!searchOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
          </button>
          <button className="icon-button" aria-label="মেনু খুলুন" aria-expanded={menuOpen} aria-controls="site-drawer" onClick={() => setMenuOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
        </div>
      </div>
      {searchOpen && <form action="/search" className="header-search" role="search"><label htmlFor="header-q">সংবাদ খুঁজুন</label><input id="header-q" name="q" autoFocus placeholder="বাংলায় সংবাদ খুঁজুন..." required /><button type="submit">খুঁজুন</button></form>}
    </header>
    {menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
    <aside id="site-drawer" className={"menu-drawer"+(menuOpen?" is-open":"")} aria-hidden={!menuOpen} aria-label="সাইট মেনু" inert={!menuOpen}>
      <div className="drawer-top"><span className="drawer-brand">Bengal <b>Wave</b></span><button className="icon-button" aria-label="মেনু বন্ধ করুন" onClick={() => setMenuOpen(false)}>✕</button></div>
      <nav className="drawer-links" aria-label="সব বিভাগ">
        {[{slug:"",label:"প্রচ্ছদ"},{slug:"latest",label:"সর্বশেষ সংবাদ"},...categories].map(c =>
          <Link key={c.slug || "home"} href={!c.slug?"/":c.slug==="latest"?"/latest":"/category/"+c.slug} onClick={() => setMenuOpen(false)}>{c.label}</Link>
        )}
      </nav>
      <p className="drawer-tagline">বাংলার কণ্ঠ, বিশ্বের খবর</p>
    </aside>
  </>;
}
