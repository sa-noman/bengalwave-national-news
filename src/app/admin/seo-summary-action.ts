"use server";

import {requireStaff} from "@/lib/auth/require-staff";
import {parseRichBody} from "@/lib/rich-article";

type SeoResult={ok:true;summary:string}|{ok:false;reason:"missing_key"|"invalid"|"provider"|"empty"};
function textFromBody(body:string):string{
 const blocks=parseRichBody(body);
 const text=blocks ? blocks.map(block=>block.text).filter(Boolean).join("\n") : body;
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
 const apiKey=process.env.OPENAI_API_KEY;
 if(!apiKey)return {ok:false,reason:"missing_key"};
 try{
  const ctl=new AbortController();
  const timeout=setTimeout(()=>ctl.abort(),18000);
  let response:Response;
  try{
   response=await fetch("https://api.openai.com/v1/responses",{
    method:"POST",signal:ctl.signal,cache:"no-store",
    headers:{"Content-Type":"application/json",Authorization:"Bearer "+apiKey},
    body:JSON.stringify({
     model:process.env.OPENAI_SEO_MODEL||"gpt-4.1-mini",
     store:false,max_output_tokens:220,
     instructions:"আপনি Bengal Wave সংবাদ সম্পাদক। শুধু সরবরাহ করা শিরোনাম ও প্রতিবেদনের তথ্য ব্যবহার করে বাংলা ভাষায় একটি তথ্যনিষ্ঠ, সাবলীল SEO meta description লিখুন। একটিমাত্র বাক্য বা প্রয়োজনমতো দুটি ছোট বাক্য, মোট ১১০-১৬০ বাংলা অক্ষরের মধ্যে রাখার চেষ্টা করুন। কী ঘটেছে ও কারা সংশ্লিষ্ট তা প্রথমেই বলুন। কোনো নতুন তথ্য, কল্পিত উদ্ধৃতি, clickbait বা অপ্রমাণিত দাবি যোগ করবেন না। শিরোনামের তথ্যের সঙ্গে দ্বন্দ্ব করবেন না। শুধু বিবরণ লিখুন, উদ্ধৃতিচিহ্ন, শিরোনাম, বুলেট বা ব্যাখ্যা নয়।",
     input:"শিরোনাম: "+title+"\n\nপ্রতিবেদন: "+text
    })
   });
  }finally{clearTimeout(timeout);}
  if(!response.ok)return {ok:false,reason:"provider"};
  const data=await response.json() as {
   output?:{content?:{type?:string;text?:string}[]}[];
   output_text?:string;
  };
  const draft=(data.output_text||
   (data.output||[]).flatMap(o=>o.content||[]).filter(x=>x.type==="output_text").map(x=>x.text||"").join(" "))
   .trim().replace(/^[\s"'“”]+|[\s"'“”]+$/g,"").replace(/\s+/g," ");
  if(draft.length<35)return {ok:false,reason:"provider"};
  return {ok:true,summary:draft.slice(0,210)};
 }catch{return {ok:false,reason:"provider"};}
}
