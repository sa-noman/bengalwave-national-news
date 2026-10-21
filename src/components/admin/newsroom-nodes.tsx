"use client";
import {Node,mergeAttributes} from "@tiptap/core";
import type {CSSProperties} from "react";
import {NodeViewContent,NodeViewWrapper,ReactNodeViewRenderer} from "@tiptap/react";
import type {NodeViewProps} from "@tiptap/react";
import type {NewsPhoto} from "@/lib/newsroom-document";
import {safeStoryImageUrl} from "@/lib/rich-article";

function PhotoView({photo,index,mode,onUpdate,onDelete}:{
 photo:NewsPhoto;index:number;mode:string;onUpdate:(index:number,patch:Partial<NewsPhoto>)=>void;onDelete:(index:number)=>void
}){
 const safe=safeStoryImageUrl(photo.src)||(photo.src.startsWith("blob:")?photo.src:null);
 return <figure className="bw-nr-photo">
  {safe?<img src={safe} alt={photo.alt||"সংবাদের ছবি"} draggable={false}/>:
   <div className="bw-nr-photo-placeholder">ছবি নির্বাচন করা হয়নি</div>}
  <div className="bw-nr-photo-meta" contentEditable={false}>
   <label>ক্যাপশন
    <input value={photo.caption} onChange={e=>onUpdate(index,{caption:e.target.value.slice(0,700)})}
     placeholder="প্রতিটি ছবির ক্যাপশন এখানে লিখুন"/>
   </label>
   <label>ছবির উৎস
    <input value={photo.credit} onChange={e=>onUpdate(index,{credit:e.target.value.slice(0,200)})}
     placeholder="ছবির উৎস / ফটো ক্রেডিট"/>
   </label>
   <label>বিকল্প বর্ণনা
    <input value={photo.alt} onChange={e=>onUpdate(index,{alt:e.target.value.slice(0,300)})}
     placeholder="Alt text"/>
   </label>
   {mode==="slideshow"&&<button type="button" onClick={()=>onDelete(index)} title="এই ছবি সরান">স্লাইড সরান</button>}
  </div>
 </figure>;
}
function NewsMediaView({node,updateAttributes,deleteNode,selected,editor}:NodeViewProps){
 const attrs=node.attrs;
 const photos=(attrs.photos||[]) as NewsPhoto[];
 const mode=String(attrs.mode||"image");
 const update=(index:number,patch:Partial<NewsPhoto>)=>updateAttributes({
  photos:photos.map((p,i)=>i===index?{...p,...patch}:p)
 });
 const remove=(index:number)=>{
  if(photos.length<=2){deleteNode();return;}
  updateAttributes({photos:photos.filter((_,i)=>i!==index)});
 };
 const move=(from:number,to:number)=>{
  if(to<0||to>=photos.length)return;
  const next=[...photos];[next[from],next[to]]=[next[to],next[from]];
  updateAttributes({photos:next});
 };
 return <NodeViewWrapper className={"bw-nr-media bw-nr-mode-"+mode+(selected?" is-selected":"")} data-bw-media-id={attrs.id}>
  <div className="bw-nr-media-head" contentEditable={false}>
   <span data-drag-handle title="টেনে অবস্থান বদলান">⠿</span>
   <strong>{mode==="slideshow"?"ছবির স্লাইডশো":mode==="gallery"?"দুটি পাশাপাশি ছবি":mode==="split"?"ছবি ও লেখা":"সংবাদের ছবি"} · {photos.length}টি</strong>
   <button type="button" onClick={deleteNode} title="পুরো ব্লক ডিলিট করুন">✕ ডিলিট</button>
  </div>
  <div className={"bw-nr-media-grid bw-nr-grid-"+mode} contentEditable={false}>
   {photos.map((p,i)=><div className="bw-nr-slide-editor" key={p.id}>
    <PhotoView photo={p} index={i} mode={mode} onUpdate={update} onDelete={remove}/>
    {mode==="slideshow"&&<div className="bw-nr-slide-reorder">
      <button type="button" disabled={i===0} onClick={()=>move(i,i-1)}>← আগের দিকে</button>
      <span>{i+1} / {photos.length}</span>
      <button type="button" disabled={i===photos.length-1} onClick={()=>move(i,i+1)}>পরের দিকে →</button>
    </div>}
   </div>)}
  </div>
  {mode==="split"&&<label className="bw-nr-split-copy" contentEditable={false}>ছবির পাশের লেখা
   <textarea value={String(attrs.text||"")} onChange={e=>updateAttributes({text:e.target.value.slice(0,10000)})} rows={4}/>
  </label>}
  <div className="bw-nr-media-options" contentEditable={false}>
   {mode==="slideshow"&&<button type="button" onClick={()=>{
    editor.commands.focus();
    window.dispatchEvent(new CustomEvent("bw:nr-add-slide",{detail:{mediaId:attrs.id}}));
   }}>＋ আরও স্লাইড</button>}
   {mode==="image"&&<>
    <label>প্রস্থ
      <select value={attrs.width||"full"} onChange={e=>updateAttributes({width:e.target.value})}>
       <option value="full">পূর্ণ প্রস্থ</option><option value="medium">মাঝারি</option><option value="small">ছোট</option>
      </select>
    </label>
    <label>অবস্থান
      <select value={attrs.align||"center"} onChange={e=>updateAttributes({align:e.target.value})}>
       <option value="left">বামে</option><option value="center">মাঝে</option><option value="right">ডানে</option>
      </select>
    </label>
   </>}
   {mode==="split"&&<label>পাশাপাশি বিন্যাস
    <select value={attrs.layout||"image-left"} onChange={e=>updateAttributes({layout:e.target.value})}>
     <option value="image-left">বামে ছবি</option><option value="image-right">ডানে ছবি</option>
    </select>
   </label>}
  </div>
 </NodeViewWrapper>;
}
function NewsCalloutView({node,updateAttributes,deleteNode}:NodeViewProps){
 const kind=node.attrs.kind==="quote"?"quote":"highlight";
 const accent=String(node.attrs.borderColor||"#0b4838");
 return <NodeViewWrapper className={"bw-nr-callout bw-nr-callout-"+kind}
    style={kind==="quote"?{"--bw-quote-accent":accent} as CSSProperties:{borderLeftColor:accent}}>
  <div className="bw-nr-callout-controls" contentEditable={false}>
   <strong>{kind==="quote"?"বড় উদ্ধৃতি":"হাইলাইট বক্স"}</strong>
   <label>{kind==="quote"?"উদ্ধৃতিচিহ্নের রং":"বাম রেখার রং"}
    <input type="color" value={accent} aria-label={kind==="quote"?"উদ্ধৃতিচিহ্নের রং":"বাম রেখার রং"}
     onChange={e=>updateAttributes({borderColor:e.target.value})}/>
   </label>
   <button type="button" onClick={deleteNode}>✕ ডিলিট</button>
  </div>
  <NodeViewContent as="div" className="bw-nr-callout-content"/>
  {kind==="quote"&&<input contentEditable={false} className="bw-nr-quote-credit" value={node.attrs.credit||""}
   placeholder="উদ্ধৃতিদাতার নাম ও পরিচয়" onChange={e=>updateAttributes({credit:e.target.value.slice(0,200)})}/>}
 </NodeViewWrapper>;
}
export const NewsMediaNode=Node.create({
 name:"newsMedia",group:"block",atom:true,selectable:true,draggable:true,
 addAttributes(){
  return {
   id:{default:""},mode:{default:"image"},photos:{default:[]},text:{default:""},
   width:{default:"full"},align:{default:"center"},layout:{default:"image-left"}
  };
 },
 parseHTML(){return [{tag:"div[data-bw-news-media]"}];},
 renderHTML({HTMLAttributes}){return ["div",mergeAttributes(HTMLAttributes,{"data-bw-news-media":""})];},
 addNodeView(){return ReactNodeViewRenderer(NewsMediaView);}
});
export const NewsCalloutNode=Node.create({
 name:"newsCallout",group:"block",content:"paragraph+",defining:true,draggable:true,
 addAttributes(){return {
  kind:{default:"highlight"},borderColor:{default:"#0b4838"},credit:{default:""}
 };},
 parseHTML(){return [{tag:"aside[data-bw-callout]"}];},
 renderHTML({HTMLAttributes}){return ["aside",mergeAttributes(HTMLAttributes,{"data-bw-callout":""}),0];},
 addNodeView(){return ReactNodeViewRenderer(NewsCalloutView);}
});
