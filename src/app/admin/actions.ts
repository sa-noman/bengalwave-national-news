"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireStaff} from "@/lib/auth/require-staff";
import {parseArticleInput} from "@/lib/validation/article";
import {isPreviewMediaEnabled,uploadNewsImage} from "@/lib/news-media";

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
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/latest");
  revalidatePath("/news/"+slug);
  revalidatePath("/category","layout");
}

export async function createDraft(formData:FormData) {
  const {supabase,user}=await requireStaff();
  const input=parseArticleInput(formData);
  if(!input) redirect("/admin/articles/new?error=validation");

  const file=getImageFile(formData);
  if(file&&!isPreviewMediaEnabled())
    redirect("/admin/articles/new?error=images-disabled");
  const {data,error}=await supabase.from("articles")
    .insert({...input,author_id:user.id,status:"draft"})
    .select("id").single();
  if(error || !data) redirect("/admin/articles/new?error=save");

  if(file){
    const upload=await uploadNewsImage(file,imageFields(formData,input.headline),user.id,supabase);
    if(!upload.ok){
      refreshArticle(input.slug);
      redirect("/admin/articles/"+data.id+"/edit?created=1&image_error="+upload.error);
    }
    const {error:imageUpdateError}=await supabase.from("articles")
      .update({hero_media_id:upload.mediaId}).eq("id",data.id);
    if(imageUpdateError){
      refreshArticle(input.slug);
      redirect("/admin/articles/"+data.id+"/edit?created=1&image_error=metadata");
    }
  }
  refreshArticle(input.slug);
  redirect("/admin/articles/"+data.id+"/edit?created=1");
}

export async function updateArticle(formData:FormData) {
  const {supabase,role,user}=await requireStaff();
  const id=String(formData.get("id")||"");
  if(!isUuid(id)) redirect("/admin?error=invalid");
  const intent=String(formData.get("intent")||"save");
  const input=parseArticleInput(formData);
  if(!input) redirect("/admin/articles/"+id+"/edit?error=validation");

  const {data:existing,error:fetchError}=await supabase.from("articles")
    .select("id,status,slug,published_at,category_id,author_id,hero_media_id")
    .eq("id",id).maybeSingle();
  if(fetchError || !existing) redirect("/admin?error=missing");

  const canEdit=editor(role);
  if(!canEdit && existing.status!=="draft") redirect("/admin?error=permission");

  let status=existing.status;
  let publishedAt=existing.published_at;
  if(intent==="submit" && existing.status==="draft") status="in_review";
  else if(intent==="approve" && canEdit &&
          ["draft","in_review"].includes(existing.status)) status="approved";
  else if(intent==="publish" && canEdit && existing.status==="approved") {
    if(input.body.length<30 || input.summary.length<10 || !input.category_id)
      redirect("/admin/articles/"+id+"/edit?error=publish");
    status="published";
    publishedAt=new Date().toISOString();
  }
  else if(intent==="unpublish" && canEdit && existing.status==="published")
    status="unpublished";
  else if(intent!=="save") redirect("/admin/articles/"+id+"/edit?error=transition");

  const file=getImageFile(formData);
  const remove=formData.get("remove_image")==="on";
  if(file&&!isPreviewMediaEnabled())
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

  const payload={
    ...input,
    status,
    published_at:publishedAt,
    hero_media_id:mediaId,
    ...(canEdit?{is_featured:formData.get("is_featured")==="on"}:{}),
  };
  const {error}=await supabase.from("articles").update(payload).eq("id",id);
  if(error) redirect("/admin/articles/"+id+"/edit?error=save");

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
  redirect("/admin/articles/"+id+"/edit?success=1");
}
