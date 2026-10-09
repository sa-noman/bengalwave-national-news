import Link from "next/link";
import {categories} from "@/lib/demo-news";
import {NewsletterDemo} from "@/components/newsletter-demo";

export function SiteFooter(){
 return <footer className="bw-footer">
  <div className="bw-wrap">
   <NewsletterDemo/>
   <div className="bw-footer-grid">
    <div className="bw-footer-brand">
      <Link href="/" className="bw-footer-logo" aria-label="Bengal Wave প্রচ্ছদ"><span className="bw-brand-mark"><img src="/brand/logo-prototype.webp" alt="Bengal Wave"/></span></Link>
      <strong>Bengal<i>Wave</i></strong>
      <p>বাংলার কণ্ঠ, বিশ্বের খবর।</p><p>বিশ্বস্ত তথ্য, গভীর বিশ্লেষণ ও মানুষের গল্প নিয়ে আপনার পাশে।</p>
    </div>
    <div><h4>প্রধান বিভাগ</h4><div className="bw-footer-links">{categories.filter(c=>["national","international","economy","technology","sports","entertainment","features","culture"].includes(c.slug)).map(c=><Link key={c.slug} href={"/category/"+c.slug}>{c.label}</Link>)}</div></div>
    <div><h4>আমাদের সম্পর্কে</h4><div className="bw-footer-links"><Link href="/about">পরিচিতি</Link><Link href="/contact">যোগাযোগ</Link><Link href="/editorial-policy">সম্পাদকীয় নীতিমালা</Link><Link href="/privacy">গোপনীয়তা নীতি</Link></div></div>
    <div><h4>যুক্ত থাকুন</h4><p>সামাজিক যোগাযোগমাধ্যমের অফিসিয়াল লিংক শিগগিরই যুক্ত হবে।</p><Link className="bw-footer-search" href="/search">সংবাদ খুঁজুন ↗</Link></div>
   </div>
  </div>
  <div className="bw-footer-bottom"><div className="bw-wrap bw-footer-bottom-inner">
   <span>© ২০২৬ বেঙ্গল ওয়েভ। সর্বস্বত্ব সংরক্ষিত।</span>
   <span>বাংলার কণ্ঠ, বিশ্বের খবর</span>
  </div></div>
 </footer>;
}
