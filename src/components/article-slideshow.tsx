"use client";

import {useState} from "react";
import type {StorySlide} from "@/lib/rich-article";
import {safeStoryImageUrl} from "@/lib/rich-article";

export function ArticleSlideshow({slides,allowLocalImages=false}:{slides:StorySlide[];allowLocalImages?:boolean}){
 const [index,setIndex]=useState(0);
 if(slides.length<2)return null;
 const active=slides[index]||slides[0];
 const source=safeStoryImageUrl(active.src)||(allowLocalImages&&/^blob:https?:\/\//.test(active.src)?active.src:null);
 const previous=()=>setIndex(n=>(n+slides.length-1)%slides.length);
 const next=()=>setIndex(n=>(n+1)%slides.length);
 return <div className="bw-story-slider" role="group" aria-roledescription="carousel" aria-label="সংবাদের ছবির স্লাইডশো">
  <div className="bw-story-slider-stage">
   {source&&<img key={source} src={source} alt={active.alt||active.caption||"সংবাদের ছবি"} loading="lazy" decoding="async"/>}
   <div className="bw-story-slider-controls">
    <span className="bw-story-slider-counter" aria-live="polite">{index+1} / {slides.length}</span>
    <button type="button" onClick={previous} aria-label="আগের ছবি" title="আগের ছবি">‹</button>
    <button type="button" onClick={next} aria-label="পরের ছবি" title="পরের ছবি">›</button>
   </div>
   {(active.caption||active.credit)&&<div className="bw-story-slider-caption" aria-live="polite">
    {active.caption}{active.credit&&<span> | ছবি: {active.credit}</span>}
   </div>}
  </div>
  <div className="bw-story-slider-dots" aria-label="স্লাইড নির্বাচন করুন">
   {slides.map((s,i)=><button key={i} type="button"
    aria-label={String(i+1)+" নম্বর ছবি দেখুন"}
    aria-current={i===index?"true":undefined}
    onClick={()=>setIndex(i)}/>)}
  </div>
 </div>;
}
