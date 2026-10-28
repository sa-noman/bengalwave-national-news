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
  // A stolen aal1 session must not silently replace the password of a staff
  // member who enrolled MFA. Invited users with no factor (nextLevel aal1)
  // can still set their first password.
  const {data:aal,error:aalError}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if(aalError || !aal || (aal.nextLevel==="aal2" && aal.currentLevel!=="aal2")) redirect("/admin/mfa");

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
