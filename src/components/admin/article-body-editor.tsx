"use client";

import {useState} from "react";
import {createStoryBlock,legacyStoryBlocks,parseRichBody,serializeRichBody} from "@/lib/rich-article";
import type {StoryBlock,StoryBlockType} from "@/lib/rich-article";
import {RichArticleBody} from "@/components/rich-article-body";

const options:{type:StoryBlockType;label:string}[]=[
 {type:"paragraph",label:"অনুচ্ছেদ"},
 {type:"heading",label:"শিরোনাম"},
 {type:"subheading",label:"উপশিরোনাম"},
 {type:"image",label:"ছবি ও ক্যাপশন"},
 {type:"split",label:"পাশাপাশি ছবি ও লেখা"},
 {type:"gallery",label:"পাশাপাশি দুই ছবি"},
 {type:"quote",label:"বড় উদ্ধৃতি"},
 {type:"callout",label:"হাইলাইট বক্স"},
 {type:"list",label:"তালিকা"},
 {type:"divider",label:"বিভাজক রেখা"},
];
const needsText=(type:StoryBlockType)=>!["image","gallery","divider"].includes(type);
const needsImage=(type:StoryBlockType)=>["image","split","gallery"].includes(type);
function BlockImageFields({block,update,second=false}:{
 block:StoryBlock;update:(key:keyof StoryBlock,value:string)=>void;second?:boolean
}){
 const srcKey=second?"src2":"src",altKey=second?"alt2":"alt",captionKey=second?"caption2":"caption";
 const fieldName="inline_image_"+block.id+(second?"_second":"");
 const [name,setName]=useState("");
 return <div className="bw-block-image-fields">
   <label>ছবি নির্বাচন করুন (JPG, PNG, WebP, AVIF; সর্বোচ্চ ৪ MB)
    <input type="file" name={fieldName} accept="image/jpeg,image/png,image/webp,image/avif,.avif"
     onChange={event=>{
       const file=event.currentTarget.files?.[0];
       event.currentTarget.setCustomValidity("");
       if(file&&(!["image/jpeg","image/png","image/webp","image/avif"].includes(file.type)||file.size>4*1024*1024)){
         event.currentTarget.setCustomValidity("JPG, PNG, WebP বা AVIF দিন। সর্বোচ্চ ৪ MB।");
         event.currentTarget.reportValidity();setName("");return;
       }
       setName(file?.name||"");
     }}/>
   </label>
   {name&&<small className="bw-rich-upload-status">সংরক্ষণ করলে ছবিটি নিরাপদ মিডিয়া স্টোরেজে আপলোড হবে: {name}</small>}
   <label>অথবা ছবির HTTPS URL
    <input type="url" value={block[srcKey]} onChange={e=>update(srcKey,e.target.value)}
      placeholder="https://example.com/photo.jpg"/>
   </label>
   {block[srcKey]&&/^https:\/\//.test(block[srcKey])&&
     <img className="bw-rich-editor-thumb" alt="ছবির প্রিভিউ" src={block[srcKey]}/>}
   <label>ছবির বিকল্প বর্ণনা (Alt)
    <input value={block[altKey]} onChange={e=>update(altKey,e.target.value)} maxLength={300}/>
   </label>
   <label>ক্যাপশন
    <input value={block[captionKey]} onChange={e=>update(captionKey,e.target.value)} maxLength={700}/>
   </label>
   {!second&&<label>ছবির উৎস / ফটো ক্রেডিট
    <input value={block.credit} onChange={e=>update("credit",e.target.value)} maxLength={200}/>
   </label>}
 </div>;
}
export function ArticleBodyEditor({initialBody=""}:{initialBody?:string}){
 const [blocks,setBlocks]=useState<StoryBlock[]>(()=>{
  const known=parseRichBody(initialBody);
  return known|| (initialBody.trim()?legacyStoryBlocks(initialBody):[createStoryBlock("paragraph","initial-block-001")]);
 });
 const [insertType,setInsertType]=useState<StoryBlockType>("paragraph");
 const [showPreview,setShowPreview]=useState(false);
 const update=(id:string,patch:Partial<StoryBlock>)=>setBlocks(old=>old.map(b=>b.id===id?{...b,...patch}:b));
 const add=(type:StoryBlockType,after?:number)=>setBlocks(old=>{
  if(old.length>=100)return old;
  const block=createStoryBlock(type,crypto.randomUUID());
  const next=[...old];next.splice(after===undefined?next.length:after+1,0,block);return next;
 });
 const remove=(id:string)=>setBlocks(old=>old.filter(b=>b.id!==id));
 const shift=(index:number,by:number)=>setBlocks(old=>{
  const j=index+by;if(j<0||j>=old.length)return old;
  const next=[...old];[next[index],next[j]]=[next[j],next[index]];return next;
 });
 const format=(id:string,marker:string)=>{
  const area=document.getElementById("rich-text-"+id) as HTMLTextAreaElement|null;
  const block=blocks.find(b=>b.id===id);if(!area||!block)return;
  const start=area.selectionStart,end=area.selectionEnd;
  const selected=block.text.slice(start,end)||"লেখা";
  const wrapped=marker==="link"?"["+selected+"](https://example.com)":marker+selected+marker;
  update(id,{text:block.text.slice(0,start)+wrapped+block.text.slice(end)});
  requestAnimationFrame(()=>{area.focus();area.setSelectionRange(start,start+wrapped.length);});
 };
 const totalImages=blocks.filter(b=>needsImage(b.type)).reduce((n,b)=>n+(b.type==="gallery"?2:1),0);
 return <section className="bw-rich-editor full-span" aria-label="সংবাদের বিস্তারিত কনটেন্ট সম্পাদক">
   <div className="bw-rich-editor-top">
     <div><h2>বিস্তারিত সংবাদ সাজান</h2><p>লেখার মাঝে যত প্রয়োজন ছবি, উদ্ধৃতি ও হাইলাইট ব্লক বসান। নিচের বাটন থেকে ছবি যোগ করুন এবং ↑ ↓ দিয়ে সাজান।</p></div>
     <span className="bw-rich-editor-counter">{blocks.length} ব্লক · {totalImages} ছবি</span>
   </div>
   <input type="hidden" name="body" value={serializeRichBody(blocks)} readOnly/>
   <div className="bw-rich-quick-add" aria-label="ছবি ও অন্যান্য কনটেন্ট যোগ করুন">
     <button className="admin-secondary" type="button" onClick={()=>add("image")}>＋ ছবি যোগ করুন</button>
     <button className="admin-secondary" type="button" onClick={()=>add("split")}>＋ ছবি ও লেখা</button>
     <button className="admin-secondary" type="button" onClick={()=>add("gallery")}>＋ পাশাপাশি ২ ছবি</button>
     <button className="admin-secondary" type="button" onClick={()=>add("paragraph")}>＋ অনুচ্ছেদ</button>
   </div>
   <div className="bw-rich-editor-blocks">
    {blocks.map((b,index)=><div className="bw-rich-editor-block" key={b.id}>
      <div className="bw-rich-editor-block-head">
       <strong>{index+1}. {options.find(o=>o.type===b.type)?.label}</strong>
       <div className="bw-rich-editor-actions">
        <button type="button" onClick={()=>shift(index,-1)} disabled={index===0} title="ওপরে নিন">↑</button>
        <button type="button" onClick={()=>shift(index,1)} disabled={index===blocks.length-1} title="নিচে নিন">↓</button>
        <button type="button" onClick={()=>add("paragraph",index)} disabled={blocks.length>=100} title="নিচে অনুচ্ছেদ যোগ করুন">＋</button>
        <button type="button" onClick={()=>add("image",index)} disabled={blocks.length>=100} title="এই ব্লকের নিচে ছবি যোগ করুন" aria-label="নিচে ছবি যোগ করুন">＋<span aria-hidden="true">▧</span></button>
        <button type="button" onClick={()=>remove(b.id)} title="এই ব্লক বাদ দিন" aria-label="ব্লক মুছুন">✕</button>
       </div>
      </div>
      <div className="bw-rich-editor-block-content">
       <label>ব্লকের ধরন
        <select value={b.type} onChange={e=>update(b.id,{type:e.target.value as StoryBlockType})}>
         {options.map(o=><option key={o.type} value={o.type}>{o.label}</option>)}
        </select>
       </label>
       {needsText(b.type)&&<>
        <label>{b.type==="split"?"ছবির পাশের লেখা":b.type==="list"?"তালিকা (প্রতি লাইনে একটি)":b.type==="quote"?"উদ্ধৃতি":b.type==="callout"?"হাইলাইটের লেখা":"লেখা"}
         <textarea id={"rich-text-"+b.id} rows={b.type==="paragraph"||b.type==="split"?5:3}
          value={b.text} onChange={e=>update(b.id,{text:e.target.value})}
          placeholder={b.type==="paragraph"?"প্রতিবেদনের অনুচ্ছেদ লিখুন…":"এখানে লিখুন…"} maxLength={10000}/>
        </label>
        <div className="bw-rich-format-tools" aria-label="লেখার ফরম্যাটিং">
         <button type="button" onClick={()=>format(b.id,"**")} title="নির্বাচিত লেখা বোল্ড"><strong>B</strong></button>
         <button type="button" onClick={()=>format(b.id,"*")} title="নির্বাচিত লেখা ইটালিক"><em>I</em></button>
         <button type="button" onClick={()=>format(b.id,"link")} title="নির্বাচিত লেখায় HTTPS লিংক দিন">লিংক</button>
        </div>
       </>}
       {b.type==="quote"&&<label>উদ্ধৃতির ব্যক্তি / সূত্র<input value={b.credit} onChange={e=>update(b.id,{credit:e.target.value})} maxLength={200}/></label>}
       {b.type==="callout"&&<label>হাইলাইটের রং
        <select value={b.tone} onChange={e=>update(b.id,{tone:e.target.value as StoryBlock["tone"]})}>
          <option value="cream">হালকা হলুদ</option><option value="gray">হালকা ধূসর</option><option value="red">লাল বর্ডার</option>
        </select>
       </label>}
       {needsImage(b.type)&&<>
         <BlockImageFields block={b} update={(key,value)=>update(b.id,{[key]:value})}/>
         {b.type==="gallery"&&<><h3>দ্বিতীয় ছবি</h3><BlockImageFields block={b} second update={(key,value)=>update(b.id,{[key]:value})}/></>}
         {b.type==="image"&&<div className="bw-rich-editor-controls">
           <label>ছবির প্রস্থ
            <select value={b.width} onChange={e=>update(b.id,{width:e.target.value as StoryBlock["width"]})}>
             <option value="full">সম্পূর্ণ প্রস্থ</option><option value="medium">মাঝারি</option><option value="small">ছোট</option>
            </select>
           </label>
           <label>ছবির অবস্থান
            <select value={b.align} onChange={e=>update(b.id,{align:e.target.value as StoryBlock["align"]})}>
             <option value="center">মাঝে</option><option value="left">বামে</option><option value="right">ডানে</option>
            </select>
           </label>
          </div>}
         {b.type==="split"&&<label>পাশাপাশি অবস্থান
           <select value={b.layout} onChange={e=>update(b.id,{layout:e.target.value as StoryBlock["layout"]})}>
            <option value="image-left">বামে ছবি, ডানে লেখা</option>
            <option value="image-right">ডানে ছবি, বামে লেখা</option>
           </select>
          </label>}
       </>}
      </div>
    </div>)}
   </div>
   <div className="bw-rich-editor-add">
     <label>নতুন ব্লক যোগ করুন
      <select value={insertType} onChange={e=>setInsertType(e.target.value as StoryBlockType)}>
       {options.map(o=><option key={o.type} value={o.type}>{o.label}</option>)}
      </select>
     </label>
     <button type="button" className="admin-secondary" onClick={()=>add(insertType)} disabled={blocks.length>=100}>＋ ব্লক যোগ করুন</button>
   </div>
   <button type="button" className="bw-rich-preview-toggle" aria-expanded={showPreview} onClick={()=>setShowPreview(v=>!v)}>{showPreview?"প্রিভিউ বন্ধ করুন":"লেআউটের তাৎক্ষণিক প্রিভিউ দেখুন"}</button>
   {showPreview&&<div className="bw-rich-editor-live-preview bw-article"><p className="bw-rich-editor-preview-hint">সম্পাদনার প্রিভিউ। নতুন আপলোডের ছবিগুলো সংরক্ষণের পর পূর্ণরূপে দেখা যাবে।</p><RichArticleBody body={serializeRichBody(blocks)}/></div>}
   <p className="bw-rich-editor-help">ছবি ব্লকের মধ্যে ‘ছবি নির্বাচন করুন’ থেকে ছবি আপলোড করুন। আরও ছবি দিতে আবার ‘＋ ছবি যোগ করুন’ চাপুন, অথবা একসঙ্গে দুটি পাশাপাশি ছবির জন্য ‘＋ পাশাপাশি ২ ছবি’ ব্যবহার করুন। প্রতিটি ছবির ক্যাপশন আলাদাভাবে লিখতে পারবেন। একবারে সর্বোচ্চ ৬টি নতুন ছবি আপলোড করা যাবে।</p>
  </section>;
}
