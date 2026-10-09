import Link from "next/link";
import {categories} from "@/lib/demo-news";

export function SiteFooter(){
 return <footer>
  <section className="heritage-banner">
    <div className="container heritage-content">
      <div>
        <span className="eyebrow">BENGAL WAVE · STORIES OF BENGAL</span>
        <h2>বাংলার গল্প,<br/>বিশ্বের জানালা</h2>
        <p>সংবাদ, ইতিহাস, ঐতিহ্য ও মানুষের কথা। গভীরতায় ও দায়িত্বে বাংলা সাংবাদিকতার নতুন পথচলা।</p>
      </div>
    </div>
  </section>
  <div className="footer-main">
    <div className="container footer-grid">
      <div className="footer-about">
        <h2><span>Bengal</span><em>Wave</em></h2>
        <p>বাংলার কণ্ঠ, বিশ্বের খবর। তথ্যভিত্তিক সংবাদ ও মানুষের গল্পকে গুরুত্ব দিয়ে আমাদের পথচলা।</p>
      </div>
      <div><h3>প্রধান বিভাগ</h3><nav aria-label="ফুটার বিভাগ">{categories.slice(0,5).map(c=><Link href={"/category/"+c.slug} key={c.slug}>{c.label}</Link>)}</nav></div>
      <div><h3>বেঙ্গল ওয়েভ</h3><nav aria-label="প্রতিষ্ঠান"><Link href="/about">আমাদের কথা</Link><Link href="/editorial-policy">সম্পাদকীয় নীতিমালা</Link><Link href="/contact">যোগাযোগ</Link></nav></div>
      <div><h3>সংবাদ খুঁজুন</h3><p>আগ্রহের বিষয় ও প্রাসঙ্গিক শব্দ লিখে প্রতিবেদনের খোঁজ করুন।</p><nav><Link href="/search">অনুসন্ধান ↗</Link></nav></div>
    </div>
    <div className="container footer-bottom"><span>© ২০২৬ Bengal Wave · সর্বস্বত্ব সংরক্ষিত</span><span>উন্নয়নাধীন সংবাদমাধ্যম</span></div>
  </div>
 </footer>;
}
