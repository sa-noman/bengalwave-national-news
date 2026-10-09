// The homepage reads published records at request time, never a build-time snapshot.
export const dynamic="force-dynamic";
import Link from "next/link";
import {NewsCard} from "@/components/news-card";
import {PreviewNotice} from "@/components/preview-notice";
import {getDisplayNews} from "@/lib/news-display";
import type {NewsItem} from "@/lib/demo-news";

function Cards({items,columns=3}:{items:NewsItem[];columns?:3|4}){
  if(!items.length)return <p className="empty-news">এই বিভাগে এখনো সংবাদ প্রকাশিত হয়নি।</p>;
  return <div className={columns===4?"cards-four":"cards-three"}>{items.map(item=><NewsCard item={item} key={item.id}/>)}</div>;
}
export default async function Home(){
  const {items:articles,showingSamples}=await getDisplayNews(70);
  const [lead,secondary,third]=articles;
  const featured=articles.filter(a=>a.featured);
  const selected=featured.length?featured.slice(0,4):articles.slice(0,4);
  const national=articles.filter(a=>a.categorySlug==="national").slice(0,3);
  const world=articles.filter(a=>["international","economy"].includes(a.categorySlug||"")).slice(0,3);
  const features=articles.filter(a=>["features","culture","entertainment"].includes(a.categorySlug||"")).slice(0,3);
  const date=new Date().toLocaleDateString("bn-BD",{timeZone:"Asia/Dhaka",weekday:"long",year:"numeric",month:"long",day:"numeric"});
  return <main>
    {showingSamples && <PreviewNotice/>}
    <section className="container newsroom">
      <div className="home-context"><span>{date}</span><span>বাংলার কণ্ঠ, বিশ্বের খবর</span></div>
      {!lead ?
        <div className="news-empty-home">
          <div className="empty-ornament" aria-hidden="true">BW</div>
          <span className="eyebrow">BENGAL WAVE · NEWSROOM</span>
          <h1>খবর আসবে, গল্প চলবে</h1>
          <p>ওয়েবসাইটের প্রস্তুতি চলছে। প্রথম যাচাইকৃত সংবাদ প্রকাশের পর এখানে সর্বশেষ খবর দেখতে পাবেন।</p>
          <div className="empty-rule" aria-hidden="true"/>
          <p className="empty-small">বাংলাদেশ · আন্তর্জাতিক · অর্থনীতি · ফিচার ও সংস্কৃতি</p>
        </div>:
        <div className="lead-grid">
          <div className="lead-column">
            <NewsCard item={lead} hero/>
            <div className="mini-news-row">{articles.slice(3,5).map(item=><article key={item.id}>
              <span className="category">{item.category}</span>
              <h3 className="story-title"><Link className="headline-link" href={"/news/"+item.slug}>{item.title}</Link></h3>
            </article>)}</div>
          </div>
          <div className="middle-column">{[secondary,third].filter((x):x is NewsItem=>Boolean(x)).map(item=><NewsCard key={item.id} item={item}/>)}</div>
          <aside className="latest-column">
            <div className="section-heading"><h2>সর্বশেষ সংবাদ</h2><Link href="/latest">সব খবর <span aria-hidden="true">↗</span></Link></div>
            {articles.slice(3,9).map(item=><article className="latest-item" key={item.id}>
              <div><span className="category">{item.category}</span>
              <h3><Link className="headline-link" href={"/news/"+item.slug}>{item.title}</Link></h3>
              {item.isDemo && <span className="news-meta">নমুনা</span>}</div>
              <Link href={"/news/"+item.slug} aria-label={item.title}><img src={item.image} alt="" loading="lazy"/></Link>
            </article>)}
          </aside>
        </div>}
    </section>
    {articles.length>0 && <>
      <section className="selected-section"><div className="container section-block">
        <div className="section-heading"><h2>{featured.length?"নির্বাচিত প্রতিবেদন":"আরও সংবাদ"}</h2><Link href="/latest">সব সংবাদ ↗</Link></div>
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
    </>}
  </main>;
}
