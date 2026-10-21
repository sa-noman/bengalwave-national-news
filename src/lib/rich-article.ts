/**
 * Safe, versioned article layout stored in the existing articles.body column.
 * The public reader never interprets arbitrary HTML from the CMS.
 * Plain-text legacy articles continue to use their original paragraph layout.
 */
export const RICH_BODY_PREFIX="BW_RICH_V1\n";
export type StoryBlockType="paragraph"|"heading"|"subheading"|"quote"|"callout"|"list"|"image"|"split"|"gallery"|"slideshow"|"divider";
export type StorySlide={src:string;alt:string;caption:string;credit:string};
export type StoryBlock={
 id:string;
 type:StoryBlockType;
 text:string;
 src:string;
 src2:string;
 alt:string;
 alt2:string;
 caption:string;
 caption2:string;
 credit:string;
 width:"full"|"medium"|"small";
 align:"center"|"left"|"right";
 layout:"image-left"|"image-right";
 tone:"cream"|"gray"|"red";
 borderColor?:string;
 slides?:StorySlide[];
};
export const BLOCK_TYPES:StoryBlockType[]=["paragraph","heading","subheading","quote","callout","list","image","split","gallery","slideshow","divider"];
const ID_RE=/^[a-z0-9-]{8,64}$/i;
export function safeStoryImageUrl(value:string):string|null{
 if(value.length>2000)return null;
 if(/^\/(?!\/)[a-zA-Z0-9/_\-.]+$/.test(value)&&!value.includes(".."))return value;
 try{
  const url=new URL(value);
  return url.protocol==="https:"&&url.username===""&&url.password===""?url.href:null;
 }catch{return null;}
}
export function createStoryBlock(type:StoryBlockType,id:string):StoryBlock{
 return {id,type,text:"",src:"",src2:"",alt:"",alt2:"",caption:"",caption2:"",credit:"",
  width:"full",align:"center",layout:"image-left",tone:"cream",borderColor:"",slides:[]};
}
export function isStoryBlock(b:unknown):b is StoryBlock{
 if(!b||typeof b!=="object")return false;
 const v=b as Partial<StoryBlock>;
 if(typeof v.id!=="string"||!ID_RE.test(v.id)||!BLOCK_TYPES.includes(v.type as StoryBlockType))return false;
 for(const field of ["text","src","src2","alt","alt2","caption","caption2","credit"] as const){
  if(typeof v[field]!=="string")return false;
 }
 if(v.text!.length>10000||v.alt!.length>300||v.alt2!.length>300||
    v.caption!.length>700||v.caption2!.length>700||v.credit!.length>200)return false;
 if(v.src!.length>2000||v.src2!.length>2000)return false;
 if(v.borderColor!==undefined&&(typeof v.borderColor!=="string"||!/^$|^#[0-9a-fA-F]{6}$/.test(v.borderColor)))return false;
 if(v.slides!==undefined){
  if(!Array.isArray(v.slides)||v.slides.length>12)return false;
  if(!v.slides.every(s=>s&&typeof s==="object"&&["src","alt","caption","credit"].every(k=>typeof (s as unknown as Record<string,unknown>)[k]==="string")&&
    s.src.length<=2000&&s.alt.length<=300&&s.caption.length<=700&&s.credit.length<=200))return false;
 }
 if(v.type==="slideshow"&&(!Array.isArray(v.slides)||v.slides.length<2))return false;
 return ["full","medium","small"].includes(v.width!)&&
  ["center","left","right"].includes(v.align!)&&
  ["image-left","image-right"].includes(v.layout!)&&
  ["cream","gray","red"].includes(v.tone!);
}
export function parseRichBody(raw:string):StoryBlock[]|null{
 if(!raw.startsWith(RICH_BODY_PREFIX)||raw.length>80000)return null;
 try{
  const parsed:unknown=JSON.parse(raw.slice(RICH_BODY_PREFIX.length));
  if(!parsed||typeof parsed!=="object")return null;
  const obj=parsed as {v?:number;blocks?:unknown};
  if(obj.v!==1||!Array.isArray(obj.blocks)||obj.blocks.length>100||
      !obj.blocks.every(isStoryBlock))return null;
  const ids=obj.blocks.map((b:StoryBlock)=>b.id);
  if(new Set(ids).size!==ids.length)return null;
  return obj.blocks as StoryBlock[];
 }catch{return null;}
}
export function serializeRichBody(blocks:StoryBlock[]):string{
 return RICH_BODY_PREFIX+JSON.stringify({v:1,blocks});
}
export function hasArticleContent(blocks:StoryBlock[]):boolean{
 return blocks.some(b=>b.type!=="divider"&&
  (b.text.trim().length>0||["image","split","gallery","slideshow"].includes(b.type)));
}
export function validateRichBody(raw:string,form?:FormData):boolean{
 if(!raw.startsWith(RICH_BODY_PREFIX))return true;
 const blocks=parseRichBody(raw);
 if(!blocks)return false;
 let fileCount=0;
 for(const block of blocks){
  if(block.type==="slideshow"){
   for(let i=0;i<(block.slides?.length||0);i++){
    const slide=block.slides![i];
    const upload=form?.get("inline_image_"+block.id+"_slide_"+i);
    const file=upload instanceof File&&upload.size>0?upload:null;
    if(file){fileCount++;if(file.size>4*1024*1024)return false;}
    else if(!safeStoryImageUrl(slide.src))return false;
   }
  }
  for(const field of (block.type==="gallery"?["src","src2"] as const:
    ["image","split"].includes(block.type)?["src"] as const:[])){
   const file=form?.get("inline_image_"+block.id+(field==="src2"?"_second":""));
   const upload=file instanceof File&&file.size>0;
   if(upload)fileCount++;
   const src=block[field];
   if(!upload&&(!src||!safeStoryImageUrl(src)))return false;
   if(file instanceof File&&file.size>4*1024*1024)return false;
  }
 }
 return fileCount<=6;
}
export function legacyStoryBlocks(raw:string):StoryBlock[]{
 return raw.split(/\n\s*\n/).map(t=>t.trim()).filter(Boolean).map((text,i)=>({
  ...createStoryBlock("paragraph","legacy-block-"+i),text
 }));
}

/** Count actual editorial text rather than JSON formatting metadata on publish. */
export function hasPublishableStoryText(raw:string):boolean{
 const b=parseRichBody(raw);
 return b?b.reduce((n,item)=>n+item.text.trim().length,0)>=30:raw.trim().length>=30;
}
