"use server";
import {revalidatePath,revalidateTag} from "next/cache";
import {redirect} from "next/navigation";
import {requireStaff} from "@/lib/auth/require-staff";
import {PUBLIC_NEWS_CACHE_TAG} from "@/lib/news-feed-cache";
import {parseArticleInput} from "@/lib/validation/article";
import {resolveStoryInlineImages} from "@/lib/story-inline-images";
import {newsroomPublishableText} from "@/lib/newsroom-document";
import {isPreviewMediaEnabled,isMediaUploadEnabled,uploadNewsImage} from "@/lib/news-media";

function isUuid(s:string) {return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);}
function editor(role:string) {return role==="owner" || role==="editor";}
function getImageFile(formData:FormData) {
  const file=formData.get("image_file");
  return file instanceof File && file.size>0 ? file : null;
}
function imageFields(formData:FormData,headline:string){
  return {
    alt:(String(formData.get("image_alt")||"").trim()||headline).slice(0,300),
    caption:String(formData.get("image_caption")||"").trim().slice(0,500),
    credit:String(formData.get("image_credit")||"").trim().slice(0,200),
  };
}
function refreshArticle(slug:string){
  // Public pages read published news through a tagged Data Cache.
  revalidateTag(PUBLIC_NEWS_CACHE_TAG);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/latest");
  revalidatePath("/news/"+slug);
  revalidatePath("/category","layout");
}

export async function createDraft(formData:FormData) {
  const {supabase,user,role}=await requireStaff();
  const input=parseArticleInput(formData);
  if(!input) redirect("/admin/articles/new?error=validation");

  const file=getImageFile(formData);
  if(file&&!isMediaUploadEnabled())
    redirect("/admin/articles/new?error=images-disabled");
  const rich=await resolveStoryInlineImages(input.body,formData,user.id,supabase);
  if(!rich.ok)redirect("/admin/articles/new?error=inline-image");
  const {data,error}=await supabase.from("articles")
    .insert({...input,body:rich.body,author_id:user.id,status:"draft",
      is_featured:editor(role)&&formData.get("is_featured")==="on"})
    .select("id").single();
  if(error || !data) redirect("/admin/articles/new?error=save");

  if(file){
    const upload=await uploadNewsImage(file,imageFields(formData,input.headline),user.id,supabase);
    if(!upload.ok){
      refreshArticle(input.slug);
      redirect("/admin/articles/"+data.id+"/edit?created=1&image_error="+upload.error);
    }
    const {data:linked,error:imageUpdateError}=await supabase.from("articles")
      .update({hero_media_id:upload.mediaId}).eq("id",data.id)
      .select("hero_media_id").maybeSingle();
    if(imageUpdateError||linked?.hero_media_id!==upload.mediaId){
      refreshArticle(input.slug);
      redirect("/admin/articles/"+data.id+"/edit?created=1&image_error=metadata");
    }
  }
  refreshArticle(input.slug);
  redirect("/admin/articles/"+data.id+"/edit?created=1");
}


/**
 * A single click publishes a new article with the selected photo.
 * The database permits only draft -> approved -> published transitions, so
 * perform those transitions explicitly, verifying every response. If image
 * upload fails the story stays a private, editable draft. It is NEVER
 * published without the image the editor selected.
 */
export async function createAndPublishArticle(formData:FormData){
  const {supabase,user,role}=await requireStaff();
  if(!editor(role)||isPreviewMediaEnabled()||process.env.VERCEL_ENV!=="production")
    redirect("/admin/articles/new?error=permission");

  const input=parseArticleInput(formData);
  if(!input||input.body.length<30||!newsroomPublishableText(input.body)||input.summary.length<10||!input.category_id)
    redirect("/admin/articles/new?error=publish-validation");

  const file=getImageFile(formData);
  if(file&&!isMediaUploadEnabled())
    redirect("/admin/articles/new?error=images-disabled");

  const rich=await resolveStoryInlineImages(input.body,formData,user.id,supabase);
  if(!rich.ok)redirect("/admin/articles/new?error=inline-image");
  const {data:created,error:createError}=await supabase.from("articles")
    .insert({
      ...input,body:rich.body,author_id:user.id,status:"draft",
      is_featured:formData.get("is_featured")==="on",
    })
    .select("id").single();
  if(createError||!created)
    redirect("/admin/articles/new?error=save");

  const editUrl="/admin/articles/"+created.id+"/edit";
  if(file){
    const photo=await uploadNewsImage(file,imageFields(formData,input.headline),user.id,supabase);
    if(!photo.ok){
      refreshArticle(input.slug);
      redirect(editUrl+"?error=image-required&image_error="+photo.error);
    }
    const {data:linked,error:linkError}=await supabase.from("articles")
      .update({hero_media_id:photo.mediaId})
      .eq("id",created.id)
      .select("hero_media_id").maybeSingle();
    if(linkError||linked?.hero_media_id!==photo.mediaId){
      refreshArticle(input.slug);
      redirect(editUrl+"?error=image-required&image_error=metadata");
    }
  }

  const {data:approved,error:approvalError}=await supabase.from("articles")
    .update({status:"approved"}).eq("id",created.id)
    .select("status").maybeSingle();
  if(approvalError||approved?.status!=="approved"){
    refreshArticle(input.slug);
    redirect(editUrl+"?error=approval");
  }

  // The database trigger sets the official publication timestamp.
  const {data:published,error:publishError}=await supabase.from("articles")
    .update({status:"published"}).eq("id",created.id)
    .select("status,published_at").maybeSingle();
  if(publishError||published?.status!=="published"||!published.published_at){
    refreshArticle(input.slug);
    redirect(editUrl+"?error=publish-step");
  }
  refreshArticle(input.slug);
  redirect("/news/"+input.slug);
}

/**
 * Each editorial action has its OWN server-action identity. Do not rely on a
 * submit button's name/value being included in multipart FormData: the form
 * can be re-rendered while a large photo uploads and drop the submitter.
 */
export async function updateArticle(formData:FormData){
  return changeArticle(formData,"save");
}
export async function submitArticleForReview(formData:FormData){
  return changeArticle(formData,"submit");
}
export async function approveArticle(formData:FormData){
  return changeArticle(formData,"approve");
}
export async function publishArticle(formData:FormData){
  return changeArticle(formData,"publish");
}
export async function unpublishArticle(formData:FormData){
  return changeArticle(formData,"unpublish");
}
type EditorialIntent="save"|"submit"|"approve"|"publish"|"unpublish";

async function changeArticle(formData:FormData,intent:EditorialIntent){
  const {supabase,role,user}=await requireStaff();
  const id=String(formData.get("id")||"");
  if(!isUuid(id)) redirect("/admin?error=invalid");
  const input=parseArticleInput(formData);
  if(!input) redirect("/admin/articles/"+id+"/edit?error=validation");

  const {data:existing,error:fetchError}=await supabase.from("articles")
    .select("id,status,slug,published_at,category_id,author_id,hero_media_id")
    .eq("id",id).maybeSingle();
  if(fetchError || !existing) redirect("/admin?error=missing");
  // Preview shares the article database with production. Never allow a
  // preview-only deployment to change a live published record or publish one.
  if(isPreviewMediaEnabled() &&
     (existing.status==="published" || intent==="publish" || intent==="unpublish"))
    redirect("/admin/articles/"+id+"/edit?error=preview-protected");

  const canEdit=editor(role);
  if(!canEdit && existing.status!=="draft") redirect("/admin?error=permission");

  let status=existing.status;
  let publishedAt=existing.published_at;
  if(intent==="submit" && existing.status==="draft") status="in_review";
  else if(intent==="approve" && canEdit &&
          ["draft","in_review"].includes(existing.status)) status="approved";
  else if(intent==="publish" && canEdit && existing.status==="approved") {
    if(input.body.length<30 || !newsroomPublishableText(input.body) || input.summary.length<10 || !input.category_id)
      redirect("/admin/articles/"+id+"/edit?error=publish");
    status="published";
    publishedAt=new Date().toISOString();
  }
  else if(intent==="unpublish" && canEdit && existing.status==="published")
    status="unpublished";
  else if(intent!=="save") redirect("/admin/articles/"+id+"/edit?error=transition");

  const file=getImageFile(formData);
  const remove=formData.get("remove_image")==="on";
  if(file&&!isMediaUploadEnabled())
    redirect("/admin/articles/"+id+"/edit?image_error=not_ready");

  let mediaId:string|null=existing.hero_media_id||null;
  if(file){
    const upload=await uploadNewsImage(file,imageFields(formData,input.headline),user.id,supabase);
    if(!upload.ok)
      redirect("/admin/articles/"+id+"/edit?image_error="+upload.error);
    mediaId=upload.mediaId;
  } else if(remove) {
    mediaId=null;
  }

  const rich=await resolveStoryInlineImages(input.body,formData,user.id,supabase);
  if(!rich.ok)redirect("/admin/articles/"+id+"/edit?error=inline-image");
  const payload={
    ...input,
    body:rich.body,
    status,
    published_at:publishedAt,
    hero_media_id:mediaId,
    ...(canEdit?{is_featured:formData.get("is_featured")==="on"}:{}),
  };
  // Check the RETURNED row, not just error=null. A row blocked by RLS
  // may update zero records without surfacing a database error.
  const {data:stored,error}=await supabase.from("articles")
    .update(payload).eq("id",id).select("id,status,hero_media_id").maybeSingle();
  if(error || !stored) redirect("/admin/articles/"+id+"/edit?error=save");
  if(stored.status!==status)
    redirect("/admin/articles/"+id+"/edit?error=transition");
  if((stored.hero_media_id||null)!==(mediaId||null))
    redirect("/admin/articles/"+id+"/edit?image_error=metadata");

  // Alt text, caption and credit can be revised without reuploading the photo.
  if(!file&&!remove&&mediaId){
    const fields=imageFields(formData,input.headline);
    const {error:mediaError}=await supabase.from("media_assets").update({
      alt_text:fields.alt,caption:fields.caption||null,credit:fields.credit||null,
    }).eq("id",mediaId);
    if(mediaError){
      refreshArticle(existing.slug);
      refreshArticle(input.slug);
      redirect("/admin/articles/"+id+"/edit?success=1&image_error=metadata");
    }
  }

  refreshArticle(existing.slug);
  refreshArticle(input.slug);
  const feedback:EditorialIntent=intent;
  redirect("/admin/articles/"+id+"/edit?success="+feedback);
}
