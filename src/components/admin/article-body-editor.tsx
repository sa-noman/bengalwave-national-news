"use client";

import {useEffect,useRef,useState} from "react";
import {createStoryBlock,legacyStoryBlocks,parseRichBody,safeStoryImageUrl,serializeRichBody} from "@/lib/rich-article";
import type {StoryBlock,StoryBlockType} from "@/lib/rich-article";

const MAX_IMAGE_BYTES=4*1024*1024;
const ACCEPTED=["image/jpeg","image/png","image/webp","image/avif"];
type ImageMode="image"|"split"|"gallery";
function el<K extends keyof HTMLElementTagNameMap>(tag:K,className?:string){
 const node=document.createElement(tag);if(className)node.className=className;return node;
}
function textToInline(parent:HTMLElement,raw:string){
 // Legacy stored stories use a very small Markdown subset, never raw HTML.
 const parts=raw.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\(https:\/\/[^\s)]+\))/g);
 for(const part of parts){
  if(!part)continue;
  let child:HTMLElement|undefined;
  if(part.startsWith("**")&&part.endsWith("**")){
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
  if(tag==="callout")q.dataset.tone=block.tone;
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
   append({type,text:content.trim(),
    credit:citation?.textContent?.trim()||"",
    tone:(["cream","gray","red"].includes(e.dataset.tone||"")?e.dataset.tone:"cream") as StoryBlock["tone"]});
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

export function ArticleBodyEditor({initialBody=""}:{initialBody?:string}){
 const rootRef=useRef<HTMLDivElement>(null);
 const uploadsRef=useRef<HTMLDivElement>(null);
 const chooserRef=useRef<HTMLInputElement>(null);
 const rememberedSelection=useRef<Range|null>(null);
 const modeRef=useRef<ImageMode>("image");
 const blobUrls=useRef<string[]>([]);
 const [body,setBody]=useState(initialBody);
 const [imageCount,setImageCount]=useState(0);
 const [selectedImage,setSelectedImage]=useState<string|null>(null);
 const [message,setMessage]=useState("");

 useEffect(()=>{
  const root=rootRef.current;if(!root)return;
  const blocks=parseRichBody(initialBody)||legacyStoryBlocks(initialBody);
  root.replaceChildren(...blocks.map(toDOM));
  if(!blocks.length)root.append(el("p"));
  setBody(serializeRichBody(blocks));
  setImageCount(blocks.reduce((n,b)=>n+(b.type==="gallery"?2:["image","split"].includes(b.type)?1:0),0));
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
  setImageCount(blocks.reduce((n,b)=>n+(b.type==="gallery"?2:["image","split"].includes(b.type)?1:0),0));
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
  focusEditor();
  const selection=window.getSelection();
  if(!selection||!selection.rangeCount){root.append(node);save();return;}
  const range=selection.getRangeAt(0);
  // Insert a block at the nearest top-level boundary for valid editable HTML.
  let block:Node|null=range.startContainer;
  while(block&&block.parentNode!==root)block=block.parentNode;
  if(block&&block.parentNode===root){
   if(!range.collapsed)range.deleteContents();
   root.insertBefore(node,block.nextSibling);
  }else root.append(node);
  const after=el("p");after.append(el("br"));node.after(after);
  const next=document.createRange();next.selectNodeContents(after);next.collapse(true);
  selection.removeAllRanges();selection.addRange(next);
  rememberedSelection.current=next.cloneRange();
  save();
 };
 const command=(name:string,value?:string)=>{
  focusEditor();
  document.execCommand(name,false,value);
  save();remember();
 };
 const formatBlock=(tag:"p"|"h2"|"h3")=>command("formatBlock","<"+tag+">");
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
  const chooser=chooserRef.current;if(!chooser)return;
  chooser.multiple=mode==="gallery";
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
  if(current+(mode==="gallery"?2:1)>100){setMessage("সর্বোচ্চ ১০০টি কনটেন্ট ব্লক রাখা যাবে।");return;}
  if(mode==="gallery"&&files.length!==2){setMessage("পাশাপাশি ছবির জন্য একবারে ঠিক ২টি ছবি নির্বাচন করুন।");return;}
  if(Array.from(files).some(f=>!ACCEPTED.includes(f.type)||f.size>MAX_IMAGE_BYTES)){setMessage("JPG, PNG, WebP বা AVIF ছবি দিন, প্রতিটি সর্বোচ্চ ৪ MB।");return;}
  const selected=Array.from(files).slice(0,mode==="gallery"?2:1);
  const queued=uploadsRef.current?.querySelectorAll('input[type="file"]').length||0;
  if(queued+selected.length>6){setMessage("একবারে সর্বোচ্চ ৬টি নতুন ছবি আপলোড করা যায়। আগে খসড়া সংরক্ষণ করে তারপর আরও ছবি যোগ করুন।");return;}
  const figures=selected.map(attachFile).filter((x):x is HTMLElement=>Boolean(x));
  if(!figures.length)return;
  let wrap:HTMLElement;
  if(mode==="split"){
   wrap=el("section","bw-doc-split");wrap.dataset.layout="image-left";wrap.append(figures[0]);
   const copy=el("div","bw-doc-split-text");const p=el("p");p.dataset.placeholder="ছবির পাশে এখানে লিখুন";copy.append(p);wrap.append(copy);
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
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>{
    const link=window.prompt("HTTPS লিংক দিন:");if(link?.startsWith("https://"))command("createLink",link);
   }}>লিংক</button>
   <span className="bw-doc-toolbar-separator" aria-hidden="true"/>
   <button type="button" className="bw-doc-tool-accent" onMouseDown={e=>e.preventDefault()} onClick={()=>addImage("image")}>＋ ছবি</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>addImage("split")}>ছবি ও লেখা</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>addImage("gallery")}>২ ছবি</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={insertImageUrl} title="ছবির URL থেকে যোগ করুন">ছবির URL</button>
   <span className="bw-doc-toolbar-separator" aria-hidden="true"/>
   <button type="button" className="bw-doc-tool-accent" onMouseDown={e=>e.preventDefault()} onClick={()=>applyQuote("quote")}>❝ বড় উদ্ধৃতি</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>applyQuote("callout")}>হাইলাইট বক্স</button>
   <button type="button" onMouseDown={e=>e.preventDefault()} onClick={addDivider}>রেখা</button>
  </div>
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
    onInput={save} onBlur={save} onMouseUp={remember} onKeyUp={remember}
    onClick={event=>{
      const target=event.target;
      if(!(target instanceof Element))return;
      const wrap=target.closest(".bw-doc-image-block");
      const figure=wrap?.querySelector("figure[data-block-id]");
      setSelectedImage(figure?.getAttribute("data-block-id")||null);
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
  <p className="bw-doc-help"><strong>বড় উদ্ধৃতি:</strong> উদ্ধৃতির অনুচ্ছেদে কার্সর রেখে ‘❝ বড় উদ্ধৃতি’ চাপুন। নিচে বক্তার পরিচয় লিখুন। <strong>ছবির সাইজ:</strong> ছবিতে ক্লিক করে ছোট, মাঝারি বা পূর্ণ প্রস্থ বেছে নিন।</p>
 </section>;
}
