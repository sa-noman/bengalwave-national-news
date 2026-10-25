"use server";

import {requireStaff} from "@/lib/auth/require-staff";
import {parseRichBody} from "@/lib/rich-article";
import {parseNewsroomBody,textContent} from "@/lib/newsroom-document";

type SeoResult={ok:true;summary:string}|{ok:false;reason:"missing_key"|"invalid"|"provider"|"empty"|"auth"|"quota"|"model"|"request"|"network"|"blocked"};
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
 // Google limits Gemini 2.5 access for new projects; use the current stable Free Tier model.
 const model="gemini-3.5-flash-lite";
 try{
  const ctl=new AbortController();
  const timeout=setTimeout(()=>ctl.abort(),18000);
  let response:Response;
  try{
   response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent",{
    method:"POST",signal:ctl.signal,cache:"no-store",
    headers:{"Content-Type":"application/json","x-goog-api-key":apiKey},
    body:JSON.stringify({
     contents:[{role:"user",parts:[{text:"শিরোনাম: "+title+"\n\nপ্রতিবেদন: "+text}]}],
     systemInstruction:{parts:[{text:"আপনি Bengal Wave সংবাদ সম্পাদক। শুধু সরবরাহ করা শিরোনাম ও প্রতিবেদনের তথ্য ব্যবহার করে বাংলা ভাষায় একটি তথ্যনিষ্ঠ, সাবলীল SEO meta description লিখুন। একটিমাত্র বাক্য বা প্রয়োজনমতো দুটি ছোট বাক্য, মোট ১১০-১৬০ বাংলা অক্ষরের মধ্যে রাখার চেষ্টা করুন। কী ঘটেছে ও কারা সংশ্লিষ্ট তা প্রথমেই বলুন। কোনো নতুন তথ্য, কল্পিত উদ্ধৃতি, clickbait বা অপ্রমাণিত দাবি যোগ করবেন না। শুধু বিবরণ লিখুন।"}]},
     generationConfig:{maxOutputTokens:700,temperature:0.2,thinkingConfig:{thinkingLevel:"minimal"}}
    })
   });
  }finally{clearTimeout(timeout);}
  if(!response.ok){
   // Only log HTTP status and model. Never log API keys, prompts or provider response bodies.
   console.warn("BengalWave SEO Gemini request failed", {httpStatus:response.status,model});
   if(response.status===401||response.status===403||response.status===402)return {ok:false,reason:"auth"};
   if(response.status===429)return {ok:false,reason:"quota"};
   if(response.status===404)return {ok:false,reason:"model"};
   if(response.status===400||response.status===422)return {ok:false,reason:"request"};
   return {ok:false,reason:"provider"};
  }
  const data=await response.json() as {
   candidates?:{content?:{parts?:{text?:string;thought?:boolean}[]};finishReason?:string}[];
   promptFeedback?:{blockReason?:string};
  };
  const parts=data.candidates?.[0]?.content?.parts||[];
  const draft=parts.filter(part=>!part.thought).map(part=>part.text||"").join(" ")
   .trim().replace(/^[\s"'“”]+|[\s"'“”]+$/g,"").replace(/\s+/g," ");
  if(draft.length<35){
   const finishReason=data.candidates?.[0]?.finishReason||"";
   const blockReason=data.promptFeedback?.blockReason||"";
   // Log only allowlisted reason codes, not raw provider output.
   const blocked=Boolean(blockReason)||["SAFETY","PROHIBITED_CONTENT","BLOCKLIST","RECITATION"].includes(finishReason);
   console.warn("BengalWave SEO Gemini returned no usable text",{model,blocked});
   return {ok:false,reason:blocked?"blocked":"provider"};
  }
  return {ok:true,summary:draft.slice(0,160)};
 }catch{
  console.warn("BengalWave SEO Gemini network or timeout failure",{model});
  return {ok:false,reason:"network"};
 }
}
