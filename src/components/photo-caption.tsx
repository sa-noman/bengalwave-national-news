/**
 * One consistent caption for hero and inline newsroom photos.
 * The CMS credit can already contain "ছবি:"; avoid "ছবি: ছবি:".
 */
export function PhotoCaption({caption="",credit=""}:{
 caption?:string|null;credit?:string|null;
}){
 const normalizeCredit=(value:string)=>value.trim().replace(/^(?:(?:ছবি|ফটো|photo)\s*[:：]\s*)+/giu,"").trim();
 let captionText=(caption||"").trim();
 let creditText=normalizeCredit(credit||"");
 // Some older articles store a credit at the end of the caption itself.
 // Separate it so the green divider and attribution are rendered only once.
 const embedded=/(?:\s*[|·•]\s*|\s+)(?:ছবি\s*[:：]\s*)+([^|·\n]+)\s*$/u.exec(captionText);
 if(embedded){
  const found=normalizeCredit(embedded[1]);
  if(found&&(!creditText||found.toLocaleLowerCase()===creditText.toLocaleLowerCase())){
   captionText=captionText.slice(0,embedded.index).trim();
   if(!creditText)creditText=found;
  }
 }
 if(!captionText&&!creditText)return null;
 return <figcaption className="bw-photo-caption">
  {captionText&&<span className="bw-photo-caption-text">{captionText}</span>}
  {creditText&&<span className={"bw-photo-caption-credit"+(captionText?"":" bw-photo-caption-credit--alone")}>ছবি: {creditText}</span>}
 </figcaption>;
}
