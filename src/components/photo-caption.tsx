/**
 * One consistent caption for hero and inline newsroom photos.
 * Photo credits may already start with "ছবি:"; never emit "ছবি: ছবি:".
 */
export function getPhotoCaptionParts(caption?:string|null,credit?:string|null){
 const normalizeCredit=(value:string)=>value.trim().replace(/^(?:(?:ছবি|ফটো|photo)\s*[:：]\s*)+/giu,"").trim();
 let captionText=(caption||"").trim();
 let creditText=normalizeCredit(credit||"");
 const standalone=/^(?:ছবি\s*[:：]\s*)+(.+)$/u.exec(captionText);
 if(standalone){
  const found=normalizeCredit(standalone[1]);
  if(found&&(!creditText||found.toLocaleLowerCase()===creditText.toLocaleLowerCase())){
   captionText="";if(!creditText)creditText=found;
  }
 }
 const embedded=/(?:\s*[|·•]\s*|\s+)(?:ছবি\s*[:：]\s*)+([^|·\n]+)\s*$/u.exec(captionText);
 if(embedded){
  const found=normalizeCredit(embedded[1]);
  if(found&&(!creditText||found.toLocaleLowerCase()===creditText.toLocaleLowerCase())){
   captionText=captionText.slice(0,embedded.index).trim();
   if(!creditText)creditText=found;
  }
 }
 return {captionText,creditText};
}
export function PhotoCaption({caption="",credit=""}:{
 caption?:string|null;credit?:string|null;
}){
 const {captionText,creditText}=getPhotoCaptionParts(caption,credit);
 if(!captionText&&!creditText)return null;
 return <figcaption className="bw-photo-caption">
  {captionText&&<span className="bw-photo-caption-text">{captionText}</span>}
  {creditText&&<span className={"bw-photo-caption-credit"+(captionText?"":" bw-photo-caption-credit--alone")}>ছবি: {creditText}</span>}
 </figcaption>;
}
