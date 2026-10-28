"use server";

import {requireStaff} from "@/lib/auth/require-staff";
import {parseRichBody} from "@/lib/rich-article";
import {parseNewsroomBody,textContent} from "@/lib/newsroom-document";

const seoGeminiModel="gemini-3.5-flash-lite";
const seoGeminiKey=()=>process.env.Gemini_Seo_Key || process.env.GEMINI_API_KEY;

type SlugResult={ok:true;slug:string}|{ok:false;reason:"missing_key"|"invalid"|"provider"|"auth"|"quota"|"model"|"network"|"blocked"};
/** Uses the exact same configured Gemini key and model as the SEO description. */
export async function generateSeoSlug(headline:string,currentArticleId?:string):Promise<SlugResult>{
 const {supabase}=await requireStaff();
 if(typeof headline!=="string"||headline.trim().length<5||headline.length>300)return {ok:false,reason:"invalid"};
 const apiKey=seoGeminiKey();
 if(!apiKey)return {ok:false,reason:"missing_key"};
 try{
  const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),18000);
  let response:Response;
  try{
   response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+seoGeminiModel+":generateContent",{
    method:"POST",signal:ctl.signal,cache:"no-store",
    headers:{"Content-Type":"application/json","x-goog-api-key":apiKey},
    body:JSON.stringify({
     contents:[{role:"user",parts:[{text:"Bangla news headline: "+headline.trim()}]}],
     systemInstruction:{parts:[{text:"Generate a short accurate English SEO URL slug from this Bengali news headline. Reply with ONLY lowercase ASCII words joined by hyphens (a-z, 0-9, hyphen). Prefer 3-7 meaningful words. Preserve names and essential facts, do not invent details. No explanations or punctuation."}]},
     generationConfig:{maxOutputTokens:100,temperature:0.1,thinkingConfig:{thinkingLevel:"minimal"}}
    })
   });
  }finally{clearTimeout(timer);}
  if(!response.ok){
   console.warn("BengalWave slug Gemini request failed",{httpStatus:response.status,model:seoGeminiModel});
   if([401,402,403].includes(response.status))return {ok:false,reason:"auth"};
   if(response.status===429)return {ok:false,reason:"quota"};
   if(response.status===404)return {ok:false,reason:"model"};
   return {ok:false,reason:"provider"};
  }
  const data=await response.json() as {candidates?:{content?:{parts?:{text?:string;thought?:boolean}[]}}[]};
  const output=(data.candidates?.[0]?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||"").join(" ").trim().toLowerCase();
  const base=output.replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,140).replace(/-+$/,"");
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(base))return {ok:false,reason:"blocked"};
  for(let suffix=0;suffix<25;suffix++){
   const candidate=suffix===0?base:base+"-"+(suffix+1);
   const {data:existing,error}=await supabase.from("articles").select("id").eq("slug",candidate).maybeSingle();
   if(error)return {ok:false,reason:"provider"};
   if(!existing||existing.id===currentArticleId)return {ok:true,slug:candidate};
  }
  return {ok:false,reason:"provider"};
 }catch{
  console.warn("BengalWave slug Gemini request timed out or failed",{model:seoGeminiModel});
  return {ok:false,reason:"network"};
 }
}

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
 const apiKey=seoGeminiKey();
 if(!apiKey)return {ok:false,reason:"missing_key"};
 // Google limits Gemini 2.5 access for new projects; use the current stable Free Tier model.
 const model=seoGeminiModel;
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
