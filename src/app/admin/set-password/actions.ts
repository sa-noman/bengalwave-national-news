"use server";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {isSupabaseConfigured} from "@/lib/supabase/config";
import {isKnownCompromisedPassword} from "@/lib/auth/password-leak-check";

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

  const compromised=await isKnownCompromisedPassword(password);
  if(compromised===true)redirect("/admin/set-password?error=compromised");
  const {error:changeError}=await supabase.auth.updateUser({password});
  if(changeError) redirect("/admin/set-password?error=update");
  // The dashboard separately enforces the user's active editorial role.
  // This action never assigns privileges to the user.
  redirect("/admin");
}
