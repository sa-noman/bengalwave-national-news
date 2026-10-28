"use client";

import {useEffect,useState} from "react";
import type {StorySlide} from "@/lib/rich-article";
import {safeStoryImageUrl} from "@/lib/rich-article";
import {getPhotoCaptionParts} from "@/components/photo-caption";

const TRANSITION_MS=520;

export function ArticleSlideshow({slides,allowLocalImages=false}:{slides:StorySlide[];allowLocalImages?:boolean}){
 const [index,setIndex]=useState(0);
 const [outgoing,setOutgoing]=useState<number|null>(null);
 const [direction,setDirection]=useState<"forward"|"backward">("forward");
 useEffect(()=>{
  if(outgoing===null)return;
  const timer=window.setTimeout(()=>setOutgoing(null),TRANSITION_MS+30);
  return ()=>window.clearTimeout(timer);
 },[index,outgoing]);
 if(slides.length<2)return null;
 const active=slides[index]||slides[0];
 const activeCaption=getPhotoCaptionParts(active.caption,active.credit);
 const go=(nextIndex:number,move:"forward"|"backward")=>{
  const target=(nextIndex+slides.length)%slides.length;
  if(target===index)return;
  setDirection(move);setOutgoing(index);setIndex(target);
 };
 const previous=()=>go(index-1,"backward");
 const next=()=>go(index+1,"forward");
 const layer=(slideIndex:number,leaving=false)=>{
  const slide=slides[slideIndex];
  if(!slide)return null;
  const source=safeStoryImageUrl(slide.src)||(allowLocalImages&&/^blob:https?:\/\//.test(slide.src)?slide.src:null);
  if(!source)return null;
  return <div key={(leaving?"out-":"in-")+slideIndex} className={"bw-story-slider-layer "+(leaving?"is-leaving":"is-entering")+" bw-slide-"+direction} aria-hidden={leaving?"true":undefined}>
    <div className="bw-story-slider-backdrop" aria-hidden="true"
      style={{backgroundImage:`url(${JSON.stringify(source)})`}}/>
    <img className="bw-story-slider-photo" key={source} src={source}
     alt={leaving?"":slide.alt||slide.caption||"সংবাদের ছবি"} loading={leaving?"lazy":"eager"} decoding="async"/>
   </div>;
 };
 return <div className="bw-story-slider" role="group" aria-roledescription="carousel" aria-label="সংবাদের ছবির স্লাইডশো" onKeyDown={e=>{if(e.key==="ArrowLeft"){e.preventDefault();previous();}else if(e.key==="ArrowRight"){e.preventDefault();next();}}}>
  <div className="bw-story-slider-stage">
   {outgoing!==null&&layer(outgoing,true)}
   {layer(index)}
   <div className="bw-story-slider-controls">
    <span className="bw-story-slider-counter" aria-live="polite" aria-atomic="true">{index+1} / {slides.length}</span>
    <button type="button" onClick={previous} aria-label="আগের ছবি" title="আগের ছবি">‹</button>
    <button type="button" onClick={next} aria-label="পরের ছবি" title="পরের ছবি">›</button>
   </div>
   {(activeCaption.captionText||activeCaption.creditText)&&<div className="bw-story-slider-caption">
    {activeCaption.captionText}{activeCaption.creditText&&<span> | ছবি: {activeCaption.creditText}</span>}
   </div>}
  </div>
  <div className="bw-story-slider-dots" role="group" aria-label="স্লাইড নির্বাচন করুন">
   {slides.map((s,i)=><button key={i} type="button"
    aria-label={String(i+1)+" নম্বর ছবি দেখুন"}
    aria-current={i===index?"true":undefined}
    onClick={()=>go(i,i>index?"forward":"backward")}/>)}
  </div>
 </div>;
}
