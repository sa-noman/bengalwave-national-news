/**
 * BW_Newsroom_V2 is a validated, versioned ProseMirror document. Its content is
 * never inserted as HTML. Historic plain text and BW_RICH_V1 remain readable.
 */
import {legacyStoryBlocks,parseRichBody,safeStoryImageUrl} from "@/lib/rich-article";
import type {StoryBlock} from "@/lib/rich-article";

export const NEWSROOM_PREFIX="BW_NEWSROOM_V2\n";
export type NewsJSON={type:string;attrs?:Record<string,unknown>;text?:string;marks?:NewsJSON[];content?:NewsJSON[]};
export type NewsPhoto={id:string;src:string;alt:string;caption:string;credit:string};
export const ID=/^[a-z0-9-]{8,64}$/i;
const textMarks=new Set(["bold","italic","underline","strike","link","textStyle","code"]);
const basicNodes=new Set(["doc","paragraph","text","heading","bulletList","orderedList","listItem","blockquote","horizontalRule","hardBreak","newsMedia","newsCallout"]);
const COLORS=/^#[0-9a-fA-F]{6}$/;
export const textContent=(doc:NewsJSON):string=>[
 ...(doc.text?[doc.text]:[]),
 ...(doc.type==="newsMedia"&&doc.attrs?.mode==="split"&&typeof doc.attrs.text==="string"?[doc.attrs.text]:[]),
 ...(doc.type==="newsCallout"&&typeof doc.attrs?.credit==="string"?[doc.attrs.credit]:[]),
 ...((doc.content||[]).flatMap(child=>[textContent(child)]))
].join(" ").replace(/\s+/g," ").trim();
export function isPhoto(raw:unknown):raw is NewsPhoto{
 if(!raw||typeof raw!=="object")return false;
 const a=raw as Partial<NewsPhoto>;
 return typeof a.id==="string"&&ID.test(a.id)&&typeof a.src==="string"&&a.src.length<=2000&&
 typeof a.alt==="string"&&a.alt.length<=300&&typeof a.caption==="string"&&a.caption.length<=700&&
 typeof a.credit==="string"&&a.credit.length<=200;
}
export function validateNewsJSON(n:unknown,depth=0):n is NewsJSON{
 if(depth>16||!n||typeof n!=="object")return false;
 const a=n as NewsJSON;
 if(!basicNodes.has(a.type))return false;
 if(a.type==="text"&&(typeof a.text!=="string"||!a.text.length||a.text.length>12000))return false;
 if(a.marks&&(!Array.isArray(a.marks)||a.marks.length>8||!a.marks.every(mark=>{
   if(!textMarks.has(mark.type))return false;
   const attrs=mark.attrs||{};
   if(mark.type==="link")return typeof attrs.href==="string"&&!!safeStoryImageUrl(attrs.href);
   if(mark.type==="textStyle"){
    if(attrs.fontSize!==undefined&&(!/^(1[2-9]|2[0-8]|3[02])px$/.test(String(attrs.fontSize))))return false;
    if(attrs.color!==undefined&&!COLORS.test(String(attrs.color)))return false;
   }
   return true;
 })))return false;
 if(a.content&&(!Array.isArray(a.content)||a.content.length>120||!a.content.every(child=>validateNewsJSON(child,depth+1))))return false;
 if(a.type==="heading"&&!([2,3].includes(Number(a.attrs?.level))))return false;
 if(a.type==="newsCallout"){
  if(!["quote","highlight"].includes(String(a.attrs?.kind)))return false;
  if(a.attrs?.borderColor!==undefined&&!COLORS.test(String(a.attrs.borderColor)))return false;
  if(typeof a.attrs?.credit!=="string"||a.attrs.credit.length>200)return false;
 }
 if(a.type==="newsMedia"){
  const v=a.attrs||{};
  if(!["image","gallery","slideshow","split"].includes(String(v.mode)))return false;
  if(!ID.test(String(v.id)))return false;
  const photos=v.photos;
  if(!Array.isArray(photos)||photos.length<1||photos.length>12||!photos.every(isPhoto))return false;
  const required=v.mode==="image"||v.mode==="split"?1:v.mode==="gallery"?2:2;
  if(photos.length<required||(v.mode==="gallery"&&photos.length!==2)||(photos.length!==1&&(v.mode==="image"||v.mode==="split")))return false;
  if(typeof v.text!=="string"||v.text.length>10000)return false;
  if(!["small","medium","full"].includes(String(v.width)))return false;
  if(!["left","center","right"].includes(String(v.align)))return false;
  if(!["image-left","image-right"].includes(String(v.layout)))return false;
 }
 return true;
}
export function parseNewsroomBody(raw:string):NewsJSON|null{
 if(!raw.startsWith(NEWSROOM_PREFIX)||raw.length>80000)return null;
 try{
  const doc=JSON.parse(raw.slice(NEWSROOM_PREFIX.length)) as NewsJSON;
  return doc.type==="doc"&&validateNewsJSON(doc)?doc:null;
 }catch{return null;}
}
export function serializeNewsroomBody(doc:NewsJSON):string{
 return NEWSROOM_PREFIX+JSON.stringify(doc);
}
export function validateNewsroomBody(raw:string,form?:FormData):boolean{
 const doc=parseNewsroomBody(raw);if(!doc)return false;
 let uploads=0,pictures=0,nodes=0;const ids=new Set<string>();
 const check=(node:NewsJSON):boolean=>{
  nodes++;if(nodes>450)return false;
  if(node.type==="newsMedia"){
   const photos=node.attrs?.photos as NewsPhoto[];
   for(const photo of photos){
    pictures++;if(pictures>36||ids.has(photo.id))return false;
    ids.add(photo.id);
    const file=form?.get("newsroom_media_"+photo.id);
    const isFile=file instanceof File&&file.size>0;
    if(isFile){
     uploads++;
     if(file.size>4*1024*1024||!["image/jpeg","image/png","image/webp","image/avif"].includes(file.type))return false;
    }else if(!safeStoryImageUrl(photo.src))return false;
   }
  }
  return (node.content||[]).every(check);
 };
 return check(doc)&&uploads<=6;
}
function markdownToText(text:string):NewsJSON[]{
 const tokens=/(\*\*\*[^*\n]+\*\*\*|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[\[fs:(?:14|16|18|20|22|24|28|32)\]\][\s\S]*?\[\[\/fs\]\])/g;
 return text.split(tokens).filter(Boolean).map(p=>{
  let value=p,marks:NewsJSON[]=[];
  if(value.startsWith("***")&&value.endsWith("***")){value=value.slice(3,-3);marks=[{type:"bold"},{type:"italic"}];}
  else if(value.startsWith("**")&&value.endsWith("**")){value=value.slice(2,-2);marks=[{type:"bold"}];}
  else if(value.startsWith("*")&&value.endsWith("*")){value=value.slice(1,-1);marks=[{type:"italic"}];}
  else if(value.startsWith("[[fs:")){
   const m=/^\[\[fs:(\d+)\]\]([\s\S]*)\[\[\/fs\]\]$/.exec(value);
   if(m){value=m[2];marks=[{type:"textStyle",attrs:{fontSize:m[1]+"px"}}];}
  }
  return {type:"text",text:value,marks:marks.length?marks:undefined};
 });
}
const paragraph=(text:string):NewsJSON=>({type:"paragraph",content:markdownToText(text)});
function blockToNode(b:StoryBlock):NewsJSON{
 if(b.type==="heading"||b.type==="subheading")return {type:"heading",attrs:{level:b.type==="heading"?2:3},content:markdownToText(b.text)};
 if(b.type==="divider")return {type:"horizontalRule"};
 if(b.type==="list")return {type:"bulletList",content:b.text.split("\n").filter(Boolean).map(t=>({type:"listItem",content:[paragraph(t)]}))};
 if(b.type==="quote"||b.type==="callout")return {type:"newsCallout",attrs:{kind:b.type==="quote"?"quote":"highlight",borderColor:b.borderColor||"#0b4838",credit:b.credit},content:[paragraph(b.text)]};
 if(["image","gallery","split","slideshow"].includes(b.type)){
  const photos:NewsPhoto[]=[];
  const add=(id:string,src:string,alt:string,caption:string,credit:string)=>photos.push({id,src,alt,caption,credit});
  if(b.type==="slideshow")(b.slides||[]).forEach((s,i)=>add(b.id+"-s"+i,s.src,s.alt,s.caption,s.credit));
  else{
   add(b.id+"-s0",b.src,b.alt,b.caption,b.credit);
   if(b.type==="gallery")add(b.id+"-s1",b.src2,b.alt2,b.caption2,"");
  }
  return {type:"newsMedia",attrs:{id:b.id,mode:b.type,photos,width:b.width,align:b.align,layout:b.layout,text:b.text}};
 }
 return paragraph(b.text);
}
export function existingBodyToNewsJSON(raw:string):NewsJSON{
 const old=parseNewsroomBody(raw);if(old)return old;
 const blocks=parseRichBody(raw)||legacyStoryBlocks(raw);
 const nodes=blocks.map(blockToNode);
 return {type:"doc",content:nodes.length?nodes:[{type:"paragraph"}]};
}

export function newsroomPublishableText(raw:string):boolean{
 if(raw.startsWith(NEWSROOM_PREFIX)){
  const doc=parseNewsroomBody(raw);
  return !!doc&&textContent(doc).length>=30;
 }
 return raw.startsWith("BW_RICH_V1\n") ? !!parseRichBody(raw)&&parseRichBody(raw)!.reduce((sum,b)=>sum+b.text.trim().length,0)>=30 : raw.trim().length>=30;
}
