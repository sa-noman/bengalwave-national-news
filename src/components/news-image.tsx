"use client";
import {useState} from "react";

/** Only reveal fully loaded images, never a partially streamed bitmap. */
export function NewsImage({src,alt="",eager=false}:{src:string;alt?:string;eager?:boolean}){
 const [status,setStatus]=useState<"loading"|"loaded"|"error">("loading");
 return <>
  {status!=="loaded"&&<span className="bw-image-placeholder" aria-hidden="true">{status==="error"?"ছবি পাওয়া যায়নি":""}</span>}
  {src&&<img key={src} src={src} alt={alt} loading={eager?"eager":"lazy"} decoding="async"
   className={status==="loaded"?"bw-image-ready":"bw-image-pending"}
   onLoad={event=>{
    const img=event.currentTarget;
    if(!img.naturalWidth||!img.naturalHeight){setStatus("error");return;}
    img.decode().then(()=>setStatus("loaded")).catch(()=>setStatus("error"));
   }}
   onError={()=>setStatus("error")}
  />}
 </>;
}
