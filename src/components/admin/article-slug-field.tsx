"use client";

import {useState} from "react";
import {generateSeoSlug} from "@/app/admin/seo-summary-action";

export function ArticleSlugField({initialSlug="",articleId,status}:{
 initialSlug?:string;articleId?:string;status?:string;
}){
 const [value,setValue]=useState(initialSlug);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const generate=async()=>{
  const form=document.getElementById("bw-article-slug")?.closest("form");
  const headline=(form?.elements.namedItem("headline") as HTMLInputElement|null)?.value.trim()||"";
  if(headline.length<5){setMessage("প্রথমে সংবাদের শিরোনাম লিখুন।");return;}
  setBusy(true);setMessage("AI দিয়ে URL Slug তৈরি হচ্ছে…");
  try{
   const result=await generateSeoSlug(headline,articleId);
   if(result.ok){setValue(result.slug);setMessage("AI Slug তৈরি হয়েছে। সংরক্ষণের আগে যাচাই করুন।");}
   else{
    const issues:Record<string,string>={
     missing_key:"বিদ্যমান Gemini API Key পাওয়া যায়নি।",
     auth:"Gemini API Key-এর অনুমতি পরীক্ষা করুন।",
     quota:"Gemini API-এর ব্যবহারসীমা শেষ।",
     model:"কনফিগার করা Gemini Model পাওয়া যাচ্ছে না।",
     invalid:"শিরোনাম সঠিক নয়।",
     network:"AI সার্ভারে সংযোগ হয়নি। আবার চেষ্টা করুন।",
     blocked:"AI কোনো বৈধ ইংরেজি Slug দিতে পারেনি।",
     provider:"AI বা Database যাচাইয়ে সমস্যা হয়েছে।"
    };
    setMessage(issues[result.reason]||"Slug তৈরি করা যায়নি।");
   }
  }catch{setMessage("AI সেবায় সমস্যা হয়েছে। আবার চেষ্টা করুন।");}
  finally{setBusy(false);}
 };
 return <div className="bw-ai-slug-field">
  <div className="bw-ai-slug-heading">
   <label htmlFor="bw-article-slug">URL Slug (ইংরেজি ছোট হাতের অক্ষর) <span className="required">*</span></label>
   <button type="button" className="bw-seo-generate" disabled={busy} onClick={()=>void generate()}>
    {busy?"তৈরি হচ্ছে…":"✦ AI দিয়ে তৈরি"}
   </button>
  </div>
  <input id="bw-article-slug" name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*"
   maxLength={150} value={value} onChange={e=>{setValue(e.target.value);setMessage("");}}
   placeholder="bangladesh-japan-economic-agreement"/>
  {status==="published"&&<small>প্রকাশিত সংবাদে Slug পরিবর্তন করলে পুরোনো লিংক নষ্ট হতে পারে।</small>}
  {message&&<small role="status" className="bw-ai-slug-status">{message}</small>}
 </div>;
}
