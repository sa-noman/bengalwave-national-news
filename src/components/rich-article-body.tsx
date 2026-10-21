import React from "react";
import {legacyStoryBlocks,parseRichBody,safeStoryImageUrl} from "@/lib/rich-article";
import type {StoryBlock} from "@/lib/rich-article";
import {ArticleSlideshow} from "@/components/article-slideshow";
import {isNewsroomBody} from "@/lib/newsroom-document";
import {NewsroomArticleBody} from "@/components/newsroom-article-body";

function renderInline(value:string):React.ReactNode{
 // Limited font-size markup emitted by the authenticated editor.
 const fontPattern=/\[\[fs:(14|16|18|20|22|24|28|32)\]\]([\s\S]*?)\[\[\/fs\]\]/g;
 const nodes:React.ReactNode[]=[];
 let offset=0,match:RegExpExecArray|null;
 while((match=fontPattern.exec(value))!==null){
  if(match.index>offset)nodes.push(...renderSimpleInline(value.slice(offset,match.index)));
  nodes.push(<span key={"size-"+match.index} style={{fontSize:Number(match[1])+"px"}}>{renderSimpleInline(match[2])}</span>);
  offset=match.index+match[0].length;
 }
 if(offset<value.length)nodes.push(...renderSimpleInline(value.slice(offset)));
 return nodes.length?nodes:renderSimpleInline(value);
}
function renderSimpleInline(value:string):React.ReactNode[]{
 const token=/(\*\*\*[^*\n]{1,400}\*\*\*|\*\*[^*\n]{1,400}\*\*|\*[^*\n]{1,400}\*|\[[^\]\n]{1,150}\]\(https:\/\/[^\s)]{1,1200}\))/g;
 return value.split(token).map((part,i)=>{
  if(part.startsWith("***")&&part.endsWith("***"))return <strong key={i}><em>{part.slice(3,-3)}</em></strong>;
  if(part.startsWith("**")&&part.endsWith("**"))return <strong key={i}>{part.slice(2,-2)}</strong>;
  if(part.startsWith("*")&&part.endsWith("*"))return <em key={i}>{part.slice(1,-1)}</em>;
  const match=/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/.exec(part);
  if(match)return <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer nofollow">{match[1]}</a>;
  return part.split("\n").map((line,j)=><React.Fragment key={String(i)+"-"+j}>{j>0&&<br/>}{line}</React.Fragment>);
 });
}
function ImageUnit({src,alt,caption,credit,allowLocalImages=false}:{src:string;alt:string;caption:string;credit?:string;allowLocalImages?:boolean}){
 const source=safeStoryImageUrl(src)||(allowLocalImages&&/^blob:https?:\/\//.test(src)?src:null);
 if(!source)return null;
 return <figure className="bw-rich-figure">
  {/* Using a browser image keeps external and uploaded editorial images supported
      without granting Next.js server image optimization access to arbitrary hosts. */}
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img src={source} alt={alt||caption||"প্রতিবেদনের ছবি"} loading="lazy" decoding="async"/>
  {(caption||credit)&&<figcaption>{caption}{credit&&<span>{caption?" · ":""}ছবি: {credit}</span>}</figcaption>}
 </figure>;
}
function RichBlock({block,allowLocalImages=false}: {block:StoryBlock;allowLocalImages?:boolean}){
 const b=block;
 if(b.type==="divider")return <hr className="bw-rich-divider"/>;
 if(b.type==="heading")return <h2 className="bw-rich-heading">{renderInline(b.text)}</h2>;
 if(b.type==="subheading")return <h3 className="bw-rich-subheading">{renderInline(b.text)}</h3>;
 if(b.type==="quote")return <blockquote className="bw-rich-quote"><p>{renderInline(b.text)}</p>{b.credit&&<cite>{b.credit}</cite>}</blockquote>;
 if(b.type==="callout")return <aside className={"bw-rich-callout bw-rich-tone-"+b.tone} style={b.borderColor?{borderLeftColor:b.borderColor}:undefined}><p>{renderInline(b.text)}</p></aside>;
 if(b.type==="slideshow")return <ArticleSlideshow slides={b.slides||[]} allowLocalImages={allowLocalImages}/>;
 if(b.type==="list")return <ul className="bw-rich-list">{b.text.split("\n").filter(s=>s.trim()).map((item,i)=><li key={i}>{renderInline(item.replace(/^\s*[-•]\s*/,""))}</li>)}</ul>;
 if(b.type==="image")return <div className={"bw-rich-image bw-rich-width-"+b.width+" bw-rich-align-"+b.align}>
   <ImageUnit src={b.src} alt={b.alt} caption={b.caption} credit={b.credit} allowLocalImages={allowLocalImages}/>
  </div>;
 if(b.type==="split")return <div className={"bw-rich-split bw-rich-"+b.layout}>
   <ImageUnit src={b.src} alt={b.alt} caption={b.caption} credit={b.credit} allowLocalImages={allowLocalImages}/>
   <div className="bw-rich-split-copy">{b.text.split(/\n\s*\n/).filter(Boolean).map((p,i)=><p key={i}>{renderInline(p)}</p>)}</div>
  </div>;
 if(b.type==="gallery")return <div className="bw-rich-gallery">
   <ImageUnit src={b.src} alt={b.alt} caption={b.caption} credit={b.credit} allowLocalImages={allowLocalImages}/>
   <ImageUnit src={b.src2} alt={b.alt2} caption={b.caption2} allowLocalImages={allowLocalImages}/>
  </div>;
 return <p>{renderInline(b.text)}</p>;
}

export function RichArticleBody({body,allowLocalImages=false}:{body:string;allowLocalImages?:boolean}){
 if(isNewsroomBody(body))return <NewsroomArticleBody body={body} allowLocalImages={allowLocalImages}/>;
 const blocks=parseRichBody(body)||legacyStoryBlocks(body);
 return <div className="bw-article-body bw-rich-article-body">{blocks.map((block,i)=><RichBlock key={block.id+"-"+i} block={block} allowLocalImages={allowLocalImages}/>)}</div>;
}
