import Link from "next/link";
import type { NewsItem } from "@/lib/demo-news";

export function NewsCard({item,compact=false,hero=false}:{
  item:NewsItem; compact?:boolean; hero?:boolean;
}) {
  const href="/news/"+item.slug;
  return <article className={"news-card"+(compact?" compact":"")+(hero?" hero-card":"")}>
    <Link className="news-image-link" href={href} aria-label={item.title}>
      <img className="news-image" src={item.image} alt={item.isDemo?"নমুনা প্রতিবেদনের প্রতীকী অলংকরণ":""} loading={hero?"eager":"lazy"}/>
    </Link>
    <div className="news-copy">
      <span className="category">{item.category}</span>
      <h3 className={hero?"hero-title":"story-title"}>
        <Link className="headline-link" href={href}>{item.title}</Link>
      </h3>
      {!compact && <p className="summary">{item.summary}</p>}
      <span className="news-meta">{item.isDemo?"নমুনা প্রতিবেদন · প্রকাশিত নয়":
        item.publishedAt?new Date(item.publishedAt).toLocaleDateString("bn-BD",{timeZone:"Asia/Dhaka",dateStyle:"medium"}):"সংবাদ"}</span>
    </div>
  </article>;
}
