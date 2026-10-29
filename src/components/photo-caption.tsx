/**
 * The editor owns its complete photo-source text.
 * A credit entered as "ছবি: পিএমও" is rendered exactly as written;
 * a bare "পিএমও" is never automatically prefixed.
 */
export function getPhotoCaptionParts(caption?:string|null,credit?:string|null){
 let captionText=(caption||"").trim();
 let creditText=(credit||"").trim();
 // Old article captions sometimes contain a trailing credit. Suppress a
 // duplicate only when that embedded credit is identical to the credit field.
 const comparable=(value:string)=>value.trim().replace(/^(?:(?:ছবি|ফটো|photo)\s*[:：]\s*)+/giu,"").trim().toLocaleLowerCase();
 const standalone=/^(?:ছবি\s*[:：]\s*)+(.+)$/u.exec(captionText);
 if(standalone){
  if(!creditText){creditText=captionText;captionText="";}
  else if(comparable(standalone[1])===comparable(creditText))captionText="";
 }
 const embedded=/(?:\s*[|·•]\s*|\s+)(?:ছবি\s*[:：]\s*)+([^|·\n]+)\s*$/u.exec(captionText);
 if(embedded&&comparable(embedded[1])===comparable(creditText)){
  captionText=captionText.slice(0,embedded.index).trim();
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
  {creditText&&<span className={"bw-photo-caption-credit"+(captionText?"":" bw-photo-caption-credit--alone")}>{creditText}</span>}
 </figcaption>;
}
