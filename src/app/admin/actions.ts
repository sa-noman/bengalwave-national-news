"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireStaff} from "@/lib/auth/require-staff";
import {parseArticleInput} from "@/lib/validation/article";

function isUuid(s:string) {return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);}
function editor(role:string) {return role==="owner" || role==="editor";}

export async function createDraft(formData:FormData) {
  const {supabase,user}=await requireStaff();
  const input=parseArticleInput(formData);
  if(!input) redirect("/admin/articles/new?error=validation");
  const {data,error}=await supabase.from("articles")
    .insert({...input,author_id:user.id,status:"draft"})
    .select("id").single();
  if(error || !data) redirect("/admin/articles/new?error=save");
  revalidatePath("/admin");
  redirect("/admin/articles/"+data.id+"/edit?created=1");
}

export async function updateArticle(formData:FormData) {
  const {supabase,role}=await requireStaff();
  const id=String(formData.get("id")||"");
  if(!isUuid(id)) redirect("/admin?error=invalid");
  const intent=String(formData.get("intent")||"save");
  const input=parseArticleInput(formData);
  if(!input) redirect("/admin/articles/"+id+"/edit?error=validation");

  const {data:existing,error:fetchError}=await supabase.from("articles")
    .select("id,status,slug,published_at,category_id,author_id")
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

  const payload={
    ...input,
    status,
    published_at:publishedAt,
    ...(canEdit?{is_featured:formData.get("is_featured")==="on"}:{}),
  };
  const {error}=await supabase.from("articles").update(payload).eq("id",id);
  if(error) redirect("/admin/articles/"+id+"/edit?error=save");

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/latest");
  revalidatePath("/news/"+existing.slug);
  revalidatePath("/news/"+input.slug);
  revalidatePath("/category","layout");
  redirect("/admin/articles/"+id+"/edit?success=1");
}
