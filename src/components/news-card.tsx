import Link from "next/link";
import type {NewsItem} from "@/lib/demo-news";

export function NewsCard({item,compact=false,hero=false}:{
  item:NewsItem;compact?:boolean;hero?:boolean;
}){
  return <article className={"news-card"+(compact?" compact":"")+(hero?" hero-card":"")}>
    <Link className="news-image-link" href={"/news/"+item.slug} aria-label={item.title}>
      <img className="news-image" src={item.image} alt="" loading={hero?"eager":"lazy"}/>
    </Link>
    <div className="news-copy">
      <span className="category">{item.category}</span>
      <h3 className={hero?"hero-title":"story-title"}>
        <Link className="headline-link" href={"/news/"+item.slug}>{item.title}</Link>
      </h3>
      {!compact && <p className="summary">{item.summary}</p>}
      <span className="news-meta">{item.publishedAt?
        new Date(item.publishedAt).toLocaleDateString("bn-BD",{timeZone:"Asia/Dhaka",dateStyle:"medium"}):
        "সংবাদ"}</span>
    </div>
  </article>;
}
