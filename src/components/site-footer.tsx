import Link from "next/link";
import { categories } from "@/lib/demo-news";

export function SiteFooter() {
  return <footer>
    <section className="heritage-banner">
      <div className="container heritage-content">
        <div><span className="eyebrow">BENGAL WAVE</span><h2>যে বাংলার গল্প<br/>শেষ হওয়ার নয়</h2><p>ইতিহাস, ঐতিহ্য, দেশ ও মানুষের কথা নিয়ে আমাদের পথচলা।</p></div>
      </div>
    </section>
    <div className="footer-main">
      <div className="container footer-grid">
        <div className="footer-about"><h2><span>Bengal</span><em>Wave</em></h2><p>বাংলার কণ্ঠ, বিশ্বের খবর। মানুষের কথা ও তথ্যভিত্তিক সংবাদকে গুরুত্ব দিয়ে আমাদের যাত্রা।</p></div>
        <div><h3>প্রধান বিভাগ</h3><nav>{categories.slice(0,5).map(c=><Link href={"/category/"+c.slug} key={c.slug}>{c.label}</Link>)}</nav></div>
        <div><h3>আমাদের সম্পর্কে</h3><nav><Link href="/about">আমাদের কথা</Link><Link href="/editorial-policy">সম্পাদকীয় নীতিমালা</Link><Link href="/contact">যোগাযোগ</Link></nav></div>
        <div><h3>যুক্ত থাকুন</h3><p>সামাজিক যোগাযোগমাধ্যমের আনুষ্ঠানিক লিংক যুক্ত করা হবে।</p></div>
      </div>
      <div className="container footer-bottom"><span>© ২০২৬ Bengal Wave</span><span>bengalwavenews.com · ডোমেইন পরবর্তীতে যুক্ত হবে</span></div>
    </div>
  </footer>;
}
