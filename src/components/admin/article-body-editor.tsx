"use client";

import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {EditorContent,useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {TextStyleKit} from "@tiptap/extension-text-style";
import {NewsMediaNode,NewsCalloutNode} from "./newsroom-nodes";
import {NewsroomArticleBody} from "@/components/newsroom-article-body";
import {ArticleSource} from "@/components/article-source";
import {existingBodyToNewsJSON,serializeNewsroomBody} from "@/lib/newsroom-document";
import type {NewsJSON,NewsPhoto} from "@/lib/newsroom-document";

type Mode="image"|"gallery"|"slideshow"|"split";
const ACCEPT=["image/jpeg","image/png","image/webp","image/avif"];
const fontSizes=[14,16,18,20,22,24,28,32];
type Paint={bold:boolean;italic:boolean;underline:boolean;strike:boolean;fontSize?:string;color?:string;heading:number};
type Preview={title:string;summary:string;category:string;cover:string|null;body:string;sourceName:string;sourceUrl:string};
type LinkRange={from:number;to:number;text:string;href:string};

export function ArticleBodyEditor({initialBody="",initialCoverUrl=null}:{initialBody?:string;initialCoverUrl?:string|null}){
 const initial=useMemo(()=>existingBodyToNewsJSON(initialBody),[initialBody]);
 const [body,setBody]=useState(()=>serializeNewsroomBody(initial));
 const [copyOpen,setCopyOpen]=useState(false),[paintMode,setPaintMode]=useState(false);
 const [linkOpen,setLinkOpen]=useState(false),[linkText,setLinkText]=useState(""),[linkUrl,setLinkUrl]=useState(""),[linkError,setLinkError]=useState("");
 const [message,setMessage]=useState(""),[preview,setPreview]=useState<Preview|null>(null);
 const [restoreAvailable,setRestoreAvailable]=useState(false),[charCount,setCharCount]=useState(0);
 const rackRef=useRef<HTMLDivElement>(null),fileRef=useRef<HTMLInputElement>(null);
 const intent=useRef<{mode:Mode;mediaId?:string;position:number}|null>(null);
 const paintRef=useRef<Paint|null>(null),filesRef=useRef(new Map<string,string>());
 const coverRef=useRef<string|null>(null);
 const linkRange=useRef<LinkRange|null>(null);
 const draftKey=useRef("bw-newsroom-draft-new");
 const saveSnapshot=useCallback((doc:NewsJSON)=>{
  const value=serializeNewsroomBody(doc);
  setBody(value);
  const text=JSON.stringify(doc.content||[]);
  setCharCount(text.length?text.length:0);
  const used=new Set<string>();
  const traverse=(node:NewsJSON)=>{
   if(node.type==="newsMedia"){
    for(const image of (node.attrs?.photos||[]) as NewsPhoto[])used.add(image.id);
   }
   node.content?.forEach(traverse);
  };
  traverse(doc);
  for(const [id,url] of filesRef.current){
   if(used.has(id))continue;
   rackRef.current?.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach(input=>{
    if(input.dataset.photoId===id)input.remove();
   });
   URL.revokeObjectURL(url);filesRef.current.delete(id);
  }
  // Unsaved browser File objects cannot survive a page reload. Do not offer
  // to restore a draft whose photos would be broken blob URLs.
  try{
   if(filesRef.current.size>0)sessionStorage.removeItem(draftKey.current);
   else if(value.length<=80000)sessionStorage.setItem(draftKey.current,JSON.stringify({updated:Date.now(),value}));
  }catch{}
 },[]);

 const editor=useEditor({
  immediatelyRender:false,
  extensions:[
   StarterKit.configure({heading:{levels:[2,3]},link:{openOnClick:false}}),
   TextStyleKit,
   NewsMediaNode,NewsCalloutNode
  ],
  content:initial,
  editorProps:{
   attributes:{class:"bw-nr-editable",spellcheck:"true","aria-label":"সংবাদের মূল লেখা"},
   transformPastedText(text){return text.replace(/\r\n?/g,"\n").replace(/\n{3,}/g,"\n\n");}
  },
  onUpdate:({editor})=>saveSnapshot(editor.getJSON() as NewsJSON),
  onBlur:({editor})=>{
   window.dispatchEvent(new CustomEvent("bw:article-editor-blur",{detail:{body:serializeNewsroomBody(editor.getJSON() as NewsJSON)}}));
  }
 });

 useEffect(()=>{
  const form=rackRef.current?.closest("form");
  draftKey.current="bw-newsroom-draft-"+(form?.querySelector<HTMLInputElement>('input[name="id"]')?.value||"new");
  try{
   const saved=sessionStorage.getItem(draftKey.current);
   if(saved){
    const data=JSON.parse(saved) as {value:string;updated:number};
    if(Date.now()-data.updated<24*3600000 && data.value!==serializeNewsroomBody(initial))setRestoreAvailable(true);
   }
  }catch{}
 },[initial]);

 useEffect(()=>{
  const add=(event:Event)=>{
   const id=(event as CustomEvent<{mediaId:string}>).detail?.mediaId;
   if(!editor||!id)return;
   intent.current={mode:"slideshow",mediaId:id,position:editor.state.selection.from};
   if(fileRef.current){fileRef.current.multiple=true;fileRef.current.click();}
  };
  window.addEventListener("bw:nr-add-slide",add);
  return ()=>window.removeEventListener("bw:nr-add-slide",add);
 },[editor]);

 useEffect(()=>()=>{filesRef.current.forEach(URL.revokeObjectURL);if(coverRef.current)URL.revokeObjectURL(coverRef.current);},[]);

 useEffect(()=>{
  const open=()=>showPreview();
  window.addEventListener("bw:open-draft-preview",open);
  return ()=>window.removeEventListener("bw:open-draft-preview",open);
 });

 const register=(file:File):NewsPhoto=>{
  const id=crypto.randomUUID();
  const previewUrl=URL.createObjectURL(file);
  filesRef.current.set(id,previewUrl);
  const input=document.createElement("input");
  input.type="file";input.name="newsroom_media_"+id;input.dataset.photoId=id;
  input.style.display="none";
  const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;
  rackRef.current?.append(input);
  return {id,src:previewUrl,alt:"",caption:"",credit:""};
 };
 const promptPhotos=(mode:Mode)=>{
  if(!editor||!fileRef.current)return;
  intent.current={mode,position:editor.state.selection.from};
  fileRef.current.multiple=mode==="gallery"||mode==="slideshow";
  fileRef.current.click();
 };
 const putFiles=(list:FileList|null)=>{
  if(!editor||!list?.length||!intent.current)return;
  const {mode,mediaId,position}=intent.current;
  const files=Array.from(list);
  const currentFiles=rackRef.current?.querySelectorAll('input[type="file"]').length||0;
  if(currentFiles+files.length>6){setMessage("একবারে সর্বোচ্চ ৬টি নতুন ছবি। খসড়া সংরক্ষণের পর আরও ছবি যুক্ত করুন।");return;}
  if(files.some(f=>!ACCEPT.includes(f.type)||f.size>4*1024*1024)){setMessage("JPG, PNG, WebP বা AVIF দিন; ছবিপ্রতি সর্বোচ্চ ৪ MB।");return;}
  if(mode==="gallery"&&files.length!==2){setMessage("পাশাপাশি দুই ছবির জন্য ঠিক ২টি ছবি নির্বাচন করুন।");return;}
  if(mode==="slideshow"&&!mediaId&&files.length<2){setMessage("স্লাইডশোর জন্য অন্তত ২টি ছবি নির্বাচন করুন।");return;}
  if(files.length>12){setMessage("একটি স্লাইডশোতে সর্বোচ্চ ১২টি ছবি।");return;}
  const images=files.map(register);
  if(mediaId){
   let updated=false;
   editor.state.doc.descendants((node,pos)=>{
    if(node.type.name!=="newsMedia"||node.attrs.id!==mediaId)return true;
    const photos=(node.attrs.photos as NewsPhoto[])||[];
    if(photos.length+images.length>12){setMessage("একটি স্লাইডশোতে সর্বোচ্চ ১২টি ছবি।");return false;}
    editor.commands.command(({tr,dispatch})=>{
     tr.setNodeMarkup(pos,undefined,{...node.attrs,photos:[...photos,...images]});
     dispatch?.(tr);return true;
    });
    updated=true;return false;
   });
   if(!updated)setMessage("স্লাইডশো পাওয়া যায়নি।");
  }else{
   const node:NewsJSON={type:"newsMedia",attrs:{
    id:crypto.randomUUID(),mode,photos:images,text:"",width:"full",align:"center",layout:"image-left"
   }};
   editor.chain().focus().insertContentAt(position,node).run();
  }
  setMessage("ছবি যোগ হয়েছে। প্রতিটি ছবির নিচে সরাসরি ক্যাপশন লিখতে পারবেন।");
  intent.current=null;
 };
 const makeCallout=(kind:"highlight"|"quote")=>{
  if(!editor)return;
  const {from,to}=editor.state.selection;
  const selected=editor.state.doc.textBetween(from,to," ");
  const callout:NewsJSON={type:"newsCallout",attrs:{kind,borderColor:"#0b4838",credit:""},
   content:[{type:"paragraph",content:selected?[{type:"text",text:selected}]:[]}]};
  editor.chain().focus().insertContentAt({from,to},callout).run();
 };
 const applyPaint=()=>{
  if(!editor)return;
  const saved=paintRef.current;
  if(!saved||editor.state.selection.empty)return;
  paintRef.current=null;setPaintMode(false);
  let chain=editor.chain().focus().unsetAllMarks();
  if(saved.bold)chain=chain.setBold();
  if(saved.italic)chain=chain.setItalic();
  if(saved.underline)chain=chain.setUnderline();
  if(saved.strike)chain=chain.setStrike();
  if(saved.fontSize)chain=chain.setFontSize(saved.fontSize);
  if(saved.color)chain=chain.setColor(saved.color);
  chain.run();
  setMessage("নির্বাচিত লেখায় কপি করা ফরম্যাট প্রয়োগ হয়েছে। Ctrl+Z দিয়ে ফিরিয়ে নিতে পারবেন।");
 };
 const capturePaint=()=>{
  if(!editor)return;
  const style=editor.getAttributes("textStyle") as {fontSize?:string;color?:string};
  paintRef.current={
   bold:editor.isActive("bold"),italic:editor.isActive("italic"),underline:editor.isActive("underline"),
   strike:editor.isActive("strike"),fontSize:style.fontSize,color:style.color,
   heading:editor.isActive("heading")?Number(editor.getAttributes("heading").level||0):0
  };
  setPaintMode(true);setMessage("পেইন্ট ফরম্যাট চালু। এবার অন্য লেখা সিলেক্ট করুন।");
 };
 const copy=async(kind:"formatted"|"plain"|"markdown")=>{
  if(!editor)return;
  try{
   const plain=editor.getText({blockSeparator:"\n\n"});
   if(kind==="formatted"){
    await navigator.clipboard.write([new ClipboardItem({
     "text/html":new Blob([editor.getHTML()],{type:"text/html"}),
     "text/plain":new Blob([plain],{type:"text/plain"})
    })]);
   }else if(kind==="markdown"){
    await navigator.clipboard.writeText(plain.replace(/\n{3,}/g,"\n\n"));
   }else await navigator.clipboard.writeText(plain);
   setMessage("কপি করা হয়েছে।");
  }catch{setMessage("কপি করার জন্য ব্রাউজারের Clipboard অনুমতি প্রয়োজন।");}
  setCopyOpen(false);
 };
 const openLinkEditor=()=>{
  if(!editor)return;
  if(editor.isActive("link"))editor.chain().focus().extendMarkRange("link").run();
  const {from,to}=editor.state.selection;
  const selected=from<to?editor.state.doc.textBetween(from,to," "):"";
  const href=String(editor.getAttributes("link").href||"");
  linkRange.current={from,to,text:selected,href};
  setLinkText(selected);setLinkUrl(href);setLinkError("");setLinkOpen(true);
 };
 const normalizeHyperlink=(raw:string):string|null=>{
  const trimmed=raw.trim();
  if(!trimmed||trimmed.length>1200)return null;
  const absolute=/^https:\/\//i.test(trimmed)?trimmed:
   (/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}(?::\d+)?(?:[/?#][^\s]*)?$/i.test(trimmed)?"https://"+trimmed:null);
  if(!absolute)return null;
  try{
   const url=new URL(absolute);
   if(url.protocol!=="https:"||!url.hostname||url.username||url.password)return null;
   return url.href;
  }catch{return null;}
 };
 const saveHyperlink=()=>{
  if(!editor||!linkRange.current)return;
  const href=normalizeHyperlink(linkUrl),label=linkText.trim();
  if(!href){setLinkError("বৈধ HTTPS ওয়েব ঠিকানা দিন (যেমন https://example.com/news)।");return;}
  if(!label){setLinkError("হাইপারলিংকের জন্য আগে লেখা লিখুন বা নির্বাচন করুন।");return;}
  const {from,to,text}=linkRange.current;
  if(from<to&&text===label){
   editor.chain().focus().setTextSelection({from,to}).setLink({
    href,target:"_blank",rel:"noopener noreferrer nofollow"
   }).run();
  }else{
   editor.chain().focus().insertContentAt({from,to},{
    type:"text",text:label,
    marks:[{type:"link",attrs:{href,target:"_blank",rel:"noopener noreferrer nofollow"}}]
   }).run();
  }
  linkRange.current=null;setLinkOpen(false);setLinkError("");
  setMessage("হাইপারলিংক যুক্ত হয়েছে। সংবাদ সংরক্ষণ ও প্রিভিউতেও লিংক থাকবে।");
 };
 const removeHyperlink=()=>{
  const range=linkRange.current;
  if(!editor||!range||range.from===range.to)return;
  editor.chain().focus().setTextSelection({from:range.from,to:range.to}).unsetLink().run();
  setLinkOpen(false);linkRange.current=null;setLinkError("");
  setMessage("লিংক সরানো হয়েছে, লেখাটি অক্ষত আছে।");
 };
 const cancelHyperlink=()=>{
  setLinkOpen(false);linkRange.current=null;setLinkError("");
 };
 const showPreview=()=>{
  if(!editor)return;
  const form=rackRef.current?.closest("form");if(!form)return;
  const field=(name:string)=>(form.elements.namedItem(name) as HTMLInputElement|HTMLTextAreaElement|null)?.value||"";
  const category=form.elements.namedItem("category_id") as HTMLSelectElement|null;
  if(coverRef.current){URL.revokeObjectURL(coverRef.current);coverRef.current=null;}
  const mainFile=(form.elements.namedItem("image_file") as HTMLInputElement|null)?.files?.[0];
  const cover=mainFile?URL.createObjectURL(mainFile):initialCoverUrl;
  if(mainFile&&cover)coverRef.current=cover;
  setPreview({
   title:field("headline")||"সংবাদের শিরোনাম",summary:field("summary"),
   category:category?.selectedOptions[0]?.textContent||"সংবাদ",
   cover:cover||null,body:serializeNewsroomBody(editor.getJSON() as NewsJSON),
   sourceName:field("source_name"),sourceUrl:field("source_url")
  });
 };
 const restore=()=>{
  if(!editor)return;
  try{
   const saved=JSON.parse(sessionStorage.getItem(draftKey.current)||"null") as {value?:string}|null;
   if(!saved?.value)return;
   const {parseNewsroomBody}=requireNewsroomParser();
   const doc=parseNewsroomBody(saved.value);
   if(!doc)return;
   editor.commands.setContent(doc);
   setRestoreAvailable(false);setMessage("স্থানীয় খসড়া পুনরুদ্ধার হয়েছে।");
  }catch{setMessage("খসড়া পুনরুদ্ধার করা যায়নি।");}
 };
 return <section className="bw-nr-editor full-span" aria-label="Bengal Wave Professional Newsroom Editor">
  <div className="bw-nr-header">
   <div><h2>সম্পূর্ণ সংবাদ</h2><p>পুরো সংবাদ এক জায়গায় পেস্ট করুন। বাকি ফরম্যাটিং, ছবি ও স্লাইডশো এখানেই করুন।</p></div>
   <span>Newsroom Editor</span>
  </div>
  <div className="bw-nr-toolbar" role="toolbar" aria-label="সংবাদের ফরম্যাট">
   <button type="button" title="পূর্বাবস্থায়" onClick={()=>editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}>↶</button>
   <button type="button" title="পুনরায় করুন" onClick={()=>editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}>↷</button>
   <span className="bw-nr-sep"/>
   <select aria-label="অনুচ্ছেদের ধরন" value={editor?.isActive("heading",{level:2})?"h2":editor?.isActive("heading",{level:3})?"h3":"p"}
    onChange={e=>{
     if(e.target.value==="p")editor?.chain().focus().setParagraph().run();
     else editor?.chain().focus().toggleHeading({level:e.target.value==="h2"?2:3}).run();
    }}>
    <option value="p">সাধারণ লেখা</option><option value="h2">শিরোনাম</option><option value="h3">উপশিরোনাম</option>
   </select>
   <select aria-label="ফন্ট সাইজ" value={editor?.getAttributes("textStyle").fontSize||"20px"}
    onChange={e=>editor?.chain().focus().setFontSize(e.target.value).run()}>
    {fontSizes.map(size=><option value={size+"px"} key={size}>{size}px</option>)}
   </select>
   <span className="bw-nr-sep"/>
   <button type="button" aria-pressed={editor?.isActive("bold")} onClick={()=>editor?.chain().focus().toggleBold().run()}><b>B</b></button>
   <button type="button" aria-pressed={editor?.isActive("italic")} onClick={()=>editor?.chain().focus().toggleItalic().run()}><i>I</i></button>
   <button type="button" aria-pressed={editor?.isActive("underline")} onClick={()=>editor?.chain().focus().toggleUnderline().run()}><u>U</u></button>
   <button type="button" title="সব ফরম্যাট সরান" onClick={()=>editor?.chain().focus().unsetAllMarks().clearNodes().run()}>Tx</button>
   <button type="button" className={paintMode?"active":""} title="Google Docs-এর মতো পেইন্ট ফরম্যাট"
    onClick={()=>paintMode?setPaintMode(false):capturePaint()}>🖌</button>
   <label className="bw-nr-color" title="লেখার রং">
    <span>◉</span><input type="color" defaultValue="#173f32" onChange={e=>editor?.chain().focus().setColor(e.target.value).run()}/>
   </label>
   <button type="button" title="নির্বাচিত লেখায় হাইপারলিংক যুক্ত করুন (Ctrl+K)"
    aria-expanded={linkOpen} onMouseDown={e=>e.preventDefault()} onClick={openLinkEditor}>
     🔗 হাইপারলিংক
   </button>
   <button type="button" title="তালিকা" onClick={()=>editor?.chain().focus().toggleBulletList().run()}>☷</button>
   <span className="bw-nr-sep"/>
   <button type="button" className="bw-nr-primary" onClick={()=>promptPhotos("image")}>＋ ছবি</button>
   <button type="button" onClick={()=>promptPhotos("gallery")}>২ ছবি</button>
   <button type="button" onClick={()=>promptPhotos("split")}>ছবি ও লেখা</button>
   <button type="button" onClick={()=>promptPhotos("slideshow")}>▣ স্লাইডশো</button>
   <button type="button" onClick={()=>makeCallout("quote")}>❝ উদ্ধৃতি</button>
   <button type="button" onClick={()=>makeCallout("highlight")}>হাইলাইট</button>
   <span className="bw-nr-sep"/>
   <div className="bw-nr-copy-dropdown">
    <button type="button" onClick={()=>setCopyOpen(v=>!v)}>কপি ▾</button>
    {copyOpen&&<div className="bw-nr-copy-options">
     <button type="button" onClick={()=>{void copy("formatted");}}>ফরম্যাটসহ</button>
     <button type="button" onClick={()=>{void copy("plain");}}>Plain Text</button>
     <button type="button" onClick={()=>{void copy("markdown");}}>Markdown টেক্সট</button>
    </div>}
   </div>
   <button type="button" className="bw-nr-primary bw-nr-preview-action" onClick={showPreview}>◉ প্রকাশের আগে প্রিভিউ</button>
  </div>
  {linkOpen&&<div className="bw-nr-link-panel" role="group"
    aria-label="হাইপারলিংক যুক্ত বা সম্পাদনা করুন"
    onKeyDown={event=>{
     if(event.key==="Enter"){event.preventDefault();saveHyperlink();}
     if(event.key==="Escape"){event.preventDefault();cancelHyperlink();}
    }}>
   <label>লিংকে যে লেখা দেখাবে
    <input autoFocus value={linkText} onChange={e=>setLinkText(e.target.value)}
     placeholder="লিংকের লেখা" maxLength={400}/>
   </label>
   <label>ওয়েবসাইটের লিংক (HTTPS)
    <input type="text" inputMode="url" value={linkUrl} onChange={e=>setLinkUrl(e.target.value)}
     placeholder="https://example.com/news" maxLength={1200}/>
   </label>
   <button type="button" className="bw-nr-link-save" onClick={saveHyperlink}>লিংক যুক্ত / আপডেট</button>
   {linkRange.current?.href&&<button type="button" onClick={removeHyperlink}>লিংক সরান</button>}
   <button type="button" onClick={cancelHyperlink}>বাতিল</button>
   {linkError&&<p className="bw-nr-link-error" role="alert">{linkError}</p>}
  </div>}
  <div className="bw-nr-main"
   onKeyDown={event=>{
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){
     event.preventDefault();openLinkEditor();
    }
   }}
   onMouseUp={()=>{if(paintMode)applyPaint();}}>
   {editor?<EditorContent editor={editor}/>:<p className="bw-nr-loading">এডিটর প্রস্তুত হচ্ছে…</p>}
  </div>
  <input name="body" type="hidden" value={body} readOnly/>
  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif"
   className="bw-nr-hidden" aria-label="ছবি আপলোড"
   onChange={e=>{putFiles(e.target.files);e.target.value="";}}/>
  <div ref={rackRef} className="bw-nr-hidden" aria-hidden="true"/>
  <div className="bw-nr-footer">
   <span>{editor?.storage.characterCount?.characters?.()||editor?.getText().length||0} অক্ষর · Ctrl+Z Undo · ছবি ও গ্যালারিতে ক্লিক করে সম্পাদনা/ডিলিট</span>
   <span>প্রকাশের আগে প্রিভিউ দেখুন</span>
  </div>
  {restoreAvailable&&<div className="bw-nr-restore">
   <span>এই ব্রাউজারে আগের অসম্পূর্ণ ড্রাফট পাওয়া গেছে।</span>
   <button type="button" onClick={restore}>পুনরুদ্ধার</button>
   <button type="button" onClick={()=>{setRestoreAvailable(false);sessionStorage.removeItem(draftKey.current);}}>বাদ দিন</button>
  </div>}
  {message&&<p className="bw-nr-status" role="status">{message}</p>}
  {preview&&<div className="bw-doc-preview-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setPreview(null);}}>
   <div role="dialog" aria-modal="true" aria-label="সংবাদ প্রকাশের আগে প্রিভিউ" className="bw-doc-preview-modal">
    <div className="bw-doc-preview-head"><strong>অপ্রকাশিত সংবাদ প্রিভিউ</strong>
     <button type="button" onClick={()=>setPreview(null)}>✕ বন্ধ করুন</button>
    </div>
    <div className="bw-doc-preview-content bw-website">
     <article className="bw-article">
      <span className="bw-tag">{preview.category}</span><h1>{preview.title}</h1>
      {preview.summary&&<p className="bw-article-deck">{preview.summary}</p>}
      {preview.cover&&<figure className="bw-doc-preview-cover"><img src={preview.cover} alt="প্রধান ছবি"/></figure>}
      <NewsroomArticleBody body={preview.body} allowLocalImages/>
      <ArticleSource sourceName={preview.sourceName} sourceUrl={preview.sourceUrl}/>
     </article>
    </div>
   </div>
  </div>}
 </section>;
}
function requireNewsroomParser(){
 // Imported module is shared by SSR and browser, without dynamic network access.
 return {parseNewsroomBody:(raw:string)=>{
  if(!raw.startsWith("BW_NEWSROOM_V2\n"))return null;
  try{return JSON.parse(raw.slice("BW_NEWSROOM_V2\n".length)) as NewsJSON;}catch{return null;}
 }};
}
