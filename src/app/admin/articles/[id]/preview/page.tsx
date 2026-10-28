import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {requireStaff} from "@/lib/auth/require-staff";
import {publicNewsImageUrl} from "@/lib/news-media-paths";
import {NewsImage} from "@/components/news-image";
import {RichArticleBody} from "@/components/rich-article-body";
import {ArticleSource} from "@/components/article-source";
import {ArticleShareBar} from "@/components/article-share-bar";

// This page is an authenticated editorial preview in BOTH Preview and Production; NEVER a public article.
// Publishing is an explicit separate action on the edit form.
export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:"সংবাদের ব্যক্তিগত প্রিভিউ",
  robots:{index:false,follow:false},
};

const categoryFallbacks:Record<string,string>={
  national:"/illustrations/river.svg",
  international:"/illustrations/world.svg",
  politics:"/illustrations/city.svg",
  economy:"/illustrations/economy.svg",
  technology:"/illustrations/city.svg",
  culture:"/illustrations/heritage.svg",
  features:"/illustrations/heritage.svg",
  sports:"/illustrations/world.svg",
  entertainment:"/illustrations/heritage.svg",
};
type Category={slug:string;label_bn:string};

export default async function PreviewArticle({params}:{
  params:Promise<{id:string}>;
}){
  const {supabase}=await requireStaff();
  const {id}=await params;
  if(!/^[a-f\d-]{36}$/i.test(id))notFound();

  const {data:item,error}=await supabase.from("articles")
    .select("id,slug,headline,summary,body,status,published_at,hero_media_id,source_name,source_url,categories(slug,label_bn)")
    .eq("id",id).maybeSingle();
  if(error||!item)notFound();

  let fullImage:string|null=null;
  let altText=item.headline;
  let caption="";
  if(item.hero_media_id){
    const {data:media}=await supabase.from("media_assets")
      .select("storage_path,alt_text,caption,credit")
      .eq("id",item.hero_media_id).maybeSingle();
    if(media){
      fullImage=publicNewsImageUrl(supabase,media.storage_path,"full");
      altText=media.alt_text||item.headline;
      caption=[media.caption,media.credit?"ছবি: "+media.credit:null]
        .filter(Boolean).join(" · ");
    }
  }

  const categoryRaw=item.categories as unknown as Category|Category[]|null;
  const category=Array.isArray(categoryRaw)?categoryRaw[0]:categoryRaw;
  const picture=fullImage||categoryFallbacks[category?.slug||""]||"/illustrations/river.svg";
  const editorHref="/admin/articles/"+item.id+"/edit";

  return <main className="bw-website">
    <div className="bw-wrap bw-editorial-preview-banner" role="status">
      <div>
        <strong>সম্পাদকীয় প্রিভিউ · লাইভ নয়</strong>
        <p>সংবাদের বর্তমান অবস্থা: <b>{item.status}</b>। এটি শুধু অনুমোদিত সম্পাদকীয় লগইনে দেখা যায়।
          এখানে দেখানো মানেই ওয়েবসাইটে প্রকাশিত নয়।</p>
      </div>
      <Link href={editorHref}>← সম্পাদনায় ফিরুন</Link>
    </div>
    <div className="bw-wrap bw-article">
      <article>
        <span className="bw-tag">{category?.label_bn||"সংবাদ"}</span>
        <h1>{item.headline}</h1>
        {item.summary&&<p className="bw-article-deck">{item.summary}</p>}
        <div className="bw-article-byline">Bengal Wave · শুধুমাত্র সম্পাদকীয় প্রিভিউ</div>
        <figure>
          <div className="bw-img-frame bw-article-image-frame">
            <NewsImage
              src={picture}
              alt={altText}
              eager
              quality={90}
              sizes="(max-width: 600px) 100vw, (max-width: 940px) 95vw, 940px"
            />
          </div>
          {caption&&<figcaption>{caption}</figcaption>}
        </figure>
        <RichArticleBody body={item.body}/>
        <ArticleSource sourceName={item.source_name} sourceUrl={item.source_url}/>
        <ArticleShareBar url={"https://bengalwave.news/news/"+item.slug} title={item.headline} preview/>
      </article>
      <Link href={editorHref} className="bw-article-back">← সংবাদ সম্পাদনায় ফিরুন</Link>
    </div>
  </main>;
}
