import Link from "next/link";
import { NewsCard } from "@/components/news-card";
import { demoNews } from "@/lib/demo-news";

export default function Home() {
  const [lead,secondary,third,...remaining] = demoNews;
  return <main>
    <section className="container newsroom">
      <div className="home-context"><span>শুক্রবার, ৯ অক্টোবর ২০২৬</span><span>ডেভেলপমেন্ট প্রিভিউ · সব সংবাদ নমুনা</span></div>
      <div className="lead-grid">
        <div className="lead-column">
          <NewsCard item={lead} hero />
          <div className="mini-news-row">{remaining.slice(0,2).map(item=><article key={item.id}><span className="category">{item.category}</span><h3 className="story-title"><Link className="headline-link" href={"/news/"+item.slug}>{item.title}</Link></h3></article>)}</div>
        </div>
        <div className="middle-column"><NewsCard item={secondary}/><NewsCard item={third}/></div>
        <aside className="latest-column">
          <div className="section-heading"><h2>সর্বশেষ সংবাদ</h2><Link href="/latest">আরও ↗</Link></div>
          {demoNews.slice(3,8).map(item=><article className="latest-item" key={item.id}><div><span className="category">{item.category}</span><h3><Link className="headline-link" href={"/news/"+item.slug}>{item.title}</Link></h3></div><Link href={"/news/"+item.slug}><img src={item.image} alt="" loading="lazy"/></Link></article>)}
        </aside>
      </div>
    </section>
    <section className="selected-section">
      <div className="container section-block">
        <div className="section-heading"><h2>নির্বাচিত প্রতিবেদন</h2><Link href="/latest">সব প্রতিবেদন ↗</Link></div>
        <div className="cards-four">{[demoNews[4],demoNews[3],demoNews[5],demoNews[2]].map(item=><NewsCard item={item} key={item.id}/>)}</div>
      </div>
    </section>
    <section className="container section-block">
      <div className="section-heading"><h2>বাংলাদেশ</h2><Link href="/category/national">সব খবর ↗</Link></div>
      <div className="cards-three">{[lead,secondary,third].map(item=><NewsCard item={item} key={item.id}/>)}</div>
    </section>
    <section className="container section-block">
      <div className="section-heading"><h2>আন্তর্জাতিক ও অর্থনীতি</h2><Link href="/category/international">সব খবর ↗</Link></div>
      <div className="cards-three">{demoNews.slice(2,5).map(item=><NewsCard item={item} key={item.id}/>)}</div>
    </section>
    <section className="feature-section">
      <div className="container section-block">
        <div className="section-heading"><h2>ফিচার ও সংস্কৃতি</h2><Link href="/category/features">সব ফিচার ↗</Link></div>
        <div className="cards-three">{[demoNews[6],demoNews[4],demoNews[7]].map(item=><NewsCard item={item} key={item.id}/>)}</div>
      </div>
    </section>
  </main>;
}
