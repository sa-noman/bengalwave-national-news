import React from "react";
import {parseNewsroomBody} from "@/lib/newsroom-document";
import type {NewsJSON,NewsPhoto} from "@/lib/newsroom-document";
import {safeStoryImageUrl} from "@/lib/rich-article";
import {ArticleSlideshow} from "@/components/article-slideshow";

function mediaImage(photo:NewsPhoto,preview:boolean){
 const src=safeStoryImageUrl(photo.src)||(preview&&/^blob:https?:\/\//.test(photo.src)?photo.src:null);
 if(!src)return null;
 return <figure className="bw-rich-figure" key={photo.id}>
  <img src={src} alt={photo.alt||photo.caption||"সংবাদের ছবি"} loading="lazy" decoding="async"/>
  {(photo.caption||photo.credit)&&<figcaption>{photo.caption}{photo.credit&&<span> · ছবি: {photo.credit}</span>}</figcaption>}
 </figure>;
}
function draw(node:NewsJSON,key:number|string,preview:boolean):React.ReactNode{
 const a=node.attrs||{},inner=(node.content||[]).map((child,i)=>draw(child,i,preview));
 if(node.type==="text"){
  let content:React.ReactNode=node.text||"";
  for(const mark of node.marks||[]){
   if(mark.type==="bold")content=<strong>{content}</strong>;
   if(mark.type==="italic")content=<em>{content}</em>;
   if(mark.type==="underline")content=<u>{content}</u>;
   if(mark.type==="strike")content=<s>{content}</s>;
   if(mark.type==="textStyle"){
    const size=String(mark.attrs?.fontSize||"");
    const color=String(mark.attrs?.color||"");
    content=<span style={{
     fontSize:/^(1[2-9]|2[0-8]|3[02])px$/.test(size)?size:undefined,
     color:/^#[0-9a-fA-F]{6}$/.test(color)?color:undefined
    }}>{content}</span>;
   }
   if(mark.type==="link"){
    const href=safeStoryImageUrl(String(mark.attrs?.href||""));
    if(href)content=<a href={href} target="_blank" rel="noopener noreferrer nofollow">{content}</a>;
   }
  }
  return <React.Fragment key={key}>{content}</React.Fragment>;
 }
 if(node.type==="paragraph")return <p key={key}>{inner}</p>;
 if(node.type==="heading")return Number(a.level)===3?<h3 key={key} className="bw-rich-subheading">{inner}</h3>:<h2 key={key} className="bw-rich-heading">{inner}</h2>;
 if(node.type==="hardBreak")return <br key={key}/>;
 if(node.type==="horizontalRule")return <hr className="bw-rich-divider" key={key}/>;
 if(node.type==="bulletList")return <ul key={key} className="bw-rich-list">{inner}</ul>;
 if(node.type==="orderedList")return <ol key={key} className="bw-rich-list">{inner}</ol>;
 if(node.type==="listItem")return <li key={key}>{inner}</li>;
 if(node.type==="blockquote")return <blockquote key={key} className="bw-rich-quote">{inner}</blockquote>;
 if(node.type==="newsCallout"){
  const kind=a.kind==="quote"?"quote":"highlight";
  const color=String(a.borderColor||"#0b4838");
  const border=/^#[0-9a-fA-F]{6}$/.test(color)?color:"#0b4838";
  return kind==="quote"
   ?<blockquote className="bw-rich-quote" key={key}>{inner}{typeof a.credit==="string"&&a.credit.length>0&&<cite>{a.credit}</cite>}</blockquote>
   :<aside className="bw-rich-callout bw-rich-tone-cream" style={{borderLeftColor:border}} key={key}>{inner}</aside>;
 }
 if(node.type==="newsMedia"){
  const photos=(a.photos||[]) as NewsPhoto[];
  const mode=String(a.mode||"image");
  if(mode==="slideshow")return <ArticleSlideshow slides={photos} allowLocalImages={preview} key={key}/>;
  if(mode==="gallery")return <div className="bw-rich-gallery" key={key}>{photos.map(p=>mediaImage(p,preview))}</div>;
  if(mode==="split")return <div className={"bw-rich-split bw-rich-"+String(a.layout)} key={key}>
    {photos[0]&&mediaImage(photos[0],preview)}
    <div className="bw-rich-split-copy"><p>{String(a.text||"")}</p></div>
   </div>;
  return <div className={"bw-rich-image bw-rich-width-"+String(a.width||"full")+" bw-rich-align-"+String(a.align||"center")} key={key}>
   {photos[0]&&mediaImage(photos[0],preview)}
  </div>;
 }
 return <React.Fragment key={key}>{inner}</React.Fragment>;
}
export function NewsroomArticleBody({body,allowLocalImages=false}:{body:string;allowLocalImages?:boolean}){
 const doc=parseNewsroomBody(body);
 if(!doc)return null;
 return <div className="bw-article-body bw-rich-article-body bw-newsroom-published-body">
  {(doc.content||[]).map((child,i)=>draw(child,i,allowLocalImages))}
 </div>;
}
