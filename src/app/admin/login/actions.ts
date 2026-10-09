"use server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signIn(formData:FormData) {
  if(!isSupabaseConfigured()) redirect("/admin/login?error=setup");
  const email=String(formData.get("email")||"").trim();
  const password=String(formData.get("password")||"");
  if(!email || !password) redirect("/admin/login?error=credentials");
  const supabase=await createSupabaseServerClient();
  const {error}=await supabase.auth.signInWithPassword({email,password});
  if(error) redirect("/admin/login?error=credentials");
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login?error=credentials");
  const {data:profile}=await supabase.from("profiles")
    .select("is_active,role").eq("id",user.id).maybeSingle();
  if(!profile?.is_active || !["owner","editor","contributor"].includes(profile.role)){
    await supabase.auth.signOut();
    redirect("/admin/login?error=access");
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase=await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
