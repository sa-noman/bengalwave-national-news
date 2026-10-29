"use client";

import {useEffect} from "react";

/** A genuine, visible article open is counted once per browser/day server-side. */
export function ArticleReadTracker({slug}:{slug:string}){
 useEffect(()=>{
  if(!slug)return;
  let cancelled=false,sent=false;
  let timeout:number|undefined;
  const record=()=>{
   if(cancelled||sent||document.visibilityState!=="visible")return;
   sent=true;
   void fetch("/api/article-read",{
    method:"POST",credentials:"same-origin",keepalive:true,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({slug}),
   }).catch(()=>{/* Analytics must never interrupt reading. */});
  };
  const visible=()=>{
   if(cancelled||sent||document.visibilityState!=="visible")return;
   timeout=window.setTimeout(record,2500);
  };
  document.addEventListener("visibilitychange",visible);
  visible();
  return ()=>{
   cancelled=true;
   if(timeout!==undefined)window.clearTimeout(timeout);
   document.removeEventListener("visibilitychange",visible);
  };
 },[slug]);
 return null;
}
