"use server";

import {requireStaff} from "@/lib/auth/require-staff";
import {parseRichBody} from "@/lib/rich-article";
import {parseNewsroomBody,textContent} from "@/lib/newsroom-document";

type SeoResult={ok:true;summary:string}|{ok:false;reason:"missing_key"|"invalid"|"provider"|"empty"};
function textFromBody(body:string):string{
 const blocks=parseRichBody(body),doc=parseNewsroomBody(body);
 const text=doc?textContent(doc):blocks ? blocks.map(block=>block.text).filter(Boolean).join("\n") : body;
 return text.replace(/\[\[fs:(?:14|16|18|20|22|24|28|32)\]\]/g,"")
  .replace(/\[\[\/fs\]\]/g,"").replace(/\*\*/g,"").replace(/\[(.*?)\]\(https:\/\/[^)]+\)/g,"$1")
  .replace(/\s+/g," ").trim().slice(0,12000);
}
/** Staff-only, explicit AI draft. Never publish or modify a saved article. */
export async function generateSeoSummary(headline:string,body:string):Promise<SeoResult>{
 await requireStaff();
 if(typeof headline!=="string"||typeof body!=="string"||
  headline.length>300||body.length>80000)return {ok:false,reason:"invalid"};
 const title=headline.trim(),text=textFromBody(body);
 if(title.length<5||text.length<60)return {ok:false,reason:"empty"};
 const apiKey=process.env.Gemini_Seo_Key || process.env.GEMINI_API_KEY;
 if(!apiKey)return {ok:false,reason:"missing_key"};
 try{
  const ctl=new AbortController();
  const timeout=setTimeout(()=>ctl.abort(),18000);
  let response:Response;
  try{
   response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",{
    method:"POST",signal:ctl.signal,cache:"no-store",
    headers:{"Content-Type":"application/json","x-goog-api-key":apiKey},
    body:JSON.stringify({
     contents:[{role:"user",parts:[{text:"শিরোনাম: "+title+"\n\nপ্রতিবেদন: "+text}]}],
     systemInstruction:{parts:[{text:"আপনি Bengal Wave সংবাদ সম্পাদক। শুধু সরবরাহ করা শিরোনাম ও প্রতিবেদনের তথ্য ব্যবহার করে বাংলা ভাষায় একটি তথ্যনিষ্ঠ, সাবলীল SEO meta description লিখুন। একটিমাত্র বাক্য বা প্রয়োজনমতো দুটি ছোট বাক্য, মোট ১১০-১৬০ বাংলা অক্ষরের মধ্যে রাখার চেষ্টা করুন। কোনো নতুন তথ্য, কল্পিত উদ্ধৃতি, clickbait বা অপ্রমাণিত দাবি যোগ করবেন না। শুধু বিবরণ লিখুন।"}]},
     generationConfig:{maxOutputTokens:300,temperature:0.2,thinkingConfig:{thinkingBudget:0}}
    })
   });
  }finally{clearTimeout(timeout);}
  if(!response.ok)return {ok:false,reason:"provider"};
  const data=await response.json() as {candidates?:{content?:{parts?:{text?:string}[]}}[]};
  const draft=(data.candidates?.[0]?.content?.parts||[]).map(x=>x.text||"").join(" ")
   .trim().replace(/^[\\s"'“”]+|[\\s"'“”]+$/g,"").replace(/\\s+/g," ");
  if(draft.length<35)return {ok:false,reason:"provider"};
  return {ok:true,summary:draft.slice(0,210)};
 }catch{return {ok:false,reason:"provider"};}
}
