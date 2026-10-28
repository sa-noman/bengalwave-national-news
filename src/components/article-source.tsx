/** Shared, safe and subdued attribution for published and editorial previews. */
export function ArticleSource({sourceName,sourceUrl}:{
  sourceName?:string|null;sourceUrl?:string|null;
}){
 const label=sourceName?.trim();
 if(!label)return null;
 let href:string|null=null;
 if(sourceUrl){
  try{
   const url=new URL(sourceUrl);
   if((url.protocol==="https:"||url.protocol==="http:")&&!url.username&&!url.password)href=url.href;
  }catch{}
 }
 return <div className="bw-article-source">
  সূত্র: {href?<a href={href} target="_blank" rel="noopener noreferrer nofollow">{label}</a>:<span>{label}</span>}
 </div>;
}
