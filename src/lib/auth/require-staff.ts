import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CmsRole = "owner" | "editor" | "contributor";

export async function requireStaff() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/admin/login");
  const {data:profile,error}=await supabase
    .from("profiles").select("role,is_active,display_name")
    .eq("id",user.id).maybeSingle();

  if (error || !profile?.is_active ||
     !["owner","editor","contributor"].includes(profile.role)) {
    redirect("/admin/access-denied");
  }
  // Enforce a verified second factor on every privileged CMS request.
  // Keep /admin/mfa reachable at aal1 so editors can enroll and recover.
  // The database applies the same aal2 requirement to direct PostgREST calls.
  if(profile.role==="owner"||profile.role==="editor"){
    const {data:aal,error:aalError}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if(aalError||aal.currentLevel!=="aal2")redirect("/admin/mfa");
  }
  return {supabase,user,role:profile.role as CmsRole, displayName:profile.display_name};
}

export async function requireEditor() {
  const session=await requireStaff();
  if(session.role!=="owner" && session.role!=="editor") redirect("/admin");
  return session;
}
