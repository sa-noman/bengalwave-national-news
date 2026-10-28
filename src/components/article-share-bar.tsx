"use client";

import {useEffect,useState} from "react";

function ShareIcon({kind}:{kind:"facebook"|"x"|"whatsapp"|"telegram"|"link"|"check"|"share"|"print"}){
 if(kind==="check")return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>;
 if(kind==="x")return <span className="bw-share-x" aria-hidden="true">𝕏</span>;
 if(kind==="facebook")return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.5 8H13V6.5c0-.7.3-1 1-1h1.5V2.2C15 2.1 14.3 2 13.4 2 10.7 2 9 3.6 9 6.5V8H6.5v3.8H9V22h4V11.8h2.2L15.5 8Z"/></svg>;
 if(kind==="whatsapp")return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11.7a8 8 0 0 1-11.7 7L3.5 20l1.3-4.8A8 8 0 1 1 20 11.7Z"/><path d="M8.3 8.4c.6-.5.8-.2 1.2.6l.6 1.2c.2.3.1.5-.3.9l-.4.4a7 7 0 0 0 3.3 3.2l.6-.6c.2-.2.5-.3.9-.1l1.4.7c.6.3.8.5.4 1.1-.6 1.1-1.4 1.4-2.6 1-2.7-1-5.4-3.8-5.7-5.9-.1-.5.1-1 .6-1.3Z"/></svg>;
 if(kind==="telegram")return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21 3-4.5 18-5.7-5-3.3 2.5.7-5.2L3 11.3 21 3Z"/><path d="m8.2 13.3 8.8-6.9-6.2 9.6"/></svg>;
 if(kind==="link")return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13.5a4 4 0 0 0 6.5.5l2.3-2.3a4 4 0 1 0-5.7-5.7l-1.3 1.3"/><path d="M14 10.5a4 4 0 0 0-6.5-.5l-2.3 2.3a4 4 0 1 0 5.7 5.7l1.3-1.3"/></svg>;
 if(kind==="print")return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/><path d="M18 11h.01"/></svg>;
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a3 3 0 1 0-2.9-3.8L8.7 8a3 3 0 1 0 0 4.5l6.4 3.5A3 3 0 1 0 16 14l-6.4-3.5"/></svg>;
}

export function ArticleShareBar({url,title,preview=false}:{url:string;title:string;preview?:boolean}){
 const [status,setStatus]=useState("");
 const [copied,setCopied]=useState(false);
 useEffect(()=>{
  if(!copied)return;
  const timeout=window.setTimeout(()=>setCopied(false),2400);
  return ()=>window.clearTimeout(timeout);
 },[copied]);
 const copy=async()=>{
  if(preview)return;
  try{await navigator.clipboard.writeText(url);setCopied(true);setStatus("সংবাদের লিংক কপি হয়েছে।");}
  catch{setCopied(false);setStatus("লিংক কপি করা যায়নি।");}
 };
 const share=async()=>{
  if(preview)return;
  try{
   if(navigator.share)await navigator.share({title,url});
   else await copy();
  }catch(error){
   if(error instanceof Error&&error.name!=="AbortError")setStatus("শেয়ার করা যায়নি।");
  }
 };
 const encodedUrl=encodeURIComponent(url),encodedTitle=encodeURIComponent(title);
 const targets=[
  {kind:"facebook" as const,label:"Facebook-এ শেয়ার করুন",href:"https://www.facebook.com/sharer/sharer.php?u="+encodedUrl},
  {kind:"x" as const,label:"X-এ শেয়ার করুন",href:"https://twitter.com/intent/tweet?url="+encodedUrl+"&text="+encodedTitle},
  {kind:"whatsapp" as const,label:"WhatsApp-এ শেয়ার করুন",href:"https://api.whatsapp.com/send?text="+encodeURIComponent(title+" "+url)},
  {kind:"telegram" as const,label:"Telegram-এ শেয়ার করুন",href:"https://t.me/share/url?url="+encodedUrl+"&text="+encodedTitle}
 ];
 return <div className="bw-article-share" aria-label="সংবাদ শেয়ার করুন">
  <div className="bw-article-share-icons">
   {targets.map(target=>preview
    ?<button type="button" key={target.kind} className="bw-share-icon" disabled title="প্রকাশের পরে শেয়ার করা যাবে" aria-label={target.label}><ShareIcon kind={target.kind}/></button>
    :<a key={target.kind} className="bw-share-icon" href={target.href} target="_blank" rel="noopener noreferrer nofollow" aria-label={target.label} title={target.label}><ShareIcon kind={target.kind}/></a>)}
   <button type="button" className={"bw-share-icon"+(copied?" bw-share-copied":"")} onClick={()=>void copy()} disabled={preview} aria-label={copied?"সংবাদের লিংক কপি হয়েছে":"সংবাদের লিংক কপি করুন"} title="লিংক কপি করুন"><ShareIcon kind={copied?"check":"link"}/></button>
  </div>
  <div className="bw-article-share-actions">
   <button type="button" className="bw-share-icon" onClick={()=>void share()} disabled={preview} aria-label="অন্যান্য অ্যাপে শেয়ার করুন" title="শেয়ার করুন"><ShareIcon kind="share"/></button>
   <button type="button" className="bw-share-icon" onClick={()=>window.print()} disabled={preview} aria-label="সংবাদ প্রিন্ট করুন" title="প্রিন্ট করুন"><ShareIcon kind="print"/></button>
  </div>
  {status&&<span className="bw-share-visually-hidden" role="status">{status}</span>}
 </div>;
}
