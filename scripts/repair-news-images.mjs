// Repair four PNGs that were previously committed with truncated IDAT data.
// Downloads the publisher's intact photo (or a clearly documented contextual
// file photo), transcodes it to a small, structurally valid WebP, and caches it
// locally. No user photo is modified; originals remain recoverable on main.
// Safe to run repeatedly: verified outputs are not downloaded again.
import {mkdir,readFile,writeFile,rename,rm} from "node:fs/promises";
import {resolve,dirname} from "node:path";

const root=resolve(import.meta.dirname,"..");
const photos=[
  {
    name:"israel-iran-attack-report-2026-fixed.webp",
    sources:[
      {type:"page",url:"https://dailynayadiganta.com/post/middle-east/1059842"},
      {type:"image",url:"https://www.idf.il/media/ke1nqayf/%D7%A8%D7%9E%D7%98%D7%9B%D7%9C-2007-3.jpeg"},
    ],
  },
  {
    name:"postal-service-week-2026-fixed.webp",
    sources:[{type:"image",url:"https://file.dailynayadiganta.com/assets/img/202610/1791541107_3d12fcc112fda7565ec4.webp"}],
  },
  {
    name:"delhi-protest-security-2026-fixed.webp",
    sources:[{type:"image",url:"https://cf-images.assettype.com/newindianexpress/2026-10-01/7ze2zuto/ANI_20260929030643.jpg"}],
  },
  {
    name:"mithun-cultural-adviser-2026-fixed.webp",
    sources:[{type:"image",url:"https://file.dailynayadiganta.com/assets/img/202610/1791390042_5243db72c4c993b20459.webp"}],
  },
];

const {default:sharp}=await import("sharp");
async function request(url) {
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),20000);
  try {
    const response=await fetch(url,{
      signal:controller.signal,
      redirect:"follow",
      headers:{
        "User-Agent":"Mozilla/5.0 (compatible; BengalWave-NewsImageRepair/1.0)",
        "Accept":"image/jpeg,image/png,image/webp;q=0.7,text/html;q=0.6",
      },
    });
    if(!response.ok)throw new Error("HTTP "+response.status);
    const bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length>15*1024*1024)throw new Error("Source is too large");
    return {bytes,contentType:response.headers.get("content-type")||""};
  }finally{clearTimeout(timeout);}
}
function ogImage(html,baseUrl){
  for(const meta of html.match(/<meta\b[^>]*>/gi)||[]){
    if(!/\b(?:property|name)\s*=\s*["']og:image(?:[:\w]*)?["']/i.test(meta))continue;
    const match=meta.match(/\bcontent\s*=\s*["']([^"']+)["']/i);
    if(match)return new URL(match[1].replaceAll("&amp;","&"),baseUrl).href;
  }
  throw new Error("No publisher article image found");
}
async function loadSource(source){
  let url=source.url;
  if(source.type==="page"){
    const page=await request(url);
    if(!/html/i.test(page.contentType)&&!page.bytes.toString("utf8",0,500).includes("<!DOCTYPE"))throw new Error("Not an HTML article");
    url=ogImage(page.bytes.toString("utf8"),url);
  }
  const file=await request(url);
  if(file.bytes.length<3000)throw new Error("Image too small");
  const info=await sharp(file.bytes,{failOn:"error"}).metadata();
  if((info.width||0)<200||(info.height||0)<120)throw new Error("Image dimensions too small");
  return {buffer:file.bytes,source:url};
}
for(const photo of photos){
  const output=resolve(root,"public/news",photo.name);
  try {
    const saved=await readFile(output);
    const valid=await sharp(saved,{failOn:"error"}).metadata();
    if(valid.format==="webp"&&(valid.width||0)>=200&&(valid.height||0)>=120){
      console.log("[news-images] existing verified file: "+photo.name);
      continue;
    }
  }catch{/* The repaired file is absent or invalid. Download a new one. */}
  await mkdir(dirname(output),{recursive:true});
  const errors=[];
  let success=false;
  for(const candidate of photo.sources){
    try{
      const downloaded=await loadSource(candidate);
      const converted=await sharp(downloaded.buffer,{failOn:"error"})
        .rotate().resize({width:1400,withoutEnlargement:true})
        .webp({quality:78,effort:5}).toBuffer();
      const verified=await sharp(converted,{failOn:"error"}).metadata();
      if(verified.format!=="webp"||(verified.width||0)<200)throw new Error("Output WebP verification failed");
      const tmp=output+".tmp";
      await writeFile(tmp,converted);
      await rename(tmp,output);
      console.log("[news-images] repaired "+photo.name+" ("+converted.length+" bytes), source: "+downloaded.source);
      success=true;
      break;
    }catch(error){
      errors.push(candidate.url+": "+String(error?.message||error));
      await rm(output+".tmp",{force:true}).catch(()=>{});
    }
  }
  if(!success)throw new Error("Cannot repair "+photo.name+":\n"+errors.join("\n"));
}
console.log("[news-images] all damaged images replaced by complete WebP files.");
