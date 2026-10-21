import Link from "next/link";
import {NewsImage} from "./news-image";
import type {NewsItem} from "@/lib/demo-news";
import {formatNewsCardDate,formatFullNewsDate} from "@/lib/news-date";

export type CardVariant="regular"|"lead"|"middle"|"text"|"latest"|"feature";
export function NewsCard({item,compact=false,hero=false,variant,hideCategory=false}:{
  item:NewsItem;compact?:boolean;hero?:boolean;variant?:CardVariant;hideCategory?:boolean;
}){
  const kind=variant||(hero?"lead":compact?"text":"regular");
  const href="/news/"+item.slug;
  const imageSizes=kind==="latest"?"84px":kind==="lead"?"(max-width: 760px) 100vw, (max-width: 1000px) 50vw, 45vw":kind==="middle"?"(max-width: 760px) 100vw, (max-width: 1000px) 50vw, 32vw":kind==="feature"?"(max-width: 760px) 100vw, 45vw":"(max-width: 760px) 72vw, (max-width: 1000px) 50vw, 25vw";
  const time=item.isDemo?"নমুনা প্রতিবেদন · প্রকাশিত নয়":formatNewsCardDate(item.publishedAt);
  return <article className={"bw-card bw-card-"+kind}>
   <Link href={href} className="bw-card-link" aria-label={item.title}>
    {kind!=="text"&&<span className="bw-img-frame">
      <NewsImage key={item.image} src={kind==="lead"?(item.fullImage||item.image):item.image} alt={item.imageAlt||item.title} eager={kind==="lead"} quality={kind==="lead"?84:78} sizes={imageSizes}/>
    </span>}
    <span className="bw-card-copy">
      {!hideCategory&&<span className="bw-tag">{item.category}</span>}
      <h3 className="bw-card-title"><span className="bw-title-underline">{item.title}</span></h3>
      {["lead","middle","feature","text"].includes(kind)&&item.summary&&<span className="bw-card-summary">{item.summary}</span>}
      {kind!=="latest"&&<span className="bw-card-meta">{item.publishedAt&&!item.isDemo?
        <time dateTime={item.publishedAt} title={formatFullNewsDate(item.publishedAt)}>{time}</time>:time}</span>}
    </span>
   </Link>
  </article>;
}
