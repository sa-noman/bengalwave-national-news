"use client";

import Image from "next/image";
import {useState} from "react";

/**
 * All news thumbnails use Next.js image optimization instead of downloading
 * the original full-size PNG. Only a decoded image may cover the placeholder.
 * If the optimizer is temporarily unavailable, retry the original once.
 */
export function NewsImage({
  src,
  alt="",
  eager=false,
  quality=78,
  sizes="(max-width: 760px) 72vw, (max-width: 1000px) 50vw, 25vw",
}:{
  src:string;
  alt?:string;
  eager?:boolean;
  quality?:number;
  sizes?:string;
}){
  const [status,setStatus]=useState<"loading"|"loaded"|"error">("loading");
  const [useOriginal,setUseOriginal]=useState(false);

  return <>
    {status!=="loaded"&&
      <span className="bw-image-placeholder" aria-hidden="true">
        {status==="error"?"ছবি লোড করা যায়নি":""}
      </span>}
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      priority={eager}
      unoptimized={useOriginal || /^https:\/\//.test(src)}
      className={status==="loaded"?"bw-image-ready":"bw-image-pending"}
      onLoad={()=>setStatus("loaded")}
      onError={()=>{
        if(!useOriginal){
          setUseOriginal(true);
          setStatus("loading");
        }else{
          setStatus("error");
        }
      }}
    />
  </>;
}
