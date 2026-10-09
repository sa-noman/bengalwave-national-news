import Link from "next/link";
import {NewsCard} from "@/components/news-card";
import {getPublishedNews} from "@/lib/news-feed";
import type {NewsItem} from "@/lib/demo-news";

function Cards({items,columns=3}:{items:NewsItem[];columns?:3|4}){
  if(!items.length)return <p className="empty-news">এখনো এই বিভাগে কোনো সংবাদ প্রকাশিত হয়নি।</p>;
  return <div className={columns===4?"cards-four":"cards-three"}>{items.map(item=><NewsCard item={item} key={item.id}/>)}</div>;
}
export default async function Home(){
  const articles=await getPublishedNews(70);
  const [lead,secondary,third]=articles;
  const selected=articles.filter(a=>a.featured).slice(0,4);
  const national=articles.filter(a=>a.categorySlug==="national").slice(0,3);
  const world=articles.filter(a=>["international","economy"].includes(a.categorySlug||"")).slice(0,3);
  const features=articles.filter(a=>["features","culture","entertainment"].includes(a.categorySlug||"")).slice(0,3);
  return <main>
    <section className="container newsroom">
      <div className="home-context"><span>{new Date().toLocaleDateString("bn-BD",{timeZone:"Asia/Dhaka",dateStyle:"full"})}</span><span>বাংলার কণ্ঠ, বিশ্বের খবর</span></div>
      {!lead ? <div className="empty-news news-empty-home"><h1>বেঙ্গল ওয়েভে স্বাগতম</h1><p>প্রথম যাচাইকৃত সংবাদ প্রকাশিত হলে এখানে দেখতে পাবেন।</p></div> :
      <div className="lead-grid">
        <div className="lead-column">
          <NewsCard item={lead} hero/>
          <div className="mini-news-row">{articles.slice(3,5).map(item=><article key={item.id}><span className="category">{item.category}</span><h3 className="story-title"><Link className="headline-link" href={"/news/"+item.slug}>{item.title}</Link></h3></article>)}</div>
        </div>
        <div className="middle-column">{[secondary,third].filter((x):x is NewsItem=>Boolean(x)).map(item=><NewsCard key={item.id} item={item}/>)}</div>
        <aside className="latest-column">
          <div className="section-heading"><h2>সর্বশেষ সংবাদ</h2><Link href="/latest">আরও ↗</Link></div>
          {articles.slice(3,8).map(item=><article className="latest-item" key={item.id}>
            <div><span className="category">{item.category}</span><h3><Link className="headline-link" href={"/news/"+item.slug}>{item.title}</Link></h3></div>
            <Link href={"/news/"+item.slug}><img src={item.image} alt="" loading="lazy"/></Link>
          </article>)}
        </aside>
      </div>}
    </section>
    <section className="selected-section"><div className="container section-block">
      <div className="section-heading"><h2>নির্বাচিত প্রতিবেদন</h2><Link href="/latest">সব প্রতিবেদন ↗</Link></div>
      <Cards items={selected} columns={4}/>
    </div></section>
    <section className="container section-block">
      <div className="section-heading"><h2>বাংলাদেশ</h2><Link href="/category/national">সব খবর ↗</Link></div>
      <Cards items={national}/>
    </section>
    <section className="container section-block">
      <div className="section-heading"><h2>আন্তর্জাতিক ও অর্থনীতি</h2><Link href="/category/international">সব খবর ↗</Link></div>
      <Cards items={world}/>
    </section>
    <section className="feature-section"><div className="container section-block">
      <div className="section-heading"><h2>ফিচার ও সংস্কৃতি</h2><Link href="/category/features">সব ফিচার ↗</Link></div>
      <Cards items={features}/>
    </div></section>
  </main>;
}
