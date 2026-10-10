/**
 * Generate high-quality article images from complete publisher originals.
 * Home-page cards keep their smaller existing files; these are for reading pages.
 * Never upscale a small source. Source dimensions are logged for transparency.
 * Output files are committed by a GitHub Actions workflow to the preview branch.
 */
import {mkdir,writeFile,readFile,rename,rm} from "node:fs/promises";
import {dirname,resolve} from "node:path";
import sharp from "sharp";

const directory=resolve(import.meta.dirname,"../public/news");
const records=[
 {slug:"israel-iran-attack-report-2026",sources:[
   "https://file.dailynayadiganta.com/assets/img/202610/1791543897_b931effeaba17ac679bd.webp",
   "https://file.dailynayadiganta.com/assets/img/202610/og_1791543897_b931effeaba17ac679bd.webp",
 ]},
 {slug:"postal-service-week-2026",sources:[
   "https://file.dailynayadiganta.com/assets/img/202610/1791541107_3d12fcc112fda7565ec4.webp",
 ]},
 {slug:"delhi-protest-security-2026",sources:[
   "https://cf-images.assettype.com/newindianexpress/2026-10-01/7ze2zuto/ANI_20260929030643.jpg",
 ]},
 {slug:"mithun-cultural-adviser-2026",sources:[
   "https://file.dailynayadiganta.com/assets/img/202610/1791390042_5243db72c4c993b20459.webp",
 ]},
];
async function download(url){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),25000);
 try {
  const response=await fetch(url,{
   signal:controller.signal,redirect:"follow",
   headers:{
    "User-Agent":"Mozilla/5.0 (compatible; BengalWave-NewsImageRepair/2.0)",
    "Accept":"image/jpeg,image/png,image/webp;q=0.9",
   },
  });
  if(!response.ok)throw new Error("HTTP "+response.status);
  const type=response.headers.get("content-type")||"";
  if(!type.startsWith("image/"))throw new Error("Not an image: "+type);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length<5000||bytes.length>20*1024*1024)throw new Error("Unexpected source size");
  // Sharp decodes the image completely, detecting truncation or invalid data.
  const decoded=await sharp(bytes,{failOn:"error"}).rotate().toBuffer({resolveWithObject:true});
  const {width,height}=decoded.info;
  if(width<500||height<300)throw new Error("Image too small "+width+"x"+height);
  return {buffer:bytes,width,height};
 }finally {clearTimeout(timer);}
}
for(const record of records){
 const target=resolve(directory,record.slug+"-article.webp");
 await mkdir(dirname(target),{recursive:true});
 let found=null;
 let selected="";
 const failures=[];
 for(const url of record.sources){
  try{
   const candidate=await download(url);
   console.log("[quality] source "+record.slug+": "+candidate.width+"x"+candidate.height+" at "+url);
   if(!found||candidate.width*candidate.height>found.width*found.height){
    found=candidate;selected=url;
   }
  }catch(e){failures.push(url+": "+String(e.message||e));}
 }
 if(!found)throw new Error("No valid source for "+record.slug+":\n"+failures.join("\n"));
 // Preserve full source dimensions up to 2000px; never enlarge or add fake detail.
 const webp=await sharp(found.buffer,{failOn:"error"}).rotate()
  .resize({width:2000,withoutEnlargement:true})
  .webp({quality:92,effort:5,smartSubsample:true})
  .toBuffer();
 const info=await sharp(webp,{failOn:"error"}).metadata();
 if(info.format!=="webp"||!info.width||!info.height)throw new Error("Failed WebP verification");
 const tmp=target+".tmp";
 await writeFile(tmp,webp);
 await rename(tmp,target);
 console.log("[quality] saved "+record.slug+"-article.webp "+
    info.width+"x"+info.height+", "+webp.length+" bytes; source "+selected);
 if(found.width<1000)console.warn("[quality] low-resolution publisher source for "+record.slug+
    ": "+found.width+"px (no upscaling performed)");
}
