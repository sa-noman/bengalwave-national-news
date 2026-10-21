"use client";

import {useEffect,useRef,useState} from "react";
import {createStoryBlock,legacyStoryBlocks,parseRichBody,safeStoryImageUrl,serializeRichBody} from "@/lib/rich-article";
import {RichArticleBody} from "@/components/rich-article-body";
import type {StoryBlock,StoryBlockType} from "@/lib/rich-article";

const MAX_IMAGE_BYTES=4*1024*1024;
const ACCEPTED=["image/jpeg","image/png","image/webp","image/avif"];
type ImageMode="image"|"split"|"gallery"|"slideshow"|"slide-add";
function el<K extends keyof HTMLElementTagNameMap>(tag:K,className?:string){
 const node=document.createElement(tag);if(className)node.className=className;return node;
}
function textToInline(parent:HTMLElement,raw:string){
 // Restore bounded font sizes recorded in the article format.
 const sizes=/\[\[fs:(14|16|18|20|22|24|28|32)\]\]([\s\S]*?)\[\[\/fs\]\]/g;
 let match:RegExpExecArray|null;let from=0;let any=false;
 while((match=sizes.exec(raw))!==null){
  any=true;
  if(match.index>from)textToInline(parent,raw.slice(from,match.index));
  const span=el("span");span.style.fontSize=match[1]+"px";
  textToInline(span,match[2]);parent.append(span);from=match.index+match[0].length;
 }
 if(any){if(from<raw.length)textToInline(parent,raw.slice(from));return;}
 // Legacy stored stories use a very small Markdown subset, never raw HTML.
 const parts=raw.split(/(\*\*\*[^*\n]+\*\*\*|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\(https:\/\/[^\s)]+\))/g);
 for(const part of parts){
  if(!part)continue;
  let child:HTMLElement|undefined;
  if(part.startsWith("***")&&part.endsWith("***")){
   child=el("strong");const em=el("em");em.textContent=part.slice(3,-3);child.append(em);
  }else if(part.startsWith("**")&&part.endsWith("**")){
   child=el("strong");child.textContent=part.slice(2,-2);
  }else if(part.startsWith("*")&&part.endsWith("*")){
   child=el("em");child.textContent=part.slice(1,-1);
  }else{
   const link=/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/.exec(part);
   if(link){child=el("a");child.textContent=link[1];(child as HTMLAnchorElement).href=link[2];(child as HTMLAnchorElement).target="_blank";(child as HTMLAnchorElement).rel="noopener noreferrer";}
  }
  if(child)parent.append(child);else parent.append(document.createTextNode(part));
 }
}
function makeFigure(src:string,id:string,caption="",alt="",credit=""){
 const figure=el("figure","bw-doc-figure");
 figure.dataset.blockId=id;figure.dataset.src=src;
 const image=el("img");image.alt=alt||"সংবাদের ছবি";image.loading="lazy";
 if(src)image.src=src;
 else image.dataset.awaitingUpload="true";
 figure.append(image);
 const cap=el("figcaption");cap.contentEditable="true";cap.dataset.placeholder="ছবির ক্যাপশন লিখুন (ঐচ্ছিক)";cap.textContent=caption;
 cap.setAttribute("role","textbox");cap.setAttribute("aria-label","ছবির ক্যাপশন");
 figure.append(cap);
 if(credit){const cred=el("small","bw-doc-credit");cred.contentEditable="true";cred.textContent=credit;figure.append(cred);}
 return figure;
}
function toDOM(block:StoryBlock):HTMLElement{
 const tag=block.type;
 if(tag==="heading"||tag==="subheading"){
  const h=el(tag==="heading"?"h2":"h3");textToInline(h,block.text);return h;
 }
 if(tag==="quote"||tag==="callout"){
  const q=el("blockquote",tag==="quote"?"bw-doc-pullquote":"bw-doc-highlight");
  q.dataset.kind=tag;
  q.dataset.calloutId=block.id;
  if(tag==="callout"){
   q.dataset.tone=block.tone;
   if(block.borderColor){q.dataset.borderColor=block.borderColor;q.style.borderLeftColor=block.borderColor;}
  }
  const p=el("p");textToInline(p,block.text);q.append(p);
  if(tag==="quote"){const cite=el("cite");cite.contentEditable="true";cite.dataset.placeholder="উদ্ধৃতির ব্যক্তির নাম ও পদবি";cite.textContent=block.credit;q.append(cite);}
  return q;
 }
 if(tag==="divider")return el("hr");
 if(tag==="list"){const ul=el("ul");for(const line of block.text.split("\n")){if(!line.trim())continue;const li=el("li");textToInline(li,line);ul.append(li);}return ul;}
 if(tag==="image"){const div=el("div","bw-doc-image-block");div.dataset.width=block.width;div.dataset.align=block.align;div.append(makeFigure(block.src,block.id,block.caption,block.alt,block.credit));return div;}
 if(tag==="split"){
  const wrap=el("section","bw-doc-split");wrap.dataset.layout=block.layout;
  wrap.append(makeFigure(block.src,block.id,block.caption,block.alt,block.credit));
  const copy=el("div","bw-doc-split-text");const p=el("p");textToInline(p,block.text);copy.append(p);wrap.append(copy);
  return wrap;
 }
 if(tag==="gallery"){
  const grid=el("section","bw-doc-gallery");grid.dataset.galleryId=block.id;
  grid.append(makeFigure(block.src,block.id,block.caption,block.alt,block.credit));
  grid.append(makeFigure(block.src2,block.id+"-second",block.caption2,block.alt2));
  return grid;
 }
 if(tag==="slideshow"){
  const slideshow=el("section","bw-doc-slider-editor");
  slideshow.dataset.sliderId=block.id;
  const title=el("strong","bw-doc-slider-label");title.contentEditable="false";title.textContent="ছবির স্লাইডশো · প্রতিটি ছবির নিচে নিজস্ব ক্যাপশন";
  slideshow.append(title);
  for(const [index,slide] of (block.slides||[]).entries()){
   const figure=makeFigure(slide.src,block.id+"-slide-"+index,slide.caption,slide.alt,slide.credit);
   figure.dataset.slideIndex=String(index);
   slideshow.append(figure);
  }
  return slideshow;
 }
 const p=el("p");textToInline(p,block.text);return p;
}
function inlineText(node:Node):string{
 if(node.nodeType===Node.TEXT_NODE)return node.textContent||"";
 if(node.nodeType!==Node.ELEMENT_NODE)return "";
 const element=node as HTMLElement;
 const tag=element.tagName;
 if(tag==="BR")return "\n";
 const inside=Array.from(node.childNodes).map(inlineText).join("");
 if(tag==="STRONG"||tag==="B")return "**"+inside+"**";
 if(tag==="EM"||tag==="I")return "*"+inside+"*";
 if(tag==="SPAN"&&/^(14|16|18|20|22|24|28|32)px$/.test(element.style.fontSize)){
  let content=inside;
  if(element.style.fontWeight==="700"||element.style.fontWeight==="bold")content="**"+content+"**";
  if(element.style.fontStyle==="italic")content="*"+content+"*";
  return "[[fs:"+parseInt(element.style.fontSize,10)+"]]"+content+"[[/fs]]";
 }
 if(tag==="A"){
  const link=element as HTMLAnchorElement;
  if(link.href.startsWith("https://"))return "["+inside+"]("+link.href+")";
 }
 return inside;
}
function readFigure(node:Element):{id:string;src:string;alt:string;caption:string;credit:string}{
 const figure=node as HTMLElement;
 const img=figure.querySelector("img");
 return {
  id:figure.dataset.blockId||crypto.randomUUID(),
  src:figure.dataset.src||"",
  alt:img?.alt||"",
  caption:figure.querySelector("figcaption")?.textContent?.trim()||"",
  credit:figure.querySelector(".bw-doc-credit")?.textContent?.trim()||""
 };
}
function extractBlocks(root:HTMLElement):StoryBlock[]{
 const collected:StoryBlock[]=[];
 const append=(block:Partial<StoryBlock>&{type:StoryBlockType})=>{
  const base=createStoryBlock(block.type,block.id||crypto.randomUUID());
  collected.push({...base,...block});
 };
 const paragraph=(node:Node)=>{
  const s=inlineText(node).trim();
  if(s)append({type:"paragraph",text:s});
 };
 const visit=(node:Node)=>{
  if(node.nodeType===Node.TEXT_NODE){paragraph(node);return;}
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  const e=node as HTMLElement,tag=e.tagName;
  if(tag==="SECTION"&&e.classList.contains("bw-doc-slider-editor")){
   const figures=Array.from(e.querySelectorAll(":scope > figure"));
   if(figures.length>=2)append({type:"slideshow",id:e.dataset.sliderId||crypto.randomUUID(),
     slides:figures.map(figure=>{const slide=readFigure(figure);return {src:slide.src,alt:slide.alt,caption:slide.caption,credit:slide.credit};})});
   return;
  }
  if(tag==="SECTION"&&e.classList.contains("bw-doc-gallery")){
   const pics=e.querySelectorAll(":scope > figure");
   if(pics.length===2){
    const a=readFigure(pics[0]),b=readFigure(pics[1]);
    append({type:"gallery",id:e.dataset.galleryId||a.id,src:a.src,src2:b.src,alt:a.alt,alt2:b.alt,caption:a.caption,caption2:b.caption,credit:a.credit});
   }return;
  }
  if(tag==="SECTION"&&e.classList.contains("bw-doc-split")){
   const figure=e.querySelector(":scope > figure");
   if(!figure)return;
   const a=readFigure(figure);
   const content=e.querySelector(".bw-doc-split-text");
   append({type:"split",id:a.id,src:a.src,alt:a.alt,caption:a.caption,credit:a.credit,
    layout:e.dataset.layout==="image-right"?"image-right":"image-left",text:content?inlineText(content).trim():""});
   return;
  }
  if(e.classList.contains("bw-doc-image-block")){
   const figure=e.querySelector("figure");if(!figure)return;
   const a=readFigure(figure);
   append({type:"image",...a,width:(["small","medium","full"].includes(e.dataset.width||"")?e.dataset.width:"full") as StoryBlock["width"],align:(["left","center","right"].includes(e.dataset.align||"")?e.dataset.align:"center") as StoryBlock["align"]});return;
  }
  if(tag==="FIGURE"){append({type:"image",...readFigure(e)});return;}
  if(tag==="H2"||tag==="H3"){
   append({type:tag==="H2"?"heading":"subheading",text:inlineText(e).trim()});return;
  }
  if(tag==="BLOCKQUOTE"){
   const type=e.dataset.kind==="callout"?"callout":"quote";
   const citation=e.querySelector("cite");
   const textNode=e.querySelector("p");
   const content=textNode?inlineText(textNode):Array.from(e.childNodes).filter(n=>n!==citation).map(inlineText).join("");
   append({type,id:e.dataset.calloutId||crypto.randomUUID(),text:content.trim(),
    credit:citation?.textContent?.trim()||"",
    tone:(["cream","gray","red"].includes(e.dataset.tone||"")?e.dataset.tone:"cream") as StoryBlock["tone"],
    borderColor:e.dataset.borderColor&&/^#[0-9a-fA-F]{6}$/.test(e.dataset.borderColor)?e.dataset.borderColor:""});
   return;
  }
  if(tag==="UL"||tag==="OL"){
   append({type:"list",text:Array.from(e.querySelectorAll(":scope > li")).map(inlineText).join("\n")});return;
  }
  if(tag==="HR"){append({type:"divider"});return;}
  if(tag==="P"){paragraph(e);return;}
  if(tag==="DIV"){
   if(e.children.length&&Array.from(e.children).some(child=>["DIV","P","FIGURE","H2","H3","BLOCKQUOTE","SECTION"].includes(child.tagName))){
    e.childNodes.forEach(visit);
   }else paragraph(e);
   return;
  }
  paragraph(e);
 };
 root.childNodes.forEach(visit);
 return collected.slice(0,100);
}

export function ArticleBodyEditor({initialBody="",initialCoverUrl=null}:{initialBody?:string;initialCoverUrl?:string|null}){
 const rootRef=useRef<HTMLDivElement>(null);
 const uploadsRef=useRef<HTMLDivElement>(null);
 const chooserRef=useRef<HTMLInputElement>(null);
 const rememberedSelection=useRef<Range|null>(null);
 const modeRef=useRef<ImageMode>("image");
 const targetSliderRef=useRef<string|null>(null);
 const styleRef=useRef<{bold:boolean;italic:boolean;fontSize:string}|null>(null);
 const previewCoverRef=useRef<string|null>(null);
 const blobUrls=useRef<string[]>([]);
 const [body,setBody]=useState(initialBody);
 const [imageCount,setImageCount]=useState(0);
 const [selectedImage,setSelectedImage]=useState<string|null>(null);
 const [selectedSlider,setSelectedSlider]=useState<string|null>(null);
 const [captionFigure,setCaptionFigure]=useState<string|null>(null);
 const [selectedCallout,setSelectedCallout]=useState<string|null>(null);
 const [message,setMessage]=useState("");
 const [paintActive,setPaintActive]=useState(false);
 const [copyMenu,setCopyMenu]=useState(false);
 const [preview,setPreview]=useState<{title:string;summary:string;category:string;body:string;cover:string|null}|null>(null);

 useEffect(()=>{
  const root=rootRef.current;if(!root)return;
  const blocks=parseRichBody(initialBody)||legacyStoryBlocks(initialBody);
  root.replaceChildren(...blocks.map(toDOM));
  if(!blocks.length)root.append(el("p"));
  setBody(serializeRichBody(blocks));
  setImageCount(blocks.reduce((n,b)=>n+(b.type==="gallery"?2:b.type==="slideshow"?(b.slides?.length||0):["image","split"].includes(b.type)?1:0),0));
  return ()=>{blobUrls.current.forEach(URL.revokeObjectURL);blobUrls.current=[];};
 },[initialBody]);

 const remember=()=>{
  const sel=window.getSelection(),root=rootRef.current;
  if(sel?.rangeCount&&root&&root.contains(sel.anchorNode))rememberedSelection.current=sel.getRangeAt(0).cloneRange();
 };
 const save=()=>{
  const root=rootRef.current;if(!root)return;
  // Removed photos must not be sent to Supabase.
  const active=new Set(Array.from(root.querySelectorAll("figure[data-block-id]")).map(n=>(n as HTMLElement).dataset.blockId));
  uploadsRef.current?.querySelectorAll('input[type="file"]').forEach(input=>{
   if(!active.has((input as HTMLInputElement).dataset.blockId))input.remove();
  });
  const blocks=extractBlocks(root);
  setBody(serializeRichBody(blocks));
  setImageCount(blocks.reduce((n,b)=>n+(b.type==="gallery"?2:b.type==="slideshow"?(b.slides?.length||0):["image","split"].includes(b.type)?1:0),0));
 };
 const focusEditor=()=>{
  const root=rootRef.current;if(!root)return;
  root.focus();
  const current=rememberedSelection.current;
  const sel=window.getSelection();if(!sel)return;
  if(current&&root.contains(current.commonAncestorContainer)){
   sel.removeAllRanges();sel.addRange(current);return;
  }
  const range=document.createRange();range.selectNodeContents(root);range.collapse(false);
  sel.removeAllRanges();sel.addRange(range);
 };
 const insertNode=(node:HTMLElement)=>{
  const root=rootRef.current;if(!root)return;
  const saved=rememberedSelection.current;
  // Restore the exact saved caret after the browser file picker steals focus.
  const range=(saved&&root.contains(saved.commonAncestorContainer))
   ?saved.cloneRange():document.createRange();
  if(!(saved&&root.contains(saved.commonAncestorContainer))){
   range.selectNodeContents(root);range.collapse(false);
  }
  if(!range.collapsed){range.deleteContents();range.collapse(true);}
  let block:Node|null=range.startContainer;
  while(block&&block.parentNode!==root)block=block.parentNode;
  let after:HTMLElement;
  if(block instanceof HTMLElement&&(["P","H2","H3"].includes(block.tagName)||
    (block.tagName==="DIV"&&!block.matches(".bw-doc-image-block")&&!block.querySelector("figure,section,blockquote,p,h2,h3")))){
   const tail=document.createRange();
   tail.setStart(range.startContainer,range.startOffset);
   tail.setEnd(block,block.childNodes.length);
   const remainder=tail.extractContents();
   after=block.cloneNode(false) as HTMLElement;
   after.append(remainder);
   if(!after.hasChildNodes())after.append(el("br"));
   root.insertBefore(node,block.nextSibling);
   root.insertBefore(after,node.nextSibling);
  }else if(range.startContainer===root){
   root.insertBefore(node,root.childNodes[range.startOffset]||null);
   after=el("p");after.append(el("br"));root.insertBefore(after,node.nextSibling);
  }else if(block&&block.parentNode===root){
   root.insertBefore(node,block.nextSibling);
   after=el("p");after.append(el("br"));root.insertBefore(after,node.nextSibling);
  }else{
   root.append(node);
   after=el("p");after.append(el("br"));root.append(after);
  }
  root.focus();
  const selection=window.getSelection(),next=document.createRange();
  next.selectNodeContents(after);next.collapse(true);
  selection?.removeAllRanges();selection?.addRange(next);
  rememberedSelection.current=next.cloneRange();
  save();
 };
 const command=(name:string,value?:string)=>{
  focusEditor();
  document.execCommand(name,false,value);
  save();remember();
 };
 const formatBlock=(tag:"p"|"h2"|"h3")=>command("formatBlock","<"+tag+">");
 const applyFontSize=(value:string)=>{
  if(!/^(14|16|18|20|22|24|28|32)$/.test(value))return;
  focusEditor();
  const selection=window.getSelection(),root=rootRef.current;
  if(!root||!selection?.rangeCount||selection.isCollapsed||!root.contains(selection.anchorNode)){
   setMessage("ফন্টের আকার বদলাতে আগে লেখার অংশ সিলেক্ট করুন।");return;
  }
  const range=selection.getRangeAt(0);
  const span=el("span");span.style.fontSize=value+"px";
  span.append(range.extractContents());range.insertNode(span);
  const next=document.createRange();next.selectNodeContents(span);
  selection.removeAllRanges();selection.addRange(next);
  save();remember();
 };
 const collectCopy=():{html:string;plain:string;markdown:string}=>{
  const root=rootRef.current;
  const blocks=root?extractBlocks(root):[];
  const safe=el("div");
  safe.replaceChildren(...blocks.map(toDOM));
  const markdown=blocks.map(b=>{
   if(b.type==="heading")return "## "+b.text;
   if(b.type==="subheading")return "### "+b.text;
   if(b.type==="quote")return "> "+b.text+(b.credit?"\n> "+b.credit:"");
   if(b.type==="list")return b.text.split("\n").map(s=>"- "+s).join("\n");
   if(b.type==="divider")return "---";
   if(b.type==="slideshow")return (b.slides||[]).map(s=>s.caption||s.alt).filter(Boolean).join("\n");
   if(["image","gallery","split","slideshow"].includes(b.type))return [b.caption,b.caption2,b.text].filter(Boolean).join("\n");
   return b.text;
  }).join("\n\n");
  return {html:safe.innerHTML,plain:root?.innerText||"",markdown};
 };
 const copyAs=async(mode:"rich"|"plain"|"markdown")=>{
  const content=collectCopy();
  try{
   if(mode==="rich"){
    if(!navigator.clipboard.write||typeof ClipboardItem==="undefined")throw Error("no rich clipboard");
    await navigator.clipboard.write([new ClipboardItem({
     "text/html":new Blob([content.html],{type:"text/html"}),
     "text/plain":new Blob([content.plain],{type:"text/plain"})
    })]);
   }else await navigator.clipboard.writeText(mode==="plain"?content.plain:content.markdown);
   setMessage(mode==="rich"?"ফরম্যাটসহ কপি হয়েছে।":mode==="plain"?"সাধারণ টেক্সট কপি হয়েছে।":"Markdown কপি হয়েছে।");
  }catch{setMessage("কপি করার অনুমতি পাওয়া যায়নি। HTTPS পেজে ব্রাউজারের Clipboard permission পরীক্ষা করুন।");}
 };
 const copyFormatting=()=>{
  const selection=window.getSelection(),root=rootRef.current;
  if(!selection?.rangeCount||!root||!root.contains(selection.anchorNode)){
   setMessage("যে লেখার ফরম্যাট কপি করবেন, প্রথমে সেখানে কার্সর রাখুন।");return;
  }
  const node=selection.anchorNode;
  const element=node?.nodeType===Node.TEXT_NODE?node.parentElement:node as HTMLElement|null;
  if(!element)return;
  const computed=window.getComputedStyle(element);
  styleRef.current={
   bold:computed.fontWeight==="bold"||Number(computed.fontWeight)>=600,
   italic:computed.fontStyle==="italic",fontSize:computed.fontSize
  };
  setPaintActive(true);
  setMessage("পেইন্ট ফরম্যাট চালু। অন্য লেখা সিলেক্ট করলে একই ফরম্যাট বসবে।");
 };
 const paintSelection=()=>{
  const styling=styleRef.current,root=rootRef.current,sel=window.getSelection();
  if(!styling||!root||!sel?.rangeCount||sel.isCollapsed||!root.contains(sel.anchorNode))return;
  const range=sel.getRangeAt(0);
  if(!root.contains(range.commonAncestorContainer))return;
  const n=parseInt(styling.fontSize,10);
  const allowed=[14,16,18,20,22,24,28,32];
  const nearest=allowed.reduce((a,b)=>Math.abs(b-n)<Math.abs(a-n)?b:a,18);
  const fragment=range.extractContents();
  const span=el("span");span.style.fontSize=String(nearest)+"px";
  span.style.fontWeight=styling.bold?"700":"400";
  span.style.fontStyle=styling.italic?"italic":"normal";
  span.append(fragment);range.insertNode(span);sel.removeAllRanges();
  const caret=document.createRange();caret.setStartAfter(span);caret.collapse(true);
  sel.addRange(caret);rememberedSelection.current=caret.cloneRange();
  setPaintActive(false);setMessage("পেইন্ট ফরম্যাট প্রয়োগ হয়েছে।");save();
 };
 const openDraftPreview=()=>{
  const root=rootRef.current,form=root?.closest("form");
  if(!root||!form)return;
  const value=(name:string)=>(form.elements.namedItem(name) as HTMLInputElement|HTMLTextAreaElement|null)?.value||"";
  const category=form.elements.namedItem("category_id") as HTMLSelectElement|null;
  const blocks=extractBlocks(root).map(block=>{
   const next={...block};
   const getLocal=(id:string)=>{
    const figure=Array.from(root.querySelectorAll("figure[data-block-id]"))
      .find(f=>(f as HTMLElement).dataset.blockId===id);
    const url=figure?.querySelector("img")?.getAttribute("src")||"";
    return url.startsWith("blob:")?url:"";
   };
   if(!next.src)next.src=getLocal(block.id);
   if(block.type==="gallery"&&!next.src2)next.src2=getLocal(block.id+"-second");
   if(block.type==="slideshow")next.slides=(next.slides||[]).map((slide,i)=>({...slide,src:slide.src||getLocal(block.id+"-slide-"+i)}));
   return next;
  });
  const imageFile=(form.elements.namedItem("image_file") as HTMLInputElement|null)?.files?.[0]||null;
  if(previewCoverRef.current){URL.revokeObjectURL(previewCoverRef.current);previewCoverRef.current=null;}
  const cover=imageFile?URL.createObjectURL(imageFile):initialCoverUrl;
  if(cover)previewCoverRef.current=cover;
  setPreview({title:value("headline")||"সংবাদের শিরোনাম",
   summary:value("summary"),category:category?.selectedOptions[0]?.textContent||"সংবাদ",
   body:serializeRichBody(blocks),cover});
 };
 useEffect(()=>{
  const show=()=>openDraftPreview();
  window.addEventListener("bw:open-draft-preview",show);
  return ()=>window.removeEventListener("bw:open-draft-preview",show);
 });
 const closeDraftPreview=()=>{
  setPreview(null);
  if(previewCoverRef.current){URL.revokeObjectURL(previewCoverRef.current);previewCoverRef.current=null;}
 };
 const applyQuote=(kind:"quote"|"callout")=>{
  focusEditor();
  document.execCommand("formatBlock",false,"<blockquote>");
  const selection=window.getSelection();let target=selection?.anchorNode as Node|null;
  while(target&&target.nodeType===1&&(target as HTMLElement).tagName!=="BLOCKQUOTE"&&target.parentNode)target=target.parentNode;
  if(target?.nodeType!==1||(target as HTMLElement).tagName!=="BLOCKQUOTE"){
   target=(selection?.anchorNode?.parentElement?.closest("blockquote"))||null;
  }
  const quote=target as HTMLElement|null;
  if(quote&&quote.tagName==="BLOCKQUOTE"){
   quote.className=kind==="quote"?"bw-doc-pullquote":"bw-doc-highlight";
   quote.dataset.kind=kind;
   if(!quote.dataset.calloutId)quote.dataset.calloutId=crypto.randomUUID();
   if(kind==="quote"&&!quote.querySelector("cite")){
    const cite=el("cite");cite.contentEditable="true";cite.dataset.placeholder="উদ্ধৃতির ব্যক্তির নাম ও পদবি";
    quote.append(cite);
   }
  }else{
   const q=toDOM(createStoryBlock(kind,crypto.randomUUID()));insertNode(q);
  }
  save();remember();
 };
 const addImage=(mode:ImageMode)=>{
  modeRef.current=mode;
  if(mode==="slide-add")targetSliderRef.current=selectedSlider;
  const chooser=chooserRef.current;if(!chooser)return;
  chooser.multiple=mode==="gallery"||mode==="slideshow"||mode==="slide-add";
  remember();chooser.click();
 };
 const registerFile=(file:File,id:string)=>{
  const chooser=chooserRef.current,rack=uploadsRef.current;
  if(!chooser||!rack)return;
  const hidden=el("input");hidden.type="file";hidden.name="inline_image_"+id;
  hidden.dataset.blockId=id;hidden.className="bw-doc-hidden-file";hidden.tabIndex=-1;
  const dt=new DataTransfer();dt.items.add(file);hidden.files=dt.files;rack.append(hidden);
 };
 const attachFile=(file:File)=>{
  if(!ACCEPTED.includes(file.type)||file.size>MAX_IMAGE_BYTES){setMessage("প্রতিটি ছবি JPG, PNG, WebP বা AVIF হতে হবে এবং সর্বোচ্চ ৪ MB।");return null;}
  const id=crypto.randomUUID();
  const url=URL.createObjectURL(file);blobUrls.current.push(url);
  registerFile(file,id);
  const figure=makeFigure("",id,"","", "");
  const image=figure.querySelector("img");
  if(image){image.src=url;delete image.dataset.awaitingUpload;}
  return figure;
 };
 const handleFiles=(files:FileList|null)=>{
  if(!files?.length)return;
  const mode=modeRef.current;
  const current=rootRef.current?.querySelectorAll("figure[data-block-id]").length||0;
  if(current+files.length>100){setMessage("সর্বোচ্চ ১০০টি কনটেন্ট ব্লক রাখা যাবে।");return;}
  if(mode==="gallery"&&files.length!==2){setMessage("পাশাপাশি ছবির জন্য একবারে ঠিক ২টি ছবি নির্বাচন করুন।");return;}
  if(mode==="slideshow"&&(files.length<2||files.length>6)){setMessage("স্লাইডশোতে একবারে ২-৬টি ছবি নির্বাচন করুন।");return;}
  if(Array.from(files).some(f=>!ACCEPTED.includes(f.type)||f.size>MAX_IMAGE_BYTES)){setMessage("JPG, PNG, WebP বা AVIF ছবি দিন, প্রতিটি সর্বোচ্চ ৪ MB।");return;}
  const selected=Array.from(files).slice(0,mode==="gallery"?2:mode==="slideshow"||mode==="slide-add"?6:1);
  const queued=uploadsRef.current?.querySelectorAll('input[type="file"]').length||0;
  if(queued+selected.length>6){setMessage("একবারে সর্বোচ্চ ৬টি নতুন ছবি আপলোড করা যায়। আগে খসড়া সংরক্ষণ করে তারপর আরও ছবি যোগ করুন।");return;}
  const figures=selected.map(attachFile).filter((x):x is HTMLElement=>Boolean(x));
  if(!figures.length)return;
  if(mode==="slide-add"){
   const root=rootRef.current;
   const group=Array.from(root?.querySelectorAll(".bw-doc-slider-editor")||[])
     .find(node=>(node as HTMLElement).dataset.sliderId===targetSliderRef.current) as HTMLElement|undefined;
   if(!group){setMessage("প্রথমে স্লাইডশোতে ক্লিক করুন।");return;}
   const id=group.dataset.sliderId||"",count=group.querySelectorAll(":scope > figure").length;
   if(count+figures.length>12){setMessage("একটি স্লাইডশোতে সর্বোচ্চ ১২টি ছবি রাখা যাবে।");return;}
   figures.forEach((figure,i)=>{
    const original=figure.dataset.blockId;
    const input=Array.from(uploadsRef.current?.querySelectorAll('input[type="file"]')||[])
      .find(x=>(x as HTMLInputElement).dataset.blockId===original) as HTMLInputElement|undefined;
    const index=count+i;
    if(input){input.name="inline_image_"+id+"_slide_"+index;input.dataset.blockId=id+"-slide-"+index;}
    figure.dataset.blockId=id+"-slide-"+index;figure.dataset.slideIndex=String(index);group.append(figure);
   });
   save();setMessage("নতুন ছবি স্লাইডশোতে যুক্ত হয়েছে। প্রতিটি ছবির নিচে ক্যাপশন দিন।");return;
  }
  let wrap:HTMLElement;
  if(mode==="split"){
   wrap=el("section","bw-doc-split");wrap.dataset.layout="image-left";wrap.append(figures[0]);
   const copy=el("div","bw-doc-split-text");const p=el("p");p.dataset.placeholder="ছবির পাশে এখানে লিখুন";copy.append(p);wrap.append(copy);
  }else if(mode==="slideshow"){
   const id=crypto.randomUUID();
   wrap=el("section","bw-doc-slider-editor");
   wrap.dataset.sliderId=id;
   const heading=el("strong","bw-doc-slider-label");
   heading.contentEditable="false";heading.textContent="স্লাইডশো · প্রতিটি ছবির আলাদা ক্যাপশন";
   wrap.append(heading);
   figures.forEach((figure,i)=>{
    const original=figure.dataset.blockId;
    const input=Array.from(uploadsRef.current?.querySelectorAll('input[type="file"]')||[])
     .find(x=>(x as HTMLInputElement).dataset.blockId===original) as HTMLInputElement|undefined;
    if(input){input.name="inline_image_"+id+"_slide_"+i;input.dataset.blockId=id+"-slide-"+i;}
    figure.dataset.blockId=id+"-slide-"+i;
    figure.dataset.slideIndex=String(i);
    wrap.append(figure);
   });
  }else if(mode==="gallery"){
   const firstId=figures[0].dataset.blockId||crypto.randomUUID();
   const secondOldId=figures[1].dataset.blockId||"";
   const secondInput=Array.from(uploadsRef.current?.querySelectorAll('input[type="file"]')||[])
    .find(input=>(input as HTMLInputElement).dataset.blockId===secondOldId) as HTMLInputElement|undefined;
   if(secondInput){secondInput.name="inline_image_"+firstId+"_second";secondInput.dataset.blockId=firstId+"-second";}
   figures[1].dataset.blockId=firstId+"-second";
   wrap=el("section","bw-doc-gallery");wrap.dataset.galleryId=firstId;figures.forEach(f=>wrap.append(f));
  }else{
   wrap=el("div","bw-doc-image-block");wrap.dataset.width="full";wrap.dataset.align="center";wrap.append(figures[0]);
  }
  insertNode(wrap);setMessage("ছবি যুক্ত হয়েছে। ক্যাপশন চাইলে ছবির নিচে লিখুন।");
 };
 const insertImageUrl=()=>{
  const raw=window.prompt("ছবির HTTPS লিংক দিন:");
  if(!raw)return;
  const url=safeStoryImageUrl(raw.trim());
  if(!url){setMessage("বৈধ HTTPS ছবির লিংক দিন।");return;}
  const div=el("div","bw-doc-image-block");div.dataset.width="full";div.dataset.align="center";
  div.append(makeFigure(url,crypto.randomUUID()));insertNode(div);
 };
 const addDivider=()=>insertNode(el("hr"));
 const focusCaption=()=>{
  const root=rootRef.current;if(!root||!captionFigure)return;
  const figure=Array.from(root.querySelectorAll("figure[data-block-id]"))
    .find(e=>(e as HTMLElement).dataset.blockId===captionFigure);
  const caption=figure?.querySelector("figcaption") as HTMLElement|null;
  if(!caption)return;
  if(!caption.textContent?.trim())caption.replaceChildren();
  caption.focus();caption.scrollIntoView({block:"nearest",behavior:"smooth"});
 };
 const changeCalloutBorder=(hex:string)=>{
  const root=rootRef.current;
  if(!root||!selectedCallout||!/^#[0-9a-fA-F]{6}$/.test(hex))return;
  const callout=Array.from(root.querySelectorAll(".bw-doc-highlight"))
    .find(node=>(node as HTMLElement).dataset.calloutId===selectedCallout) as HTMLElement|undefined;
  if(!callout)return;
  callout.dataset.borderColor=hex;callout.style.borderLeftColor=hex;save();
 };
 const changeImage=(attribute:"width"|"align",value:string)=>{
  const root=rootRef.current;if(!root||!selectedImage)return;
  const target=Array.from(root.querySelectorAll(".bw-doc-image-block")).find(element=>element.querySelector("figure")?.getAttribute("data-block-id")===selectedImage) as HTMLElement|undefined;
  if(!target)return;
  target.dataset[attribute]=value;
  save();
 };
 return <section className="bw-doc-editor full-span" aria-label="এক জায়গায় সংবাদ লেখা ও সাজানো">
  <div className="bw-doc-head">
   <div><h2>সম্পূর্ণ সংবাদ</h2><p>Google Docs-এর মতো এক জায়গায় লিখুন বা পুরো সংবাদ পেস্ট করুন। লেখা নির্বাচন করে ফরম্যাট করুন, প্রয়োজনের জায়গায় ছবি বা উদ্ধৃতি বসান।</p></div>
   <span className="bw-doc-counter">{imageCount}টি ছবি</span>
  </div>
  <div className="bw-doc-toolbar" role="toolbar" aria-label="সংবাদের ফরম্যাটিং">
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command("bold")} title="বোল্ড"><strong>B</strong></button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command("italic")} title="ইটালিক"><em>I</em></button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>formatBlock("p")}>সাধারণ</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>formatBlock("h2")}>শিরোনাম</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>formatBlock("h3")}>উপশিরোনাম</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command("insertUnorderedList")}>• তালিকা</button>
   <label className="bw-doc-font-label">ফন্ট
    <select aria-label="নির্বাচিত লেখার ফন্ট সাইজ" defaultValue="18" onMouseDown={e=>e.stopPropagation()}
     onChange={e=>{applyFontSize(e.target.value);}}>
     {[14,16,18,20,22,24,28,32].map(size=><option key={size} value={size}>{size}px</option>)}
    </select>
   </label>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>{
    const link=window.prompt("HTTPS লিংক দিন:");if(link?.startsWith("https://"))command("createLink",link);
   }}>লিংক</button>
   <span className="bw-doc-toolbar-separator" aria-hidden="true"/>
   <button type="button" className="bw-doc-tool-accent" onMouseDown={e=>e.preventDefault()} onClick={()=>addImage("image")}>＋ ছবি</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>addImage("split")}>ছবি ও লেখা</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>addImage("gallery")}>২ ছবি</button>
   <button type="button" className="bw-doc-tool-accent" onMouseDown={e=>e.preventDefault()} onClick={()=>addImage("slideshow")}>▧ স্লাইডশো</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={insertImageUrl} title="ছবির URL থেকে যোগ করুন">ছবির URL</button>
   <span className="bw-doc-toolbar-separator" aria-hidden="true"/>
   <button type="button" className="bw-doc-tool-accent" onMouseDown={e=>e.preventDefault()} onClick={()=>applyQuote("quote")}>❝ বড় উদ্ধৃতি</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>applyQuote("callout")}>হাইলাইট বক্স</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={addDivider}>রেখা</button>
   <span className="bw-doc-toolbar-separator" aria-hidden="true"/>
   <div className="bw-doc-copy-menu">
    <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>setCopyMenu(v=>!v)} aria-expanded={copyMenu}>কপি ▾</button>
    {copyMenu&&<div className="bw-doc-copy-options">
     <button type="button" onClick={()=>{void copyAs("rich");setCopyMenu(false);}}>ফরম্যাটসহ কপি</button>
     <button type="button" onClick={()=>{void copyAs("plain");setCopyMenu(false);}}>Plain Text</button>
     <button type="button" onClick={()=>{void copyAs("markdown");setCopyMenu(false);}}>Markdown</button>
    </div>}
   </div>
   <button type="button" className={paintActive?"bw-doc-painter is-active":"bw-doc-painter"}
     onMouseDown={e=>e.preventDefault()} onClick={()=>paintActive?setPaintActive(false):copyFormatting()}
     aria-pressed={paintActive} title="পেইন্ট ফরম্যাট: উৎস লেখায় কার্সর রেখে চাপুন, তারপর অন্য লেখা সিলেক্ট করুন">🖌 ফরম্যাট</button>
   <button type="button" className="bw-doc-preview-action" onMouseDown={e=>e.preventDefault()} onClick={openDraftPreview}>◉ প্রকাশের আগে প্রিভিউ</button>
  </div>
  {captionFigure&&<div className="bw-doc-caption-controls">
    <button type="button" onClick={focusCaption}>✎ ছবির ক্যাপশন লিখুন / ফিরিয়ে আনুন</button>
    <button type="button" onClick={()=>setCaptionFigure(null)} aria-label="ক্যাপশন টুল বন্ধ করুন">✕</button>
   </div>}
  {selectedCallout&&<div className="bw-doc-highlight-controls" aria-label="হাইলাইট বক্সের বর্ডারের রং">
    <strong>বাম রেখার রং</strong>
    <button type="button" onClick={()=>changeCalloutBorder("#0b4838")}>সবুজ</button>
    <button type="button" onClick={()=>changeCalloutBorder("#d4a017")}>হলুদ</button>
    <button type="button" onClick={()=>changeCalloutBorder("#c53c32")}>লাল</button>
    <label>নিজের রং <input type="color" defaultValue="#0b4838" onChange={e=>changeCalloutBorder(e.target.value)}/></label>
    <button type="button" onClick={()=>setSelectedCallout(null)}>✕</button>
   </div>}
  {selectedSlider&&<div className="bw-doc-slider-controls" aria-label="স্লাইডশো ছবি যোগ">
    <strong>স্লাইডশো নির্বাচন করা হয়েছে</strong>
    <button type="button" onClick={()=>addImage("slide-add")}>＋ নতুন স্লাইড যোগ করুন</button>
    <button type="button" onClick={()=>setSelectedSlider(null)}>✕</button>
   </div>}
  {selectedImage&&<div className="bw-doc-image-controls" aria-label="ছবির সাইজ ও অবস্থান">
    <span>নির্বাচিত ছবি:</span>
    <button type="button" onClick={()=>changeImage("width","small")}>ছোট</button>
    <button type="button" onClick={()=>changeImage("width","medium")}>মাঝারি</button>
    <button type="button" onClick={()=>changeImage("width","full")}>পূর্ণ প্রস্থ</button>
    <span className="bw-doc-toolbar-separator"/>
    <button type="button" onClick={()=>changeImage("align","left")}>বামে</button>
    <button type="button" onClick={()=>changeImage("align","center")}>মাঝে</button>
    <button type="button" onClick={()=>changeImage("align","right")}>ডানে</button>
    <button type="button" onClick={()=>setSelectedImage(null)} aria-label="ছবির সেটিংস বন্ধ করুন">✕</button>
   </div>}
  <div ref={rootRef} className="bw-doc-surface" contentEditable suppressContentEditableWarning
    data-placeholder="এখানে সম্পূর্ণ সংবাদ লিখুন বা পেস্ট করুন…"
    role="textbox" aria-label="সংবাদের মূল লেখা" aria-multiline="true"
    onInput={save} onBlurCapture={event=>{
      const target=event.target;
      if(target instanceof HTMLElement&&target.tagName==="FIGCAPTION"&&!target.textContent?.trim()){
       // Empty captions can retain invisible <br> after focus leaves.
       // Clear that stray node so the placeholder remains clickable.
       target.replaceChildren();save();
      }
    }} onBlur={()=>{save();const root=rootRef.current;window.dispatchEvent(new CustomEvent("bw:article-editor-blur",{detail:{body:root?serializeRichBody(extractBlocks(root)):""}}));}} onMouseUp={()=>paintActive?paintSelection():remember()} onKeyUp={()=>paintActive?paintSelection():remember()}
    onClick={event=>{
      const target=event.target;
      if(!(target instanceof Element))return;
      const wrap=target.closest(".bw-doc-image-block");
      const figure=wrap?.querySelector("figure[data-block-id]");
      setSelectedImage(figure?.getAttribute("data-block-id")||null);
      const clickedFigure=target.closest("figure[data-block-id]") as HTMLElement|null;
      setCaptionFigure(clickedFigure?.dataset.blockId||null);
      const group=target.closest(".bw-doc-slider-editor") as HTMLElement|null;
      setSelectedSlider(group?.dataset.sliderId||null);
      const callout=target.closest(".bw-doc-highlight") as HTMLElement|null;
      setSelectedCallout(callout?.dataset.calloutId||null);
    }}
    onPaste={event=>{
      // Treat pasted outside HTML as plain editorial text, never executable markup.
      event.preventDefault();
      document.execCommand("insertText",false,event.clipboardData.getData("text/plain"));
      save();
    }}
    onDrop={event=>{
      if(event.dataTransfer.files.length){
       event.preventDefault();handleFiles(event.dataTransfer.files);
      }
    }}
  />
  <input type="hidden" name="body" value={body} readOnly/>
  <input ref={chooserRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,.avif"
   className="bw-doc-hidden-file" aria-label="সংবাদের মধ্যে ছবি নির্বাচন"
   onChange={event=>{handleFiles(event.currentTarget.files);event.currentTarget.value="";}}/>
  <div ref={uploadsRef} className="bw-doc-file-rack" aria-hidden="true"/>
  {message&&<p className="bw-doc-message" role="status">{message}</p>}
  {preview&&<div className="bw-doc-preview-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)closeDraftPreview();}}>
    <div className="bw-doc-preview-modal" role="dialog" aria-modal="true" aria-label="সংবাদ প্রকাশের আগের প্রিভিউ">
      <div className="bw-doc-preview-head">
       <strong>সংবাদ প্রিভিউ · এখনো প্রকাশিত হয়নি</strong>
       <button type="button" onClick={closeDraftPreview} aria-label="প্রিভিউ বন্ধ করুন">✕ বন্ধ করুন</button>
      </div>
      <div className="bw-doc-preview-content bw-website">
       <article className="bw-article">
        <span className="bw-tag">{preview.category}</span>
        <h1>{preview.title}</h1>
        {preview.summary&&<p className="bw-article-deck">{preview.summary}</p>}
        <div className="bw-article-byline">Bengal Wave · প্রকাশের আগের অস্থায়ী প্রিভিউ</div>
        {preview.cover&&<figure className="bw-doc-preview-cover"><img src={preview.cover} alt="মূল সংবাদ ছবি"/></figure>}
        <RichArticleBody body={preview.body} allowLocalImages/>
       </article>
      </div>
    </div>
   </div>}
  <p className="bw-doc-help"><strong>বড় উদ্ধৃতি:</strong> উদ্ধৃতির অনুচ্ছেদে কার্সর রেখে ‘❝ বড় উদ্ধৃতি’ চাপুন। নিচে বক্তার পরিচয় লিখুন। <strong>ছবির সাইজ:</strong> ছবিতে ক্লিক করে ছোট, মাঝারি বা পূর্ণ প্রস্থ বেছে নিন।</p>
 </section>;
}
