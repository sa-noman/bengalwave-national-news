"use client";

import {useEffect,useRef,useState} from "react";
import {generateSeoSummary} from "@/app/admin/seo-summary-action";
import {parseRichBody} from "@/lib/rich-article";

function fallbackSuggestion(title:string,raw:string):string{
 const blocks=parseRichBody(raw);
 const text=(blocks?blocks.map(b=>b.text).filter(Boolean).join(" "):raw)
  .replace(/\[\[\/?fs(?::\d+)?\]\]/g,"").replace(/\*\*/g,"")
  .replace(/\[(.*?)\]\(https:\/\/[^)]+\)/g,"$1").replace(/\s+/g," ").trim();
 if(text.length<30)return title.trim().slice(0,160);
 const first=(text.match(/^.{35,190}?[।!?]/u)||[])[0]||text.slice(0,160);
 const next=first.trim().slice(0,160);
 return next||title.trim().slice(0,160);
}
export function ArticleSummaryField({initialSummary=""}:{initialSummary?:string}){
 const [value,setValue]=useState(initialSummary);
 const [status,setStatus]=useState("");
 const [busy,setBusy]=useState(false);
 const generating=useRef(false);
 const lastSignature=useRef("");
 const touched=useRef(Boolean(initialSummary.trim()));
 const current=useRef(initialSummary);
 current.current=value;
 const generate=async(force=false,bodyOverride?:string)=>{
  const field=document.querySelector<HTMLTextAreaElement>('textarea[name="summary"]');
  const form=field?.closest("form");if(!form||generating.current)return;
  if(!force&&(touched.current||current.current.trim()))return;
  const headline=(form.elements.namedItem("headline") as HTMLInputElement|null)?.value.trim()||"";
  const raw=bodyOverride||(form.elements.namedItem("body") as HTMLInputElement|null)?.value||"";
  const blocks=parseRichBody(raw);
  const len=blocks?blocks.reduce((n,b)=>n+b.text.trim().length,0):raw.trim().length;
  if(headline.length<5||len<60)return;
  const sig=headline+"|"+raw.length+"|"+raw.slice(-130);
  if(!force&&sig===lastSignature.current)return;
  lastSignature.current=sig;
  generating.current=true;setBusy(true);setStatus("AI দিয়ে SEO বিবরণ তৈরি হচ্ছে…");
  try{
   const response=await generateSeoSummary(headline,raw);
   // An editor may have typed while the request was in flight.
   if(!force&&(touched.current||current.current.trim()))return;
   if(response.ok){
    setValue(response.summary);current.current=response.summary;
    setStatus("AI খসড়া প্রস্তুত। তথ্য ও বাক্য যাচাই করে তারপর সংরক্ষণ করুন।");
   }else if(response.reason==="missing_key"){
    const suggestion=fallbackSuggestion(headline,raw);
    if(!current.current.trim()||force){setValue(suggestion);current.current=suggestion;}
    setStatus("AI API কী কনফিগার করা নেই। সংবাদ থেকে প্রাথমিক বিবরণ বসানো হয়েছে (AI দিয়ে তৈরি নয়)। যাচাই করুন।");
   }else{
    if(!current.current.trim()){
     const suggestion=fallbackSuggestion(headline,raw);
     setValue(suggestion);current.current=suggestion;
     setStatus("AI সেবা পাওয়া যায়নি। প্রাথমিক বিবরণ বসানো হয়েছে (AI নয়)। যাচাই করুন।");
    }else setStatus("AI দিয়ে এখন তৈরি করা যায়নি। আবার চেষ্টা করুন।");
   }
  }catch{
   setStatus("AI সেবায় সাময়িক সমস্যা হয়েছে। আবার চেষ্টা করুন।");
  }finally{setBusy(false);generating.current=false;}
 };
 useEffect(()=>{
  const listener=(event:Event)=>{const body=(event as CustomEvent<{body?:string}>).detail?.body;void generate(false,body);};
  window.addEventListener("bw:article-editor-blur",listener);
  return ()=>window.removeEventListener("bw:article-editor-blur",listener);
 // Document change event only; the active inputs are always read at execution time.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 return <div className="bw-seo-summary-field full-span">
  <div className="bw-seo-summary-heading">
   <label htmlFor="bw-seo-summary">সংক্ষিপ্ত বিবরণ (SEO meta description)</label>
   <button type="button" className="bw-seo-generate" disabled={busy}
    onClick={()=>{touched.current=false;setValue("");current.current="";void generate(true);}}>
    {busy?"তৈরি হচ্ছে…":"✦ AI দিয়ে তৈরি / নতুন করে লিখুন"}
   </button>
  </div>
  <textarea id="bw-seo-summary" name="summary" maxLength={700} rows={3}
   value={value} onChange={e=>{setValue(e.target.value);current.current=e.target.value;touched.current=true;setStatus("");}}
   placeholder="শিরোনাম ও সম্পূর্ণ সংবাদ দেওয়ার পর স্বয়ংক্রিয়ভাবে বিবরণ তৈরি হবে। চাইলে নিজে সম্পাদনা করুন।"/>
  <div className="bw-seo-summary-footer">
   <small>SEO-এর জন্য প্রায় ১১০-১৬০ অক্ষর ভালো লক্ষ্য। চূড়ান্ত বিবরণ অবশ্যই যাচাই করুন।</small>
   <small className={value.length>160?"bw-seo-count-long":""}>{value.length} অক্ষর</small>
  </div>
  {status&&<p className="bw-seo-summary-status" role="status">{status}</p>}
 </div>;
}
