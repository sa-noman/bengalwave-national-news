import {validateRichBody} from "@/lib/rich-article";
import {NEWSROOM_PREFIX,validateNewsroomBody} from "@/lib/newsroom-document";
export const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export type ArticleInput = {
  slug:string; headline:string; summary:string; body:string;
  category_id:string|null; source_name:string|null; source_url:string|null;
};
export function parseArticleInput(form:FormData):ArticleInput|null {
  const slug=String(form.get("slug")||"").trim().toLowerCase();
  const headline=String(form.get("headline")||"").trim();
  const summary=String(form.get("summary")||"").trim();
  const body=String(form.get("body")||"").trim();
  const category=String(form.get("category_id")||"").trim();
  const sourceName=String(form.get("source_name")||"").trim();
  const sourceUrl=String(form.get("source_url")||"").trim();
  if(!slugPattern.test(slug) || slug.length>150 ||
      headline.length<5 || headline.length>300 ||
      summary.length>700 || body.length>80000 || !(body.startsWith(NEWSROOM_PREFIX)?validateNewsroomBody(body,form):validateRichBody(body,form)) ||
      sourceName.length>150 || sourceUrl.length>1200) return null;
  if(category && !/^[0-9a-f-]{36}$/i.test(category)) return null;
  if(sourceUrl) {
    try {const parsed=new URL(sourceUrl);if(!["https:","http:"].includes(parsed.protocol)) return null;}
    catch {return null;}
  }
  return {slug,headline,summary,body,category_id:category||null,
    source_name:sourceName||null,source_url:sourceUrl||null};
}
