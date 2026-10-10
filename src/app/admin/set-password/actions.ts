"use server";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {isSupabaseConfigured} from "@/lib/supabase/config";

export async function setInvitedPassword(formData:FormData) {
  if(!isSupabaseConfigured()) redirect("/admin/login?error=setup");
  const supabase=await createSupabaseServerClient();
  const {data:{user},error}=await supabase.auth.getUser();
  if(error || !user || !user.email_confirmed_at) redirect("/admin/login?error=invite");

  const password=String(formData.get("password")||"");
  const repeated=String(formData.get("confirm_password")||"");
  // Avoid passing password values in redirects or logging their contents.
  if(password.length<12 || password.length>128 || password!==repeated)
    redirect("/admin/set-password?error=password");

  const {error:changeError}=await supabase.auth.updateUser({password});
  if(changeError) redirect("/admin/set-password?error=update");
  // An already approved Owner/Editor should reach the dashboard immediately.
  // Only users without an active editorial role wait for approval.
  const {data:profile}=await supabase.from("profiles")
    .select("role,is_active").eq("id",user.id).maybeSingle();
  if(profile?.is_active && ["owner","editor","contributor"].includes(profile.role))
    redirect("/admin");
  redirect("/admin/awaiting-approval");
}
